/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// devdeck-backend/src/whatsapp/whatsapp.service.ts
import makeWASocket, {
  DisconnectReason,
  AuthenticationState,
  fetchLatestBaileysVersion,
  Browsers,
  BufferJSON,
} from '@whiskeysockets/baileys';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../encryption/encryption.service'; // Importar
import * as qrcode from 'qrcode';
import { Boom } from '@hapi/boom';
import { WhatsappGateway } from './whatsapp.gateway'; // Importar Gateway

// Interface simples para o estado, para usar com useAuthStore
interface PrismaAuthState {
  creds: AuthenticationState['creds'];
  keys: { [keyType: string]: { [id: string]: Uint8Array } }; // Simplificado
}

// Simulação de um pino logger compatível
const pino = (opts: any) => ({
  info: (...args: any[]) => console.log(...args),
  error: (...args: any[]) => console.error(...args),
  warn: (...args: any[]) => console.warn(...args),
  debug: (...args: any[]) => console.debug(...args), // Adicionado debug
  trace: (...args: any[]) => console.trace(...args),
  fatal: (...args: any[]) => console.error(...args), // Mapeado para error
  child: (bindings: any) => pino(bindings),
  level: 'debug', // Definir um nível
});

@Injectable()
export class WhatsappService implements OnModuleDestroy {
  private readonly logger = new Logger(WhatsappService.name);
  private activeSockets = new Map<number, ReturnType<typeof makeWASocket>>();

