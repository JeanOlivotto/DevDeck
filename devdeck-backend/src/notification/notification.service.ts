import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { DiscordService } from '../discord/discord.service';
import { User } from '@prisma/client';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private discordService: DiscordService,
  ) {}

  // CORREÇÃO: Agora aceita 'string | null' para não quebrar se o usuário não configurou
  private isTodayAllowed(userDays: string | null): boolean {
    if (!userDays) return true; // Se não configurado, permite envio (comportamento padrão)
    const today = new Date().getDay().toString(); // 0=Dom, 1=Seg...
    return userDays.split(',').includes(today);
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleDailySummary() {
    this.logger.log('Rodando resumo diário...');

    // Busca usuários que querem receber notificações por email
    const users = await this.prisma.user.findMany({
      where: { notifyDailySummary: true },
      include: {
        groupMembers: {
          where: { inviteStatus: 'accepted' },
          select: { groupId: true },
        },
      },
    });

    for (const user of users) {
      if (!this.isTodayAllowed(user.notificationDays)) continue;

      const groupIds = user.groupMembers.map((gm) => gm.groupId);

      const pendingTasks = await this.prisma.ticket.findMany({
        where: {
          status: { not: 'DONE' },
          board: {
            OR: [
              { userId: user.id, type: 'personal' },
              { groupId: { in: groupIds }, type: 'group' },
            ],
          },
        },
        include: { board: true },
        orderBy: { createdAt: 'asc' },
      });

      if (pendingTasks.length > 0) {
        // Agrupa tarefas por board para enviar notificações no canal correto
        const tasksByBoard = new Map<number, any[]>();

        pendingTasks.forEach((task) => {
          if (!tasksByBoard.has(task.boardId)) {
            tasksByBoard.set(task.boardId, []);
          }
          tasksByBoard.get(task.boardId)!.push(task);
        });

        // Envia email geral com resumo de todos os boards
        let emailText = `Olá ${user.name}!\n\nVocê tem ${pendingTasks.length} tarefa(s) pendente(s) hoje:\n`;
        pendingTasks.forEach((task) => {
          const prefix =
            task.board.type === 'group' ? '[👥 Grupo]' : '[👤 Pessoal]';
          emailText += `• ${prefix} [${task.board.name}] ${task.title} (${task.status})\n`;
        });

        if (user.notifyDailySummary) {
          this.emailService
            .sendEmail(user.email, 'Seu Resumo Diário - DevDeck', emailText)
            .catch((e) => this.logger.error(`Erro email ${user.email}`, e));
        }

        // Envia para Discord - uma notificação por board no canal configurado
        for (const [boardId, tasks] of tasksByBoard.entries()) {
          const board = tasks[0].board;

          if (board.discordWebhook) {
            let discordText = `**📋 ${board.name}** - Resumo de Tarefas\n\n`;
            discordText += `**${tasks.length}** tarefa(s) pendente(s):\n`;

            tasks.forEach((task) => {
              discordText += `• ${task.title} (${task.status})\n`;
            });

            this.discordService
              .sendNotification(board.discordWebhook, discordText)
              .catch((e) =>
                this.logger.error(`Erro Discord board ${board.name}`, e),
              );
          }
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleStaleTasks() {
    this.logger.log('Verificando tarefas paradas...');
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const staleTasks = await this.prisma.ticket.findMany({
      where: {
        status: 'DOING',
        updatedAt: { lt: twoDaysAgo },
      },
      include: {
        board: {
          include: {
            user: true,
            group: {
              include: {
                members: { include: { user: true } },
              },
            },
          },
        },
      },
    });

    // Agrupa tarefas por board para enviar no canal correto
    const tasksByBoard = new Map<number, any[]>();
    const notificationsMap = new Map<number, { user: User; tasks: any[] }>();

    for (const task of staleTasks) {
      // Agrupa por board para Discord
      if (!tasksByBoard.has(task.boardId)) {
        tasksByBoard.set(task.boardId, []);
      }
      tasksByBoard.get(task.boardId)!.push(task);

      // Agrupa por usuário para Email
      const potentialUsers: User[] = [];

      if (task.board.type === 'personal' && task.board.user) {
        potentialUsers.push(task.board.user);
      } else if (task.board.type === 'group' && task.board.group) {
        potentialUsers.push(...task.board.group.members.map((m) => m.user));
      }

      for (const u of potentialUsers) {
        if (u.notifyStaleTasks) {
          if (!notificationsMap.has(u.id)) {
            notificationsMap.set(u.id, { user: u, tasks: [] });
          }
          const entry = notificationsMap.get(u.id);
          if (entry && !entry.tasks.find((t) => t.id === task.id)) {
            entry.tasks.push(task);
          }
        }
      }
    }

    // Envia notificações por Email (agrupadas por usuário)
    for (const { user, tasks } of notificationsMap.values()) {
      if (!this.isTodayAllowed(user.notificationDays)) continue;

      let messageText = `⚠️ Atenção, ${user.name}!\n\nTarefas paradas há mais de 2 dias:\n`;
      tasks.forEach((task) => {
        const boardInfo =
          task.board.type === 'group'
            ? `[👥 ${task.board.name}]`
            : `[👤 ${task.board.name}]`;
        messageText += `• ${boardInfo} ${task.title}\n`;
      });

      if (user.notifyStaleTasks) {
        this.emailService
          .sendEmail(user.email, 'Alerta: Tarefas Paradas', messageText)
          .catch((e) => this.logger.error(`Erro email stale ${user.email}`, e));
      }
    }

    // Envia notificações por Discord (agrupadas por board/canal)
    for (const [boardId, tasks] of tasksByBoard.entries()) {
      const board = tasks[0].board;

      if (board.discordWebhook) {
        let discordText = `⚠️ **Alerta - ${board.name}**\n\n`;
        discordText += `**${tasks.length}** tarefa(s) parada(s) há mais de 2 dias:\n`;

        tasks.forEach((task) => {
          discordText += `• ${task.title}\n`;
        });

        this.discordService
          .sendNotification(board.discordWebhook, discordText)
          .catch((e) =>
            this.logger.error(`Erro Discord stale board ${board.name}`, e),
          );
      }
    }

    if (staleTasks.length > 0) {
      await this.prisma.ticket.updateMany({
        where: { id: { in: staleTasks.map((t) => t.id) } },
        data: { updatedAt: new Date() },
      });
    }
  }
}
