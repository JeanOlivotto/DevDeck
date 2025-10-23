/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
  BufferJSON,
  makeCacheableSignalKeyStore,
  AuthenticationCreds,
  WASocket,
} from '@whiskeysockets/baileys';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';
import * as qrcode from 'qrcode';
import { Boom } from '@hapi/boom';
import { WhatsappGateway } from './whatsapp.gateway';
// import { setTimeout } from 'timers/promises';

interface BaileysAuthState {
  creds: AuthenticationCreds;
  keys: { [keyType: string]: { [id: string]: any | Uint8Array } };
}

interface AuthStore {
  state: {
    creds: AuthenticationCreds;
    keys: {
      get: (type: string, ids: string[]) => { [id: string]: any };
      set: (data: { [keyType: string]: { [id: string]: any } }) => void;
    };
  };
  saveCreds: () => Promise<void>;
  clearState: () => Promise<void>;
  loadState: () => Promise<BaileysAuthState>;
}

const pino = (opts?: any) => ({
  info: (...args: any[]) =>
    console.log(
      '[INFO]',
      ...args.map((arg) =>
        typeof arg === 'object' ? JSON.stringify(arg) : arg,
      ),
    ),
  error: (...args: any[]) =>
    console.error(
      '[ERROR]',
      ...args.map((arg) =>
        typeof arg === 'object' ? JSON.stringify(arg) : arg,
      ),
    ),
  warn: (...args: any[]) =>
    console.warn(
      '[WARN]',
      ...args.map((arg) =>
        typeof arg === 'object' ? JSON.stringify(arg) : arg,
      ),
    ),
  debug: (...args: any[]) =>
    console.debug(
      '[DEBUG]',
      ...args.map((arg) =>
        typeof arg === 'object' ? JSON.stringify(arg) : arg,
      ),
    ),
  trace: (...args: any[]) =>
    console.trace(
      '[TRACE]',
      ...args.map((arg) =>
        typeof arg === 'object' ? JSON.stringify(arg) : arg,
      ),
    ),
  fatal: (...args: any[]) =>
    console.error(
      '[FATAL]',
      ...args.map((arg) =>
        typeof arg === 'object' ? JSON.stringify(arg) : arg,
      ),
    ),
  child: (bindings: any) => pino(bindings),
  level: process.env.WHATSAPP_LOG_LEVEL || 'debug',
});

const loggerPino = pino();

