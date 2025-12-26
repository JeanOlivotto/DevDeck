import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  constructor(private readonly httpService: HttpService) {}

  async sendNotification(webhookUrl: string, content: string): Promise<void> {
    if (!webhookUrl) return;

    try {
      // O Discord aceita um JSON simples com a chave 'content'
      await lastValueFrom(
        this.httpService.post(webhookUrl, {
          content: content,
          username: 'DevDeck Bot',
          avatar_url: 'https://i.imgur.com/8Fk7t7D.png', // Opcional: ícone do bot
        }),
      );
      this.logger.log(`Notificação enviada para o Discord com sucesso.`);
    } catch (error) {
      this.logger.error(
        `Falha ao enviar notificação para o Discord: ${error.message}`,
      );
    }
  }
}
