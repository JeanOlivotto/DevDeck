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
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WhatsappService } from './whatsapp.service';

async function validateToken(
  client: Socket,
  jwtService: JwtService,
): Promise<number | null> {
  const jwtSecret =
    process.env.JWT_SECRET ||
    'sk_jwt_7x9A2qB8vR3tY6wE1zC5nM8pQ0sK3jH7gF4dL9oV2cX6rT1yU5iW8aB0eN3mZ7qP';
  const token = client.handshake.auth?.token;
  if (!token) {
    console.warn(
      '[GATEWAY] Token não encontrado na autenticação do handshake.',
    );
    return null;
  }
  try {
    const payload = await jwtService.verifyAsync(token, { secret: jwtSecret });
    if (payload && typeof payload.sub === 'number') {
      return payload.sub;
    } else {
      console.warn(
        '[GATEWAY] Payload do token inválido ou sem `sub`. Payload:',
        payload,
      );
      return null;
    }
  } catch (e) {
    console.error(
      '[GATEWAY] Erro ao validar token WebSocket:',
      (e as Error).message,
    );
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
  ) {}

  async handleConnection(client: Socket) {
    const userId = await validateToken(client, this.jwtService);
    if (!userId) {
      this.logger.warn(`Cliente WS não autenticado desconectado: ${client.id}`);
      console.warn(
        `[GATEWAY] Cliente não autenticado desconectado: ${client.id}`,
      );
      client.disconnect(true);
      return;
    }

    const existingSocketId = this.connectedUsers.get(userId);
    if (existingSocketId && existingSocketId !== client.id) {
      this.logger.warn(
        `Usuário ${userId} conectou novamente (${client.id}). Desconectando socket antigo (${existingSocketId}).`,
      );
      const oldSocket = this.server.sockets.sockets.get(existingSocketId);
      if (oldSocket) {
        oldSocket.disconnect(true);
      }
    }

    this.logger.log(
      `Cliente conectado: ${client.id}, Associado ao Usuário: ${userId}`,
    );
    console.log(
      `[GATEWAY] Cliente conectado: ${client.id}, Usuário: ${userId}`,
    );
    this.connectedUsers.set(userId, client.id);

    try {
      const state = await this.whatsappService.getSocketState(userId);
      if (state) {
        console.log(
          `[GATEWAY] Enviando estado inicial ${state} para usuário ${userId} (${client.id})`,
        );
        client.emit('whatsapp_status_update', { status: state });
      }
    } catch (e) {
      this.logger.error(
        `Erro ao obter/enviar estado inicial para ${userId}`,
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
        `Cliente desconectado: ${client.id}, Usuário ${disconnectedUserId} removido do mapa.`,
      );
      console.log(
        `[GATEWAY] Cliente desconectado: ${client.id}, Usuário ${disconnectedUserId} removido.`,
      );
    } else {
      this.logger.log(
        `Cliente desconectado: ${client.id} (não estava mapeado para um usuário).`,
      );
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
        `[GATEWAY] request_whatsapp_connect: Cliente não autenticado ${client.id}`,
      );
      return { error: 'Não autenticado' };
    }

    this.logger.log(
      `[GATEWAY] Solicitação de conexão WhatsApp recebida para usuário ${userId} (${client.id})`,
    );
    console.log(
      `[GATEWAY] Connect request do usuário ${userId} (${client.id})`,
    );

    try {
      this.whatsappService.initializeSocketForUser(userId);
      return { success: true, message: 'Iniciando conexão...' };
    } catch (error) {
      this.logger.error(
        `[GATEWAY] Erro ao chamar initializeSocketForUser para ${userId}:`,
        (error as Error).stack,
      );
      return { error: 'Falha ao iniciar conexão com WhatsApp.' };
    }
  }

  @SubscribeMessage('disconnect_whatsapp')
  async handleDisconnectRequest(@ConnectedSocket() client: Socket) {
    const userId = await validateToken(client, this.jwtService);
    if (!userId) {
      this.logger.warn(
        `[GATEWAY] disconnect_whatsapp: Cliente não autenticado ${client.id}`,
      );
      return { error: 'Não autenticado' };
    }

    this.logger.log(
      `[GATEWAY] Solicitação de desconexão WhatsApp recebida para usuário ${userId} (${client.id})`,
    );
    console.log(
      `[GATEWAY] Disconnect request do usuário ${userId} (${client.id})`,
    );

    try {
      await this.whatsappService.disconnectUser(userId);
      console.log(`[GATEWAY] Desconexão iniciada para: ${userId}`);
      return { success: true, message: 'Desconectando...' };
    } catch (error) {
      this.logger.error(
        `[GATEWAY] Erro ao processar desconexão para ${userId}:`,
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

  sendQrToUser(userId: number, qrDataUrl: string) {
    const socketId = this.connectedUsers.get(userId);
    console.log(
      `[GATEWAY] Tentando enviar QR para ${userId}, socket ID: ${socketId}`,
    );
    if (socketId) {
      this.server.to(socketId).emit('whatsapp_qr_code', qrDataUrl);
      this.logger.log(
        `QR Code enviado para usuário ${userId} (socket ${socketId})`,
      );
      console.log(`[GATEWAY] QR Code enviado para usuário ${userId}`);
    } else {
      this.logger.warn(
        `Socket não encontrado para usuário ${userId} ao tentar enviar QR Code.`,
      );
      console.warn(
        `[GATEWAY] Socket não encontrado para ${userId} ao enviar QR`,
      );
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
      `[GATEWAY] Enviando status '${status}' para usuário ${userId}, socket ID: ${socketId}`,
    );
    if (socketId) {
      this.server.to(socketId).emit('whatsapp_status_update', payload);
      this.logger.log(
        `Status '${status}' enviado para usuário ${userId} (socket ${socketId})`,
      );
      console.log(`[GATEWAY] Status '${status}' enviado para ${userId}`);
    } else {
      this.logger.warn(
        `Socket não encontrado para usuário ${userId} ao tentar enviar status '${status}'.`,
      );
      console.warn(
        `[GATEWAY] Socket não encontrado para enviar status '${status}' para ${userId}`,
      );
    }
  }
}
