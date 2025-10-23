/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { WhatsappService } from '../whatsapp/whatsapp.service'; // Importar WhatsappService

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private whatsappService: WhatsappService, // Injetar WhatsappService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM) // Ou ajuste o horário
  async handleDailySummary() {
    this.logger.log('Rodando resumo diário...');

    const usersToNotify = await this.prisma.user.findMany({
      where: {
        OR: [
          { notifyDailySummary: true },
          { notifyViaWhatsApp: true }, // Inclui usuários que querem via WhatsApp
        ],
      },
    });

    for (const user of usersToNotify) {
      // Pega tarefas independentemente da preferência de notificação primeiro
      const pendingTasks = await this.prisma.task.findMany({
        where: {
          status: { not: 'DONE' },
          board: { userId: user.id },
        },
        include: { board: true },
        orderBy: { createdAt: 'asc' }, // Ordena para consistência
      });

      if (pendingTasks.length > 0) {
        let messageText = `Olá ${user.name}!\n\nVocê tem ${pendingTasks.length} tarefa(s) pendente(s) hoje:\n\n`;
        pendingTasks.forEach((task) => {
          messageText += `• [${task.board.name}] ${task.title} (${task.status})\n`;
        });

        // Enviar Email se habilitado
        if (user.notifyDailySummary) {
          // Verifica a preferência de email
          this.logger.log(
            `Enviando resumo diário por EMAIL para ${user.email}`,
          );
          this.emailService
            .sendEmail(user.email, 'Seu Resumo Diário - DevDeck', messageText)
            .catch((e) =>
              this.logger.error(`Falha ao enviar email para ${user.email}`, e),
            ); // Adiciona catch
        }

        // Enviar WhatsApp se habilitado e número existir
        if (user.notifyViaWhatsApp && user.whatsappNumber) {
          this.logger.log(
            `Enviando resumo diário por WHATSAPP para ${user.whatsappNumber}`,
          );
          try {
            await this.whatsappService.sendMessage(
              user.id,
              user.whatsappNumber,
              messageText,
            );
          } catch (error) {
            this.logger.error(
              `Falha ao enviar WhatsApp para ${user.whatsappNumber} (User ID: ${user.id}): ${error.message}`,
            );
            // Considerar notificar o usuário por outro meio sobre a falha ou desativar temporariamente
          }
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_HOUR) // Ou ajuste a frequência
  async handleStaleTasks() {
    this.logger.log('Verificando tarefas paradas...');
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const tasksToNotify = await this.prisma.task.findMany({
      where: {
        status: 'DOING',
        updatedAt: { lt: twoDaysAgo },
        board: {
          user: {
            // Notifica se qualquer uma das opções estiver ativa
            OR: [
              { notifyStaleTasks: true },
              { notifyViaWhatsApp: true }, // Para pegar o número se for enviar via WhatsApp
            ],
          },
        },
      },
      include: { board: { include: { user: true } } },
    });

    // Agrupa tarefas por usuário para enviar uma única mensagem por usuário
    const notificationsByUser = new Map<
      number,
      {
        user: (typeof tasksToNotify)[0]['board']['user'];
        tasks: typeof tasksToNotify;
      }
    >();

    for (const task of tasksToNotify) {
      const userId = task.board.userId;
      if (!notificationsByUser.has(userId)) {
        notificationsByUser.set(userId, { user: task.board.user, tasks: [] });
      }
      notificationsByUser.get(userId)!.tasks.push(task);
    }

    for (const [, { user, tasks }] of notificationsByUser) {
      let messageText = `Atenção, ${user.name}!\n\nAs seguintes tarefas estão em "Doing" há mais de 2 dias:\n\n`;
      tasks.forEach((task) => {
        messageText += `• [${task.board.name}] ${task.title}\n`;
      });

      // Enviar Email se habilitado
      if (user.notifyStaleTasks) {
        this.logger.log(
          `Notificando ${user.email} (EMAIL) sobre ${tasks.length} tarefa(s) parada(s).`,
        );
        this.emailService
          .sendEmail(
            user.email,
            `Alerta: ${tasks.length} Tarefa(s) Parada(s) - DevDeck`,
            messageText,
          )
          .catch((e) =>
            this.logger.error(
              `Falha ao enviar email (stale) para ${user.email}`,
              e,
            ),
          );
      }

      // Enviar WhatsApp se habilitado E número existir
      if (user.notifyViaWhatsApp && user.whatsappNumber) {
        this.logger.log(
          `Notificando ${user.whatsappNumber} (WHATSAPP) sobre ${tasks.length} tarefa(s) parada(s).`,
        );
        try {
          await this.whatsappService.sendMessage(
            user.id,
            user.whatsappNumber,
            messageText,
          );
        } catch (error) {
          this.logger.error(
            `Falha ao enviar WhatsApp (stale) para ${user.whatsappNumber} (User ID: ${user.id}): ${error.message}`,
          );
        }
      }

      // Atualiza TODAS as tarefas notificadas para evitar spam na próxima hora
      const taskIdsToUpdate = tasks.map((t) => t.id);
      await this.prisma.task.updateMany({
        where: { id: { in: taskIdsToUpdate } },
        data: { updatedAt: new Date() }, // Atualiza o timestamp
      });
    }
  }
}
