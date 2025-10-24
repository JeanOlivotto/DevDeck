/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  Logger,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Pusher from 'pusher';
import { WhatsappService } from './whatsapp.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WhatsappGateway {
  private readonly logger = new Logger(WhatsappGateway.name);
  private pusher: Pusher;

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => WhatsappService))
    private whatsappService: WhatsappService,
    private prisma: PrismaService,
  ) {
    // Inicializar Pusher
    const appId = this.configService.get<string>('PUSHER_APP_ID');
    const key = this.configService.get<string>('PUSHER_KEY');
    const secret = this.configService.get<string>('PUSHER_SECRET');
    const cluster = this.configService.get<string>('PUSHER_CLUSTER');

    if (!appId || !key || !secret || !cluster) {
      this.logger.error('Credenciais Pusher não configuradas no .env!');
      throw new Error('Pusher não configurado');
    }

    this.pusher = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });

    this.logger.log(`Pusher inicializado no cluster: ${cluster}`);
  }

  // Método para enviar QR Code
  sendQrToUser(userId: number, qrDataUrl: string) {
    this.logger.log(`Enviando QR Code para usuário ${userId} via Pusher`);

    if (!qrDataUrl || !qrDataUrl.startsWith('data:image/png;base64,')) {
      this.logger.warn(`QR Data URL inválida para usuário ${userId}`);
      return;
    }

    this.pusher
      .trigger(`private-user-${userId}`, 'whatsapp_qr_code', {
        qr: qrDataUrl,
      })
      .then(() => {
        this.logger.log(`QR Code enviado com sucesso para ${userId}`);
      })
      .catch((error) => {
        this.logger.error(
          `Erro ao enviar QR via Pusher para ${userId}:`,
          error,
        );
      });
  }

  // Método para enviar status
  sendStatusUpdate(
    userId: number,
    status:
      | 'connecting'
      | 'open'
      | 'close'
      | 'request_qr'
      | 'error'
      | 'logged_out',
  ) {
    this.logger.log(`Enviando status '${status}' para usuário ${userId}`);

    this.pusher
      .trigger(`private-user-${userId}`, 'whatsapp_status_update', {
        status,
      })
      .then(() => {
        this.logger.log(`Status '${status}' enviado para ${userId}`);
      })
      .catch((error) => {
        this.logger.error(
          `Erro ao enviar status via Pusher para ${userId}:`,
          error,
        );
      });
  }

  // Endpoints HTTP para substituir os eventos WebSocket

  async handleConnectRequest(userId: number) {
    this.logger.log(`Solicitação de conexão WhatsApp do usuário ${userId}`);

    try {
      await this.whatsappService.initializeSocketForUser(userId);
      return { success: true, message: 'Iniciando conexão...' };
    } catch (error) {
      this.logger.error(
        `Erro ao iniciar conexão para ${userId}:`,
        (error as Error).stack,
      );
      throw new BadRequestException('Falha ao iniciar conexão WhatsApp');
    }
  }

  async handleDisconnectRequest(userId: number) {
    this.logger.log(`Solicitação de desconexão WhatsApp do usuário ${userId}`);

    try {
      await this.whatsappService.disconnectUser(userId);
      return { success: true, message: 'Desconectando...' };
    } catch (error) {
      this.logger.error(
        `Erro ao desconectar ${userId}:`,
        (error as Error).stack,
      );
      throw new BadRequestException(
        (error as Error).message || 'Erro ao desconectar',
      );
    }
  }

  async handleSendTestMessage(userId: number) {
    this.logger.log(`Solicitação de mensagem teste do usuário ${userId}`);

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { whatsappNumber: true, name: true },
      });

      if (!user || !user.whatsappNumber) {
        throw new BadRequestException('Número WhatsApp não configurado');
      }

      const currentState = await this.whatsappService.getSocketState(userId);
      if (currentState !== 'open') {
        throw new BadRequestException(
          `WhatsApp não conectado (Estado: ${currentState})`,
        );
      }

      const testMessage = `Olá ${user.name}! 👋 Teste DevDeck para ${user.whatsappNumber}. Conexão OK! ✨`;

      await this.whatsappService.sendMessage(
        userId,
        user.whatsappNumber,
        testMessage,
      );

      this.logger.log(
        `Mensagem teste enviada para ${user.whatsappNumber} (User ${userId})`,
      );

      return { success: true, message: 'Mensagem enviada!' };
    } catch (error) {
      this.logger.error(
        `Erro ao enviar mensagem teste para ${userId}:`,
        (error as Error).stack,
      );
      throw new BadRequestException(
        (error as Error).message || 'Erro ao enviar mensagem',
      );
    }
  }

  // Método para obter estado atual
  async getInitialState(userId: number) {
    try {
      const state = await this.whatsappService.getSocketState(userId);
      return { status: state || 'logged_out' };
    } catch (error) {
      this.logger.error(
        `Erro ao obter estado para ${userId}:`,
        (error as Error).stack,
      );
      return { status: 'error' };
    }
  }
}