@Injectable()
export class WhatsappService implements OnModuleDestroy {
  private readonly logger = new Logger(WhatsappService.name);
  private activeSockets = new Map<number, WASocket>();
  private authStateCache = new Map<number, BaileysAuthState>();

  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
    @Inject(forwardRef(() => WhatsappGateway))
    private whatsappGateway: WhatsappGateway,
  ) {}

  onModuleDestroy() {
    this.logger.log('Desconectando todos os sockets Baileys...');
    this.activeSockets.forEach((sock) => {
      try {
        sock.end(undefined);
      } catch (e) {
        this.logger.error(
          `Erro ao fechar socket: ${(e as Error).message}`,
          (e as Error).stack,
        );
      }
    });
    this.activeSockets.clear();
    this.authStateCache.clear();
  }

  private getInitialAuthState(): BaileysAuthState {
    const noiseKey = {
      public: Uint8Array.from(Buffer.alloc(32)),
      private: Uint8Array.from(Buffer.alloc(32)),
    };

    return {
      creds: {
        noiseKey,
        signedIdentityKey: {
          public: Uint8Array.from(Buffer.alloc(32)),
          private: Uint8Array.from(Buffer.alloc(32)),
        },
        signedPreKey: {
          keyId: 1,
          keyPair: {
            public: Uint8Array.from(Buffer.alloc(32)),
            private: Uint8Array.from(Buffer.alloc(32)),
          },
          signature: Uint8Array.from(Buffer.alloc(64)),
        },
        registrationId: Math.floor(Math.random() * (2 ** 31 - 1)), // ID aleatório
        advSecretKey: Uint8Array.from(Buffer.alloc(32)),
        nextPreKeyId: 1,
        firstUnuploadedPreKeyId: 1,
        account: undefined,
        me: undefined,
        signalIdentities: [],
        lastAccountSyncTimestamp: 0,
        pairingEphemeralKeyPair: {
          public: Uint8Array.from(Buffer.alloc(32)),
          private: Uint8Array.from(Buffer.alloc(32)),
        },
        processedHistoryMessages: [],
        accountSyncCounter: 0,
        accountSettings: {
          unarchiveChats: false,
        },
      } as unknown as AuthenticationCreds,
      keys: {},
    };
  }

  private async loadAuthState(userId: number): Promise<BaileysAuthState> {
    if (this.authStateCache.has(userId)) {
      return this.authStateCache.get(userId)!;
    }

    this.logger.debug(`Carregando authState do DB para usuário ${userId}`);

    try {
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
            const authState: BaileysAuthState = JSON.parse(
              decryptedSession,
              BufferJSON.reviver,
            );

            if (
              authState &&
              authState.creds &&
              authState.keys &&
              typeof authState.keys === 'object'
            ) {
              this.authStateCache.set(userId, authState);
              this.logger.debug(
                `AuthState carregado e decriptado com sucesso para ${userId}`,
              );
              return authState;
            } else {
              this.logger.warn(
                `AuthState parseado inválido para ${userId}, limpando.`,
              );
              await this.clearAuthState(userId);
            }
          } catch (e) {
            this.logger.error(
              `Erro ao parsear JSON do authState para ${userId}, limpando sessão.`,
              (e as Error).stack,
            );
            await this.clearAuthState(userId);
          }
        } else {
          this.logger.warn(
            `Falha ao descriptografar sessão para ${userId}, limpando sessão.`,
          );
          await this.clearAuthState(userId);
        }
      }
    } catch (e) {
      this.logger.error(
        `Erro ao carregar authState para ${userId}`,
        (e as Error).stack,
      );
    }

    this.logger.debug(
      `Nenhum authState válido encontrado para ${userId}, retornando inicial.`,
    );
    return this.getInitialAuthState();
  }

  private async saveAuthState(
    userId: number,
    state: BaileysAuthState,
  ): Promise<void> {
    this.authStateCache.set(userId, state);
    this.logger.debug(`Salvando authState no DB para usuário ${userId}`);

    try {
      const sessionString = JSON.stringify(state, BufferJSON.replacer);
      const encryptedSession = this.encryptionService.encrypt(sessionString);

      if (encryptedSession) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { whatsappSession: encryptedSession },
        });
        this.logger.debug(`AuthState salvo com sucesso para ${userId}`);
      } else {
        this.logger.error(
          `Falha ao criptografar sessão para usuário ${userId}`,
        );
      }
    } catch (e) {
      this.logger.error(
        `Erro ao stringify/encrypt/save authState para ${userId}`,
        (e as Error).stack,
      );
    }
  }

  private async clearAuthState(userId: number): Promise<void> {
    this.logger.log(`Limpando authState para usuário ${userId}`);
    this.authStateCache.delete(userId);

    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { whatsappSession: null },
      });
      this.logger.log(
        `Estado de autenticação limpo no DB para usuário ${userId}`,
      );
    } catch (e) {
      this.logger.error(
        `Erro ao limpar authState no DB para ${userId}`,
        (e as Error).stack,
      );
    }
  }

  private createPrismaAuthStore(userId: number): AuthStore {
    let state: BaileysAuthState = this.getInitialAuthState();

    const auth: AuthStore = {
      state: {
        creds: state.creds,
        keys: {
          get: (type: string, ids: string[]) => {
            const keyTypeData = state.keys?.[type] || {};
            return ids.reduce(
              (dict, id) => {
                const value = keyTypeData[id];
                if (value) dict[id] = value;
                return dict;
              },
              {} as { [id: string]: any },
            );
          },
          set: (data: { [keyType: string]: { [id: string]: any } }) => {
            for (const keyType in data) {
              if (!state.keys[keyType]) state.keys[keyType] = {};
              // Converte Uint8Array para Buffer se necessário
              Object.keys(data[keyType]).forEach((id) => {
                const value = data[keyType][id];
                if (value instanceof Uint8Array && !(value instanceof Buffer)) {
                  state.keys[keyType][id] = Buffer.from(value);
                } else {
                  state.keys[keyType][id] = value;
                }
              });
            }
          },
        },
      },
      saveCreds: async () => {
        await this.saveAuthState(userId, state);
      },
      clearState: async () => {
        state = {
          creds: this.getInitialAuthState().creds,
          keys: {},
        };
        await this.clearAuthState(userId);
      },
      loadState: async () => {
        state = await this.loadAuthState(userId);
        // Converte Uint8Array para Buffer após carregar
        if (state && state.creds) {
          const creds = state.creds as any;
          if (
            creds.noiseKey?.private instanceof Uint8Array &&
            !(creds.noiseKey.private instanceof Buffer)
          ) {
            creds.noiseKey.public = Buffer.from(creds.noiseKey.public);
            creds.noiseKey.private = Buffer.from(creds.noiseKey.private);
          }
          if (creds.signedIdentityKey?.private instanceof Uint8Array) {
            creds.signedIdentityKey.public = Buffer.from(
              creds.signedIdentityKey.public,
            );
            creds.signedIdentityKey.private = Buffer.from(
              creds.signedIdentityKey.private,
            );
          }
          if (creds.signedPreKey?.keyPair?.private instanceof Uint8Array) {
            creds.signedPreKey.keyPair.public = Buffer.from(
              creds.signedPreKey.keyPair.public,
            );
            creds.signedPreKey.keyPair.private = Buffer.from(
              creds.signedPreKey.keyPair.private,
            );
            creds.signedPreKey.signature = Buffer.from(
              creds.signedPreKey.signature,
            );
          }
          if (
            creds.advSecretKey instanceof Uint8Array &&
            !(creds.advSecretKey instanceof Buffer)
          ) {
            creds.advSecretKey = Buffer.from(creds.advSecretKey);
          }
          if (creds.pairingEphemeralKeyPair?.private instanceof Uint8Array) {
            creds.pairingEphemeralKeyPair.public = Buffer.from(
              creds.pairingEphemeralKeyPair.public,
            );
            creds.pairingEphemeralKeyPair.private = Buffer.from(
              creds.pairingEphemeralKeyPair.private,
            );
          }
        }
        auth.state.creds = state.creds;
        return state;
      },
    };

    return auth;
  }

  async initializeSocketForUser(userId: number): Promise<void> {
    const existingSock = this.activeSockets.get(userId);

    if (existingSock?.user) {
      this.logger.log(`Socket ativo reutilizado para usuário ${userId}`);
      this.whatsappGateway.sendStatusUpdate(userId, 'open');
      return;
    }

    if (existingSock) {
      try {
        existingSock.end(new Error('Recriando socket'));
      } catch (e) {
        this.logger.debug(`Erro ao fechar socket anterior`);
      }
      this.activeSockets.delete(userId);
      this.authStateCache.delete(userId);
    }

    this.logger.log(`Inicializando novo socket para usuário ${userId}`);
    this.whatsappGateway.sendStatusUpdate(userId, 'connecting');

    const authStore = this.createPrismaAuthStore(userId);
    const { state, saveCreds, clearState } = authStore;

    try {
      // Carregar estado existente antes de criar o socket
      await authStore.loadState();

      let version: [number, number, number] = [2, 2345, 104];

      try {
        const versionData = (await Promise.race([
          fetchLatestBaileysVersion(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 5000),
          ),
        ])) as { version: number[]; isLatest: boolean };

        if (
          Array.isArray(versionData.version) &&
          versionData.version.length >= 3
        ) {
          version = versionData.version.slice(0, 3) as [number, number, number];
        }
      } catch (err) {
        this.logger.warn(
          `Usando versão padrão do Baileys: ${version.join('.')}`,
        );
      }

      this.logger.log(
        `[User ${userId}] Criando socket com Baileys v${version.join('.')}`,
      );

      const sock = makeWASocket({
        version,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, loggerPino as any),
        },
        printQRInTerminal: false,
        browser: Browsers.macOS('Chrome'),
        logger: loggerPino as any,
      });

      this.activeSockets.set(userId, sock);

      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        this.logger.debug(`[User ${userId}] Connection Update: ${connection}`);

        if (qr) {
          this.logger.log(`QR Code gerado para usuário ${userId}`);
          this.whatsappGateway.sendStatusUpdate(userId, 'request_qr');
          try {
            const qrDataURL = await qrcode.toDataURL(qr);
            this.whatsappGateway.sendQrToUser(userId, qrDataURL);
          } catch (err) {
            this.logger.error(`Erro ao gerar QR Code`, (err as Error).stack);
          }
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as Boom)?.output
            ?.statusCode;
          const shouldReconnect =
            statusCode !== DisconnectReason.loggedOut &&
            statusCode !== DisconnectReason.connectionClosed;

          this.logger.error(
            `Conexão fechada para ${userId} | Código: ${statusCode}, Reconectar: ${shouldReconnect}`,
          );

          this.activeSockets.delete(userId);

          if (!shouldReconnect) {
            this.logger.warn(`Logout permanente para usuário ${userId}`);
            await clearState();
            this.whatsappGateway.sendStatusUpdate(userId, 'logged_out');
          } else {
            this.logger.log(`Tentando reconectar usuário ${userId}...`);
            this.whatsappGateway.sendStatusUpdate(userId, 'close');
            // Aguardar antes de reconectar
            setTimeout(() => {
              this.initializeSocketForUser(userId).catch((e) =>
                this.logger.error(`Erro ao reconectar ${userId}`, e),
              );
            }, 3000);
          }
        } else if (connection === 'open') {
          this.logger.log(
            `WhatsApp conectado para usuário ${userId}: ${sock.user?.id}`,
          );
          this.whatsappGateway.sendStatusUpdate(userId, 'open');
        }
      });

      sock.ev.on('creds.update', saveCreds);
    } catch (error) {
      this.logger.error(
        `Erro ao inicializar socket para ${userId}`,
        (error as Error).stack,
      );
      this.activeSockets.delete(userId);
      this.whatsappGateway.sendStatusUpdate(userId, 'error');
      throw error;
    }
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
      if (sock.user) {
        return 'open';
      }
      return 'connecting';
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { whatsappSession: true },
      });
      return user?.whatsappSession ? 'close' : 'logged_out';
    } catch (e) {
      this.logger.error(
        `Erro ao verificar estado do socket para ${userId}`,
        (e as Error).stack,
      );
      return null;
    }
  }

  async sendMessage(
    userId: number,
    targetNumber: string,
    text: string,
  ): Promise<any> {
    const sock = this.activeSockets.get(userId);

    if (!sock || !sock.user) {
      this.logger.error(
        `Socket não está pronto ou não conectado para o usuário ${userId}`,
      );
      throw new Error(`WhatsApp não conectado para o usuário ${userId}.`);
    }

    const numberOnly = targetNumber.replace(/[\s+()-]/g, '');

    if (!numberOnly || !/^\+?\d{10,15}$/.test(numberOnly)) {
      this.logger.error(`Número de telefone inválido: ${targetNumber}`);
      throw new Error(`Número de telefone inválido: ${targetNumber}`);
    }

    const jid = `${numberOnly}@s.whatsapp.net`;

    if (!/^\d+@s\.whatsapp\.net$/.test(jid)) {
      this.logger.error(
        `Número de telefone inválido ou mal formatado para JID: ${targetNumber} -> ${jid}`,
      );
      throw new Error(`Número de telefone inválido: ${targetNumber}`);
    }

    try {
      this.logger.debug(`Enviando mensagem para ${jid} pelo usuário ${userId}`);
      const result = await sock.sendMessage(jid, { text });
      this.logger.log(
        `Mensagem enviada para ${jid} pelo usuário ${userId}. ID: ${result?.key?.id}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao enviar mensagem para ${jid} pelo usuário ${userId}`,
        (error as Error).stack,
      );
      throw new Error(
        `Falha ao enviar mensagem WhatsApp: ${(error as Error).message || error}`,
      );
    }
  }

  async disconnectUser(userId: number): Promise<void> {
    const sock = this.activeSockets.get(userId);

    if (sock) {
      this.logger.log(`Tentando desconectar usuário ${userId}...`);
      try {
        await this.clearAuthState(userId);
        await sock.logout(`Desconectado pelo usuário via App.`);
        this.logger.log(`Logout solicitado para ${userId}.`);
      } catch (error) {
        this.logger.error(
          `Erro durante o logout para ${userId}, forçando fechamento:`,
          (error as Error).stack,
        );
        try {
          sock.end(
            new Error(
              `Forçando desconexão após erro no logout: ${(error as Error).message}`,
            ),
          );
        } catch (e) {
          this.logger.debug(
            `Erro ao forçar fechamento do socket: ${(e as Error).message}`,
          );
        }
      } finally {
        this.activeSockets.delete(userId);
        this.authStateCache.delete(userId);
        this.whatsappGateway.sendStatusUpdate(userId, 'logged_out');
      }
    } else {
      this.logger.warn(
        `Nenhum socket ativo encontrado para desconectar usuário ${userId}, limpando estado do DB.`,
      );
      await this.clearAuthState(userId);
      this.whatsappGateway.sendStatusUpdate(userId, 'logged_out');
    }
  }
}
