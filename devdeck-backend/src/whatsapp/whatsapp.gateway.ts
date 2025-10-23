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
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WhatsappService } from './whatsapp.service';
import { fetchLatestBaileysVersion } from '@whiskeysockets/baileys';

async function validateToken(
  client: Socket,
  jwtService: JwtService,
): Promise<number | null> {
  const jwtSecret =
    process.env.JWT_SECRET ||
    'sk_jwt_7x9A2qB8vR3tY6wE1zC5nM8pQ0sK3jH7gF4dL9oV2cX6rT1yU5iW8aB0eN3mZ7qP';
  const token = client.handshake.auth?.token;
  if (!token) return null;
  try {
    const payload = await jwtService.verifyAsync(token, { secret: jwtSecret });
    return payload.sub;
  } catch (e) {
    console.error('Erro ao validar token WebSocket:', (e as Error).message);
    return null;
  }
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
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
      console.warn(`[GATEWAY] Cliente não autenticado: ${client.id}`);
      client.disconnect(true);
      return;
    }
    this.logger.log(`Cliente conectado: ${client.id}, Usuário: ${userId}`);
    console.log(
      `[GATEWAY] Cliente conectado: ${client.id}, Usuário: ${userId}`,
    );
    this.connectedUsers.set(userId, client.id);

    this.whatsappService
      .getSocketState(userId)
      .then((state) => {
        if (state) {
          console.log(
            `[GATEWAY] Enviando estado inicial ${state} para usuário ${userId}`,
          );
          this.sendStatusUpdate(userId, state);
        }
      })
      .catch((e) =>
        this.logger.error(`Erro ao obter estado inicial para ${userId}`, e),
      );
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
    console.log(`[GATEWAY] Cliente desconectado: ${client.id}`);
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        this.logger.log(`Usuário ${userId} removido do mapa de conexões WS.`);
        console.log(`[GATEWAY] Usuário ${userId} removido`);
        break;
      }
    }
  }

  @SubscribeMessage('request_whatsapp_connect')
  async handleConnectRequest(@ConnectedSocket() client: Socket) {
    const userId = await validateToken(client, this.jwtService);
    if (!userId) return { error: 'Não autenticado' };

    // Defina um valor padrão para version
    let version: [number, number, number] = [2, 2323, 4]; // Substitua pelos valores padrão corretos se necessário
    try {
      // Força sempre buscar a versão mais recente
      const versionData = await fetchLatestBaileysVersion();
      version = (versionData.version as number[]).slice(0, 3) as [
        number,
        number,
        number,
      ];
      this.logger.log(
        `[User ${userId}] Versão do Baileys obtida: ${version.join('.')}`,
      );
    } catch (err) {
      this.logger.warn(`Usando versão padrão do Baileys: ${version.join('.')}`);
    }
  }

  @SubscribeMessage('disconnect_whatsapp')
  async handleDisconnectRequest(@ConnectedSocket() client: Socket) {
    const userId = await validateToken(client, this.jwtService);
    if (!userId) return { error: 'Não autenticado' };

    this.logger.log(
      `Solicitação de desconexão WhatsApp recebida para usuário ${userId}`,
    );
    console.log(`[GATEWAY] Disconnect request do usuário ${userId}`);

    try {
      await this.whatsappService.disconnectUser(userId);
      console.log(`[GATEWAY] Desconectado: ${userId}`);
      return { success: true, message: 'Desconectando...' };
    } catch (error) {
      this.logger.error(`Erro ao desconectar usuário ${userId}:`, error);
      console.error(
        `[GATEWAY] Erro ao desconectar: ${(error as Error).message}`,
      );
      return { error: (error as Error).message || 'Erro ao desconectar' };
    }
  }

  sendQrToUser(userId: number, qrDataUrl: string) {
    const socketId = this.connectedUsers.get(userId);
    console.log(
      `[GATEWAY] Tentando enviar QR para ${userId}, socket: ${socketId}`,
    );

    if (socketId) {
      console.log(`[GATEWAY] Enviando QR code para usuário ${userId}`);
      this.server.to(socketId).emit('whatsapp_qr_code', qrDataUrl);
      this.logger.log(
        `QR Code enviado para usuário ${userId} (socket ${socketId})`,
      );
    } else {
      this.logger.warn(
        `Socket não encontrado para usuário ${userId} ao enviar QR`,
      );
      console.warn(`[GATEWAY] Socket não encontrado para ${userId}`);
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
      `[GATEWAY] Enviando status ${status} para usuário ${userId}, socket: ${socketId}`,
    );

    if (socketId) {
      this.server.to(socketId).emit('whatsapp_status_update', payload);
      this.logger.log(`Status '${status}' enviado para usuário ${userId}`);
      console.log(`[GATEWAY] Status ${status} enviado para ${userId}`);
    } else {
      this.logger.warn(
        `Socket não encontrado para usuário ${userId} ao enviar status ${status}`,
      );
      console.warn(
        `[GATEWAY] Socket não encontrado para enviar status para ${userId}`,
      );
    }
  }
}
