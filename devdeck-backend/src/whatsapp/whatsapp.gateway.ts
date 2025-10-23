/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // Para autenticar a conexão WS
import { WhatsappService } from './whatsapp.service';
// Você precisará de um AuthGuard para WebSockets ou validar o token manualmente

// Simples validação de token (adapte conforme necessário ou use um Guard real)
async function validateToken(
  client: Socket,
  jwtService: JwtService,
): Promise<number | null> {
  const token: string | undefined = client.handshake.auth?.token as string | undefined;
  if (!token) return null;
  try {
    const payload = await jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET /* Use sua chave JWT */,
    });
    return payload.sub; // Assumindo que 'sub' é o userId
  } catch (e) {
    return null;
  }
}

@WebSocketGateway({
  cors: {
    origin: '*', // Ajuste em produção!
  },
  namespace: 'whatsapp', // Namespace opcional
})
export class WhatsappGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(WhatsappGateway.name);
  private connectedUsers = new Map<number, string>(); // userId -> socketId

  constructor(
    private whatsappService: WhatsappService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const userId = await validateToken(client, this.jwtService);
    if (!userId) {
      this.logger.warn(`Cliente WS não autenticado desconectado: ${client.id}`);
      client.disconnect(true);
      return;
    }
    this.logger.log(`Cliente conectado: ${client.id}, Usuário: ${userId}`);
    this.connectedUsers.set(userId, client.id);
    // Verificar estado inicial do WhatsApp para este usuário e enviar
    this.whatsappService
      .getSocketState(userId)
      .then((state) => {
        if (state) this.sendStatusUpdate(userId, state);
      })
      .catch((e) =>
        this.logger.error(`Erro ao obter estado inicial para ${userId}`, e),
      );
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
    // Remove o usuário do mapa ao desconectar
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('request_whatsapp_connect')
  async handleConnectRequest(@ConnectedSocket() client: Socket) {
    const userId = await validateToken(client, this.jwtService);
    if (!userId) return { error: 'Não autenticado' };

    this.logger.log(
      `Solicitação de conexão WhatsApp recebida para usuário ${userId}`,
    );
    try {
      // O serviço tentará inicializar e enviará QR ou status via os métodos abaixo
      await this.whatsappService.initializeSocketForUser(userId);
      return { success: true, message: 'Inicializando conexão...' };
    } catch (error) {
      this.logger.error(`Erro ao inicializar socket para ${userId}:`, error);
      return { error: error.message || 'Erro ao iniciar conexão' };
    }
  }

  @SubscribeMessage('disconnect_whatsapp')
  async handleDisconnectRequest(@ConnectedSocket() client: Socket) {
    const userId = await validateToken(client, this.jwtService);
    if (!userId) return { error: 'Não autenticado' };
    this.logger.log(
      `Solicitação de desconexão WhatsApp recebida para usuário ${userId}`,
    );
    try {
      this.whatsappService.disconnectUser(userId);
      return { success: true, message: 'Desconectando...' };
    } catch (error) {
      this.logger.error(`Erro ao desconectar usuário ${userId}:`, error);
      return { error: error.message || 'Erro ao desconectar' };
    }
  }

  // --- Funções para o WhatsappService chamar ---

  sendQrToUser(userId: number, qrDataUrl: string) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('whatsapp_qr_code', qrDataUrl);
      this.logger.log(
        `QR Code enviado para usuário ${userId} (socket ${socketId})`,
      );
    } else {
      this.logger.warn(
        `Socket não encontrado para usuário ${userId} ao enviar QR`,
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
    if (socketId) {
      this.server.to(socketId).emit('whatsapp_status_update', payload);
      this.logger.log(`Status '${status}' enviado para usuário ${userId}`);
    } else {
      this.logger.warn(
        `Socket não encontrado para usuário ${userId} ao enviar status ${status}`,
      );
    }
  }
}
