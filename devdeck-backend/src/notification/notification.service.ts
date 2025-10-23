/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private emailService: EmailService, // Injete o EmailService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM) // Todo dia às 8h
  async handleDailySummary() {
    this.logger.log('Rodando resumo diário...');

    // 1. Busca usuários que querem esta notificação
    const usersToNotify = await this.prisma.user.findMany({
      where: { notifyDailySummary: true }, // <-- Filtra pelas config
    });

    for (const user of usersToNotify) {
      const pendingTasks = await this.prisma.task.findMany({
        where: {
          status: { not: 'DONE' },
          board: { userId: user.id },
        },
        include: { board: true },
      });

      if (pendingTasks.length > 0) {
        let messageText = `Olá ${user.name}!\n\nVocê tem ${pendingTasks.length} tarefas pendentes hoje:\n\n`;
        pendingTasks.forEach((task) => {
          messageText += `• [${task.board.name}] ${task.title} (${task.status})\n`;
        });

        this.logger.log(`Enviando resumo diário para ${user.email}`);
        await this.emailService.sendEmail(
          user.email,
          'Seu Resumo Diário - DevDeck',
          messageText,
        );
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
        // Filtra direto no banco por usuários que querem a notificação
        board: {
          user: {
            notifyStaleTasks: true,
          },
        },
      },
      include: { board: { include: { user: true } } },
    });

    for (const task of tasksToNotify) {
      const user = task.board.user;
      const messageText = `Atenção, ${user.name}!\n\nA tarefa "${task.title}" no quadro "${task.board.name}" está em "Doing" há mais de 2 dias.`;

      this.logger.log(
        `Notificando ${user.email} sobre tarefa parada: ${task.title}`,
      );
      await this.emailService.sendEmail(
        user.email,
        `Tarefa Parada: ${task.title}`,
        messageText,
      );

      // Atualizar a tarefa para não notificar de novo (evitar spam)
      await this.prisma.task.update({
        where: { id: task.id },
        data: { updatedAt: new Date() },
      });
    }
  }
}