  // Cache simples para o estado de autenticação (evitar leituras repetidas do DB)
  private authStateCache = new Map<number, PrismaAuthState>();

  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
    private whatsappGateway: WhatsappGateway, // Injetar Gateway
  ) {}

  onModuleDestroy() {
    this.logger.log('Desconectando todos os sockets Baileys...');
    this.activeSockets.forEach((sock) => {
      sock.end(undefined); // Tenta fechar a conexão de forma limpa
    });
    this.activeSockets.clear();
  }

  // Função para carregar o estado do DB
  private async loadAuthState(userId: number): Promise<PrismaAuthState> {
    if (this.authStateCache.has(userId)) {
      return this.authStateCache.get(userId)!;
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { whatsappSession: true },
    });
    if (user?.whatsappSession) {
      const decryptedSession = this.encryptionService.decrypt(
        user.whatsappSession,
      );
      if (decryptedSession) {
        try {
          const authState: PrismaAuthState = JSON.parse(
            decryptedSession,
            BufferJSON.reviver,
          );
          this.authStateCache.set(userId, authState);
          return authState;
        } catch (e) {
          this.logger.error(
            `Erro ao parsear JSON do authState para ${userId}`,
            e,
          );
          // Considerar limpar a sessão inválida no DB aqui
          await this.clearAuthState(userId);
        }
      } else {
        this.logger.warn(`Falha ao descriptografar sessão para ${userId}`);
        await this.clearAuthState(userId); // Limpa sessão se não puder descriptografar
      }
    }
    // Retorna estado inicial se não houver sessão salva/válida
    return { creds: null as any, keys: {} };
  }

  // Função para salvar o estado no DB
  private async saveAuthState(userId: number, state: PrismaAuthState) {
    this.authStateCache.set(userId, state); // Atualiza cache
    try {
      const sessionString = JSON.stringify(state, BufferJSON.replacer, 2);
      const encryptedSession = this.encryptionService.encrypt(sessionString);
      if (encryptedSession) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { whatsappSession: encryptedSession },
        });
      } else {
        this.logger.error(
          `Falha ao criptografar sessão para usuário ${userId}`,
        );
      }
    } catch (e) {
      this.logger.error(
        `Erro ao stringify/encrypt authState para ${userId}`,
        e,
      );
    }
  }

  // Função para limpar o estado
  private async clearAuthState(userId: number) {
    this.authStateCache.delete(userId);
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { whatsappSession: null },
      });
      this.logger.log(`Estado de autenticação limpo para usuário ${userId}`);
    } catch (e) {
      this.logger.error(`Erro ao limpar authState no DB para ${userId}`, e);
    }
  }

  async initializeSocketForUser(userId: number) {
    if (this.activeSockets.has(userId)) {
      const existingSock = this.activeSockets.get(userId);
      // Se já existe e está conectado, informa o status atual
      if (existingSock && existingSock.user) {
        this.logger.warn(
          `Socket já inicializado e ativo para o usuário ${userId}`,
        );
        this.whatsappGateway.sendStatusUpdate(userId, 'open');
        return;
      }
      // Se existe mas está fechado/fechando, remove antes de recriar
      this.logger.warn(
        `Socket existente para usuário ${userId} estava fechado, removendo antes de recriar.`,
      );
      this.activeSockets.delete(userId);
    }

    this.whatsappGateway.sendStatusUpdate(userId, 'connecting');

    // Função utilitária local para gerenciar o estado de autenticação
    // Agora retorna um objeto AuthenticationState compatível com SignalKeyStore
    function useAuthStore(
      loadState: () => Promise<PrismaAuthState>,
      saveStateFn: (state: PrismaAuthState) => Promise<void>,
    ) {
      let state: PrismaAuthState = { creds: null as any, keys: {} };
      let stateLoaded = false;

      const load = async () => {
        if (!stateLoaded) {
          state = await loadState();
          stateLoaded = true;
        }
        return state;
      };

      const saveState = async () => {
        await saveStateFn(state);
      };

      const clearState = async () => {
        state = { creds: null as any, keys: {} };
        stateLoaded = false;
        await saveStateFn(state);
      };

      // SignalKeyStore wrapper with correct typing for Baileys compatibility
      const signalKeyStore: AuthenticationState['keys'] = {
        get: async (type, ids) => {
          await load();
          const result: Record<string, any> = {};
          for (const id of ids) {
            if (state.keys[type] && state.keys[type][id]) {
              result[id] = state.keys[type][id];
            }
          }
          return result;
        },
        set: async (data) => {
          await load();
          for (const keyType in data) {
            if (!state.keys[keyType]) state.keys[keyType] = {};
            for (const id in data[keyType]) {
              state.keys[keyType][id] = data[keyType][id];
            }
          }
          await saveState();
        },
      };

      // Retorna um objeto AuthenticationState compatível
      return {
        state: {
          creds: state?.creds,
          keys: signalKeyStore,
        },
        saveState,
        clearState,
        load,
      };
    }

    const {
      state: authState,
      saveState,
      clearState,
    } = useAuthStore(
      () => this.loadAuthState(userId),
      (newState) => this.saveAuthState(userId, newState),
    );

    const { version, isLatest } = await fetchLatestBaileysVersion();
    this.logger.log(
      `Usando Baileys v${version.join('.')}, isLatest: ${isLatest}`,
    );

    const sock = makeWASocket({
      version,
      auth: authState,
      printQRInTerminal: false,
      browser: Browsers.macOS('Desktop'), // Simula um browser
      logger: pino({ level: 'debug' }) as any, // Usa o logger simulado
      // syncFullHistory: true, // Pode consumir muitos recursos
    });

    this.activeSockets.set(userId, sock);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      this.logger.debug(
        `[User ${userId}] Connection Update: ${connection}`,
        update,
      );

      if (qr) {
        this.logger.log(`QR Code gerado para usuário ${userId}`);
        this.whatsappGateway.sendStatusUpdate(userId, 'request_qr');
        try {
          const qrDataURL = await qrcode.toDataURL(qr);
          this.whatsappGateway.sendQrToUser(userId, qrDataURL);
        } catch (err) {
          this.logger.error(`Erro ao gerar QR Data URL para ${userId}`, err);
        }
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        this.logger.error(
          `Conexão fechada para ${userId} | Razão: ${DisconnectReason[statusCode] || 'Desconhecida'} (${statusCode}), Reconectar: ${shouldReconnect}`,
        );
        this.activeSockets.delete(userId);
        this.authStateCache.delete(userId); // Limpa cache ao desconectar

        if (!shouldReconnect) {
          this.logger.warn(
            `Deslogado permanentemente: Usuário ${userId}. Limpando credenciais.`,
          );
          await clearState(); // Limpa o estado no armazenamento (DB)
          this.whatsappGateway.sendStatusUpdate(userId, 'logged_out');
        } else {
          this.whatsappGateway.sendStatusUpdate(userId, 'close');
          // Poderia implementar uma tentativa de reconexão com backoff aqui,
          // mas por simplicidade, vamos apenas notificar o frontend.
          // setTimeout(() => this.initializeSocketForUser(userId), 5000); // Exemplo simples
        }
      } else if (connection === 'open') {
        this.logger.log(`Conexão WhatsApp aberta para usuário ${userId}`);
        this.whatsappGateway.sendStatusUpdate(userId, 'open');
      }
    });

    // Salva credenciais atualizadas
    sock.ev.on('creds.update', saveState);

    // Tratamento básico de erros
    // Baileys não emite um evento global 'error' em sock.ev, então removido.
  }

  async getSocketState(
    userId: number,
  ): Promise<
    | 'connecting'
    | 'open'
    | 'close'
    | 'request_qr'
    | 'error'
    | 'logged_out'
    | null
  > {
    const sock = this.activeSockets.get(userId);
    if (sock) {
      // A biblioteca não expõe diretamente o estado 'request_qr' ou 'connecting' de forma simples após a inicialização.
      // O estado 'open' ou 'close' pode ser inferido pelo readyState do WebSocket interno, mas é um detalhe de implementação.
      // É melhor confiar nos eventos enviados pelo 'connection.update'.
      // Retornaremos 'open' se o socket existir e tiver um usuário (indicando conexão estabelecida).
      return sock.user ? 'open' : 'connecting'; // Estimativa
    }
    // Verifica se há sessão salva para diferenciar 'close' de 'logged_out'
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { whatsappSession: true },
    });
    return user?.whatsappSession ? 'close' : 'logged_out'; // Ou null se nunca tentou conectar
  }

  async sendMessage(userId: number, targetNumber: string, text: string) {
    const sock = this.activeSockets.get(userId);
    if (!sock || !sock.user) {
      this.logger.error(
        `Socket não está pronto ou não conectado para o usuário ${userId}`,
      );
      throw new Error(`WhatsApp não conectado para o usuário ${userId}.`);
    }

    // Formata o número para JID (ex: 5519999998888@s.whatsapp.net)
    const jid = `${targetNumber.replace(/\D/g, '')}@s.whatsapp.net`;

    try {
      await sock.sendMessage(jid, { text });
      this.logger.log(`Mensagem enviada para ${jid} pelo usuário ${userId}`);
    } catch (error) {
      this.logger.error(
        `Erro ao enviar mensagem para ${jid} pelo usuário ${userId}`,
        error,
      );
      throw error;
    }
  }

  async disconnectUser(userId: number) {
    const sock = this.activeSockets.get(userId);
    if (sock) {
      this.logger.log(`Tentando desconectar usuário ${userId}...`);
      try {
        await sock.logout(); // Tenta deslogar da sessão atual
        this.logger.log(`Logout solicitado para ${userId}.`);
      } catch (error) {
        this.logger.error(
          `Erro durante o logout para ${userId}, forçando fechamento:`,
          error,
        );
        sock.end(undefined); // Força o fechamento se o logout falhar
      } finally {
        // A limpeza principal (DB, Map) acontece no listener 'connection.update' com DisconnectReason.loggedOut
        this.activeSockets.delete(userId); // Remove do mapa de ativos imediatamente
        this.authStateCache.delete(userId); // Limpa cache
        await this.clearAuthState(userId); // Garante limpeza no DB
        this.whatsappGateway.sendStatusUpdate(userId, 'logged_out');
      }
    } else {
      this.logger.warn(
        `Nenhum socket ativo encontrado para desconectar usuário ${userId}, limpando estado do DB.`,
      );
      // Garante que mesmo sem socket ativo, o estado seja limpo
      await this.clearAuthState(userId);
      this.whatsappGateway.sendStatusUpdate(userId, 'logged_out'); // Informa o frontend
    }
  }
}
