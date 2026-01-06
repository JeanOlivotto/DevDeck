import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Rota de teste para disparar resumo diário manualmente
  @UseGuards(JwtAuthGuard)
  @Post('test/daily-summary')
  async testDailySummary() {
    await this.notificationService.handleDailySummary();
    return { message: 'Resumo diário disparado com sucesso!' };
  }

  // Rota de teste para verificar tarefas paradas
  @UseGuards(JwtAuthGuard)
  @Post('test/stale-tasks')
  async testStaleTasks() {
    await this.notificationService.handleStaleTasks();
    return { message: 'Verificação de tarefas paradas disparada!' };
  }
}
