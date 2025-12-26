import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { DiscordService } from '../discord/discord.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private discordService: DiscordService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleDailySummary() {
    this.logger.log('Rodando resumo diário...');
    // Busca usuários que querem resumo E (têm email ativo OU têm discord configurado)
    const usersToNotify = await this.prisma.user.findMany({
      where: {
        notifyDailySummary: true,
      },
    });

    for (const user of usersToNotify) {
      const pendingTasks = await this.prisma.task.findMany({
        where: { status: { not: 'DONE' }, board: { userId: user.id } },
        include: { board: true },
        orderBy: { createdAt: 'asc' },
      });

      if (pendingTasks.length > 0) {
        let messageText = `**Olá ${user.name}!** 👋\n\nVocê tem **${pendingTasks.length}** tarefa(s) pendente(s) hoje:\n`;
        pendingTasks.forEach((task) => {
          messageText += `• [${task.board.name}] ${task.title} (${task.status})\n`;
        });

        // Envia Email
        if (user.notifyDailySummary) {
          // Versão HTML simplificada para email (opcional tratar diferente)
          this.emailService
            .sendEmail(
              user.email,
              'Seu Resumo Diário - DevDeck',
              messageText.replace(/\*\*/g, ''),
            )
            .catch((e) => this.logger.error(`Erro email ${user.email}`, e));
        }

        // Envia Discord
        if (user.discordWebhook) {
          this.discordService
            .sendNotification(user.discordWebhook, messageText)
            .catch((e) => this.logger.error(`Erro Discord ${user.email}`, e));
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleStaleTasks() {
    this.logger.log('Verificando tarefas paradas...');
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    // Busca tarefas onde o DONO do board quer notificações
    const tasksToNotify = await this.prisma.task.findMany({
      where: {
        status: 'DOING',
        updatedAt: { lt: twoDaysAgo },
        board: {
          user: {
            notifyStaleTasks: true,
          },
        },
      },
      include: { board: { include: { user: true } } },
    });

    // Agrupa por usuário
    const notificationsByUser = new Map<number, { user: any; tasks: any[] }>();

    for (const task of tasksToNotify) {
      const user = task.board.user;
      if (!user) continue;

      const entry = notificationsByUser.get(user.id);
      if (!entry) {
        notificationsByUser.set(user.id, { user, tasks: [task] });
      } else {
        entry.tasks.push(task);
      }
    }

    // Envia as notificações
    for (const { user, tasks } of notificationsByUser.values()) {
      let messageText = `⚠️ **Atenção, ${user.name}!**\n\nAs seguintes tarefas estão em "Doing" há mais de 2 dias:\n`;
      tasks.forEach((task) => {
        messageText += `• [${task.board.name}] ${task.title}\n`;
      });

      // Email
      if (user.notifyStaleTasks) {
        this.emailService
          .sendEmail(
            user.email,
            `Alerta: Tarefas Paradas`,
            messageText.replace(/\*\*/g, ''),
          )
          .catch((e) => this.logger.error(`Erro email stale ${user.email}`, e));
      }

      // Discord
      if (user.discordWebhook) {
        this.discordService
          .sendNotification(user.discordWebhook, messageText)
          .catch((e) =>
            this.logger.error(`Erro Discord stale ${user.email}`, e),
          );
      }

      // Atualiza data para não notificar de novo na próxima hora
      const taskIds = tasks.map((t) => t.id);
      await this.prisma.task.updateMany({
        where: { id: { in: taskIds } },
        data: { updatedAt: new Date() },
      });
    }
  }
}
