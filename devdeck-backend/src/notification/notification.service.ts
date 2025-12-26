import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleDailySummary() {
    this.logger.log('Rodando resumo diário...');
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
        let messageText = `Olá ${user.name}!\n\nVocê tem ${pendingTasks.length} tarefa(s) pendente(s) hoje:\n\n`;
        pendingTasks.forEach((task) => {
          messageText += `• [${task.board.name}] ${task.title} (${task.status})\n`;
        });

        if (user.notifyDailySummary) {
          this.logger.log(
            `Enviando resumo diário por EMAIL para ${user.email}`,
          );
          this.emailService
            .sendEmail(user.email, 'Seu Resumo Diário - DevDeck', messageText)
            .catch((e) =>
              this.logger.error(`Falha ao enviar email para ${user.email}`, e),
            );
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleStaleTasks() {
    this.logger.log('Verificando tarefas paradas...');
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
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

    const notificationsByUser = new Map<
      number,
      {
        user: NonNullable<(typeof tasksToNotify)[0]['board']['user']>;
        tasks: typeof tasksToNotify;
      }
    >();
    for (const task of tasksToNotify) {
      const userId = task.board.userId;
      if (userId && !notificationsByUser.has(userId)) {
        if (task.board.user) {
          notificationsByUser.set(userId, { user: task.board.user, tasks: [] });
        }
      }
      if (userId) {
        notificationsByUser.get(userId)!.tasks.push(task);
      }
    }

    for (const [, { user, tasks }] of notificationsByUser) {
      if (!user) continue;
      let messageText = `Atenção, ${user.name}!\n\nAs seguintes tarefas estão em "Doing" há mais de 2 dias:\n\n`;
      tasks.forEach((task) => {
        messageText += `• [${task.board.name}] ${task.title}\n`;
      });

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

      const taskIdsToUpdate = tasks.map((t) => t.id);
      await this.prisma.task.updateMany({
        where: { id: { in: taskIdsToUpdate } },
        data: { updatedAt: new Date() },
      });
    }
  }
}
