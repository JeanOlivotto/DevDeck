/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// devdeck-backend/src/whatsapp/whatsapp.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject, forwardRef } from '@nestjs/common'; // Import Inject and forwardRef
import { JwtService } from '@nestjs/jwt'; // Para autenticar a conexão WS
import { WhatsappService } from './whatsapp.service'; // Keep regular import

// Simples validação de token (adapte conforme necessário ou use um Guard real)
async function validateToken(
  client: Socket,
  jwtService: JwtService,
): Promise<number | null> {
  // ATENÇÃO: Use a mesma chave secreta definida no seu AuthModule/ConfigModule
  const jwtSecret =
    process.env.JWT_SECRET ||
    'sk_jwt_7x9A2qB8vR3tY6wE1zC5nM8pQ0sK3jH7gF4dL9oV2cX6rT1yU5iW8aB0eN3mZ7qP'; // Fallback apenas para exemplo, use ConfigService
  const token = client.handshake.auth?.token;
  if (!token) return null;
  try {
    // Verifique se o secret aqui CORRESPONDE ao usado para assinar o token no login
    const payload = await jwtService.verifyAsync(token, { secret: jwtSecret });
    return payload.sub; // Assumindo que 'sub' é o userId
  } catch (e) {
    console.error('Erro ao validar token WebSocket:', e.message); // Log do erro
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
    // Use Inject and forwardRef aqui
    @Inject(forwardRef(() => WhatsappService))
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
        this.logger.log(`Usuário ${userId} removido do mapa de conexões WS.`);
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
      await this.whatsappService.disconnectUser(userId);
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
