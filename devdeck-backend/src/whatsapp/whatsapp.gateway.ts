/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  Logger,
  Inject,
  forwardRef,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WhatsappService } from './whatsapp.service';
import { PrismaService } from '../prisma/prisma.service';

async function validateToken(
  client: Socket,
  jwtService: JwtService,
): Promise<number | null> {
  const jwtSecret =
    process.env.JWT_SECRET ||
    'sk_jwt_7x9A2qB8vR3tY6wE1zC5nM8pQ0sK3jH7gF4dL9oV2cX6rT1yU5iW8aB0eN3mZ7qP';
  const token = client.handshake.auth?.token;
  if (!token) {
    console.warn('[GATEWAY] Token não encontrado.');
    return null;
  }
  try {
    const payload = await jwtService.verifyAsync(token, { secret: jwtSecret });
    if (payload && typeof payload.sub === 'number') {
      return payload.sub;
    } else {
      console.warn('[GATEWAY] Payload inválido.', payload);
      return null;
    }
  } catch (e) {
    console.error('[GATEWAY] Erro validação token:', (e as Error).message);
    return null;
  }
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/whatsapp',
})
export class WhatsappGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(WhatsappGateway.name);
  private connectedUsers = new Map<number, string>();

  constructor(
    @Inject(forwardRef(() => WhatsappService))
    private whatsappService: WhatsappService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    const userId = await validateToken(client, this.jwtService);
    if (!userId) {
      this.logger.warn(`Cliente não autenticado desconectado: ${client.id}`);
      console.warn(
        `[GATEWAY] Cliente não autenticado desconectado: ${client.id}`,
      );
      client.disconnect(true);
      return;
    }

    const existingSocketId = this.connectedUsers.get(userId);
    if (existingSocketId && existingSocketId !== client.id) {
      this.logger.warn(
        `Usuário ${userId} reconectou (${client.id}). Desconectando ${existingSocketId}.`,
      );
      const oldSocket = this.server.sockets.sockets.get(existingSocketId);
      if (oldSocket) oldSocket.disconnect(true);
    }

    this.logger.log(`Cliente conectado: ${client.id}, Usuário: ${userId}`);
    console.log(
      `[GATEWAY] Cliente conectado: ${client.id}, Usuário: ${userId}`,
    );
    this.connectedUsers.set(userId, client.id);

    try {
      const state = await this.whatsappService.getSocketState(userId);
      if (state) {
        console.log(
          `[GATEWAY] Enviando estado inicial ${state} para ${userId} (${client.id})`,
        );
        client.emit('whatsapp_status_update', { status: state });
      }
    } catch (e) {
      this.logger.error(
        `Erro obter/enviar estado inicial ${userId}`,
        (e as Error).stack,
      );
    }
  }

  handleDisconnect(client: Socket) {
    let disconnectedUserId: number | null = null;
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        disconnectedUserId = userId;
        this.connectedUsers.delete(userId);
        break;
      }
    }
    if (disconnectedUserId) {
      this.logger.log(
        `Cliente desconectado: ${client.id}, Usuário ${disconnectedUserId} removido.`,
      );
      console.log(
        `[GATEWAY] Cliente desconectado: ${client.id}, Usuário ${disconnectedUserId} removido.`,
      );
    } else {
      this.logger.log(`Cliente desconectado: ${client.id} (não mapeado).`);
      console.log(
        `[GATEWAY] Cliente desconectado: ${client.id} (não mapeado).`,
      );
    }
  }

  @SubscribeMessage('request_whatsapp_connect')
  async handleConnectRequest(@ConnectedSocket() client: Socket) {
    const userId = await validateToken(client, this.jwtService);
    if (!userId) {
      this.logger.warn(
        `[GATEWAY] request_whatsapp_connect: Não autenticado ${client.id}`,
      );
      return { error: 'Não autenticado' };
    }
    this.logger.log(
      `[GATEWAY] Solicitação conexão WhatsApp user ${userId} (${client.id})`,
    );
    console.log(`[GATEWAY] Connect request user ${userId} (${client.id})`);
    try {
      this.whatsappService.initializeSocketForUser(userId);
      return { success: true, message: 'Iniciando conexão...' };
    } catch (error) {
      this.logger.error(
        `[GATEWAY] Erro ao chamar initializeSocketForUser ${userId}:`,
        (error as Error).stack,
      );
      return { error: 'Falha ao iniciar conexão WhatsApp.' };
    }
  }

  @SubscribeMessage('disconnect_whatsapp')
  async handleDisconnectRequest(@ConnectedSocket() client: Socket) {
    const userId = await validateToken(client, this.jwtService);
    if (!userId) {
      this.logger.warn(
        `[GATEWAY] disconnect_whatsapp: Não autenticado ${client.id}`,
      );
      return { error: 'Não autenticado' };
    }
    this.logger.log(
      `[GATEWAY] Solicitação desconexão WhatsApp user ${userId} (${client.id})`,
    );
    console.log(`[GATEWAY] Disconnect request user ${userId} (${client.id})`);
    try {
      await this.whatsappService.disconnectUser(userId);
      console.log(`[GATEWAY] Desconexão iniciada para: ${userId}`);
      return { success: true, message: 'Desconectando...' };
    } catch (error) {
      this.logger.error(
        `[GATEWAY] Erro ao processar desconexão ${userId}:`,
        (error as Error).stack,
      );
      console.error(
        `[GATEWAY] Erro ao desconectar ${userId}: ${(error as Error).message}`,
      );
      this.sendStatusUpdate(userId, 'error');
      return {
        error: (error as Error).message || 'Erro ao tentar desconectar',
      };
    }
  }

  @SubscribeMessage('send_test_message')
  async handleSendTestMessage(@ConnectedSocket() client: Socket) {
    const userId = await validateToken(client, this.jwtService);
    if (!userId) {
      this.logger.warn(
        `[GATEWAY] send_test_message: Não autenticado ${client.id}`,
      );
      return { error: 'Não autenticado' };
    }
    this.logger.log(
      `[GATEWAY] Solicitação msg teste user ${userId} (${client.id})`,
    );
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { whatsappNumber: true, name: true },
      });
      if (!user || !user.whatsappNumber) {
        this.logger.warn(
          `[GATEWAY] User ${userId} solicitou teste sem número.`,
        );
        return { error: 'Número WhatsApp não encontrado.' };
      }
      const currentState = await this.whatsappService.getSocketState(userId);
      if (currentState !== 'open') {
        this.logger.warn(
          `[GATEWAY] User ${userId} teste, mas WA não conectado (estado: ${currentState}).`,
        );
        return { error: `WhatsApp não conectado (Estado: ${currentState}).` };
      }
      const testMessage = `Olá ${user.name}! 👋 Teste DevDeck para ${user.whatsappNumber}. Conexão OK! ✨`;
      await this.whatsappService.sendMessage(
        userId,
        user.whatsappNumber,
        testMessage,
      );
      this.logger.log(
        `[GATEWAY] Msg teste enviada para ${user.whatsappNumber} (User ${userId})`,
      );
      return { success: true };
    } catch (error) {
      this.logger.error(
        `[GATEWAY] Erro enviar msg teste user ${userId}:`,
        (error as Error).stack,
      );
      return {
        error: (error as Error).message || 'Erro interno enviar msg teste.',
      };
    }
  }

  sendQrToUser(userId: number, qrDataUrl: string) {
    const socketId = this.connectedUsers.get(userId);
    // *** ADICIONAR LOG AQUI ***
    this.logger.debug(
      `[GATEWAY] Enviando QR para User ${userId} (Socket ${socketId}): ${qrDataUrl.substring(0, 50)}...`,
    );
    if (!qrDataUrl || !qrDataUrl.startsWith('data:image/png;base64,')) {
      this.logger.warn(
        `[GATEWAY] QR Data URL a ser enviada para ${userId} parece inválida!`,
      );
    }
    // *** FIM DO LOG ***
    console.log(
      `[GATEWAY] Tentando enviar QR para ${userId}, socket ID: ${socketId}`,
    );
    if (socketId) {
      this.server.to(socketId).emit('whatsapp_qr_code', qrDataUrl);
      this.logger.log(`QR Code enviado user ${userId} (socket ${socketId})`);
      console.log(`[GATEWAY] QR Code enviado user ${userId}`);
    } else {
      this.logger.warn(
        `Socket não encontrado user ${userId} ao enviar QR Code.`,
      );
      console.warn(`[GATEWAY] Socket não encontrado ${userId} ao enviar QR`);
    }
  }

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
    const socketId = this.connectedUsers.get(userId);
    const payload = { status };
    console.log(
      `[GATEWAY] Enviando status '${status}' user ${userId}, socket ID: ${socketId}`,
    );
    if (socketId) {
      this.server.to(socketId).emit('whatsapp_status_update', payload);
      this.logger.log(
        `Status '${status}' enviado user ${userId} (socket ${socketId})`,
      );
      console.log(`[GATEWAY] Status '${status}' enviado ${userId}`);
    } else {
      this.logger.warn(
        `Socket não encontrado user ${userId} ao enviar status '${status}'.`,
      );
      console.warn(
        `[GATEWAY] Socket não encontrado enviar status '${status}' ${userId}`,
      );
    }
  }
}
