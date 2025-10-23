/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
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
  AuthenticationState,
  SignalKeyStore,
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

interface BaileysAuthState {
  creds: AuthenticationCreds;
  keys: { [keyType: string]: { [id: string]: any | Uint8Array } };
}

interface AuthStore {
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
  clearState: () => Promise<void>;
  loadState: () => Promise<void>;
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
    this.activeSockets.forEach((sock, userId) => {
      try {
        sock.end(new Error('Serviço sendo desligado'));
        this.logger.log(`Socket para usuário ${userId} encerrado.`);
      } catch (e) {
        this.logger.error(
          `Erro ao fechar socket para ${userId}: ${(e as Error).message}`,
          (e as Error).stack,
        );
      }
    });
    this.activeSockets.clear();
    this.authStateCache.clear();
  }

  private getInitialAuthState(): BaileysAuthState {
    const noiseKey = { public: Buffer.alloc(32), private: Buffer.alloc(32) };
    return {
      creds: {
        noiseKey,
        signedIdentityKey: {
          public: Buffer.alloc(32),
          private: Buffer.alloc(32),
        },
        signedPreKey: {
          keyId: 1,
          keyPair: { public: Buffer.alloc(32), private: Buffer.alloc(32) },
          signature: Buffer.alloc(64),
        },
        registrationId: Math.floor(Math.random() * (2 ** 31 - 1)),
        advSecretKey: Buffer.alloc(32).toString('base64'),
        nextPreKeyId: 1,
        firstUnuploadedPreKeyId: 1,
        account: undefined,
        me: undefined,
        signalIdentities: [],
        lastAccountSyncTimestamp: 0,
        myAppStateKeyId: undefined,
      } as unknown as AuthenticationCreds,
      keys: {},
    };
  }

  private async loadAuthState(userId: number): Promise<BaileysAuthState> {
    if (this.authStateCache.has(userId)) {
      this.logger.debug(`Retornando authState do cache para ${userId}`);
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
                `AuthState carregado e desserializado com sucesso para ${userId}`,
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
              `Erro ao parsear JSON do authState para ${userId}, limpando sessão. Erro: ${(e as Error).message}`,
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
      } else {
        this.logger.debug(`Nenhuma sessão encontrada no DB para ${userId}.`);
      }
    } catch (e) {
      this.logger.error(
        `Erro ao carregar authState do DB para ${userId}`,
        (e as Error).stack,
      );
    }
    this.logger.debug(
      `Nenhum authState válido encontrado para ${userId}, retornando inicial.`,
    );
    const initialState = this.getInitialAuthState();
    this.authStateCache.set(userId, initialState);
    return initialState;
  }

  private async saveAuthState(
    userId: number,
    state: BaileysAuthState,
  ): Promise<void> {
    this.authStateCache.set(userId, state);
    this.logger.debug(`Salvando authState no DB para usuário ${userId}`);
    try {
      const stateToSave = { ...state };
      if ((stateToSave.creds as any)?.myAppStateKeyId)
        delete (stateToSave.creds as any).myAppStateKeyId;
      if ((stateToSave.creds as any)?.pairingCode)
        delete (stateToSave.creds as any).pairingCode;

      const sessionString = JSON.stringify(stateToSave, BufferJSON.replacer);
      const encryptedSession = this.encryptionService.encrypt(sessionString);
      if (encryptedSession) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { whatsappSession: encryptedSession },
        });
        this.logger.debug(`AuthState salvo com sucesso no DB para ${userId}`);
      } else {
        this.logger.error(
          `Falha ao criptografar sessão para usuário ${userId}. Nada salvo.`,
        );
      }
    } catch (e) {
      this.logger.error(
        `Erro durante saveAuthState para ${userId}`,
        (e as Error).stack,
      );
    }
  }

  private async clearAuthState(userId: number): Promise<void> {
    this.logger.log(`Limpando authState para usuário ${userId} (cache e DB)`);
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
        `Erro ao limpar authState no DB para ${userId}, mas o cache foi limpo.`,
        (e as Error).stack,
      );
    }
  }

  private createPrismaAuthStore(userId: number): AuthStore {
    let internalState: BaileysAuthState = this.getInitialAuthState();

    const ensureAllKeysAreBuffers = (
      state: BaileysAuthState,
    ): BaileysAuthState => {
      if (!state || !state.creds || !state.keys) {
        this.logger.warn(
          `[AuthStore ${userId}] ensureAllKeysAreBuffers recebeu estado inválido.`,
        );
        return state || this.getInitialAuthState();
      }
      const creds = state.creds as any;
      const convertValueToBuffer = (value: any): Buffer | any => {
        if (value instanceof Uint8Array && !(value instanceof Buffer))
          return Buffer.from(value);
        if (
          typeof value === 'object' &&
          value?.type === 'Buffer' &&
          Array.isArray(value.data)
        )
          return Buffer.from(value.data);
        return value;
      };
      const convertKeyPairToBuffer = (keyPair: any) => {
        if (keyPair) {
          keyPair.pubKey = convertValueToBuffer(keyPair.pubKey);
          keyPair.privKey = convertValueToBuffer(keyPair.privKey);
          keyPair.public = convertValueToBuffer(keyPair.public);
          keyPair.private = convertValueToBuffer(keyPair.private);
          keyPair.signature = convertValueToBuffer(keyPair.signature);
        }
        return keyPair;
      };
      creds.noiseKey = convertKeyPairToBuffer(creds.noiseKey);
      creds.signedIdentityKey = convertKeyPairToBuffer(creds.signedIdentityKey);
      creds.signedPreKey = convertKeyPairToBuffer(creds.signedPreKey);
      if (creds.signedPreKey?.keyPair)
        creds.signedPreKey.keyPair = convertKeyPairToBuffer(
          creds.signedPreKey.keyPair,
        );
      creds.pairingEphemeralKeyPair = convertKeyPairToBuffer(
        creds.pairingEphemeralKeyPair,
      );
      creds.advSecretKey = convertValueToBuffer(creds.advSecretKey);
      for (const keyType in state.keys) {
        for (const id in state.keys[keyType]) {
          state.keys[keyType][id] = convertValueToBuffer(
            state.keys[keyType][id],
          );
        }
      }
      return state;
    };

    const authStore: AuthStore = {
      state: {
        creds: internalState.creds,
        keys: {
          get: (type: string, ids: string[]) => {
            if (!internalState) return {};
            const keyTypeData = internalState.keys?.[type] || {};
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
            if (!internalState) {
              internalState = this.getInitialAuthState();
            }
            let keysChanged = false;
            for (const keyType in data) {
              internalState.keys[keyType] = internalState.keys[keyType] || {};
              for (const id in data[keyType]) {
                let value = data[keyType][id];
                if (value instanceof Uint8Array && !(value instanceof Buffer)) {
                  value = Buffer.from(value);
                }
                if (internalState.keys[keyType][id] !== value) {
                  internalState.keys[keyType][id] = value;
                  keysChanged = true;
                }
              }
            }
            if (keysChanged) {
              internalState = { ...internalState };
              this.logger.debug(
                `[AuthStore ${userId}] Keys atualizadas no estado interno via SET.`,
              );
            }
          },
        },
      },
      saveCreds: async () => {
        if (!internalState) return;
        internalState.creds = authStore.state.creds;
        await this.saveAuthState(userId, internalState);
      },
      clearState: async () => {
        this.logger.log(`[AuthStore ${userId}] clearState chamado.`);
        internalState = this.getInitialAuthState();
        authStore.state.creds = internalState.creds;
        await this.clearAuthState(userId);
      },
      loadState: async (): Promise<void> => {
        this.logger.debug(`[AuthStore ${userId}] loadState INICIADO.`);
        let loaded = await this.loadAuthState(userId);
        this.logger.debug(
          `[AuthStore ${userId}] Estado carregado, aplicando ensureAllKeysAreBuffers...`,
        );
        loaded = ensureAllKeysAreBuffers(loaded);
        this.logger.debug(
          `[AuthStore ${userId}] Executado ensureAllKeysAreBuffers. Tipo noiseKey.private DEPOIS: ${loaded?.creds?.noiseKey?.private?.constructor?.name}`,
        );
        internalState = loaded;
        authStore.state.creds = internalState.creds;
        authStore.state.keys = internalState.keys as any; // Cast might be needed
        this.logger.debug(`[AuthStore ${userId}] loadState FINALIZADO.`);
      },
    };
    return authStore;
  }

  async initializeSocketForUser(userId: number): Promise<void> {
    const existingSock = this.activeSockets.get(userId);
    if (existingSock?.user) {
      this.logger.log(`Socket ativo reutilizado para ${userId}`);
      this.whatsappGateway.sendStatusUpdate(userId, 'open');
      return;
    }
    if (existingSock) {
      try {
        existingSock.end(new Error('Recriando socket'));
      } catch (e) {
        /*ignore*/
      }
      this.activeSockets.delete(userId);
    }

    this.logger.log(`Inicializando novo socket para usuário ${userId}`);
    this.whatsappGateway.sendStatusUpdate(userId, 'connecting');

    const authStore = this.createPrismaAuthStore(userId);

    try {
      await authStore.loadState();
      this.logger.debug(
        `[User ${userId}] authStore.loadState() concluído (com ensureBuffers).`,
      );

      let version: [number, number, number] | undefined = undefined;
      const fetchTimeoutMs = 10000;
      try {
        this.logger.log(`[User ${userId}] Buscando versão Baileys...`);
        const versionData = (await Promise.race([
          fetchLatestBaileysVersion(),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Timeout buscando versão')),
              fetchTimeoutMs,
            ),
          ),
        ])) as { version: number[]; isLatest: boolean };
        if (
          Array.isArray(versionData.version) &&
          versionData.version.length >= 3
        ) {
          version = versionData.version.slice(0, 3) as [number, number, number];
          this.logger.log(
            `[User ${userId}] Usando versão Baileys: ${version.join('.')}`,
          );
        } else {
          throw new Error('Versão inválida');
        }
      } catch (err) {
        this.logger.error(
          `[User ${userId}] Falha ao buscar versão: ${(err as Error).message}.`,
        );
        this.whatsappGateway.sendStatusUpdate(userId, 'error');
        return;
      }
      if (!version) {
        this.logger.error(`[User ${userId}] Versão Baileys indeterminada.`);
        this.whatsappGateway.sendStatusUpdate(userId, 'error');
        return;
      }

      this.logger.log(
        `[User ${userId}] Criando socket com Baileys v${version.join('.')} usando authStore.state...`,
      );

      const sock = makeWASocket({
        version,
        auth: authStore.state,
        printQRInTerminal: false,
        browser: Browsers.macOS('Chrome'),
        logger: loggerPino as any,
      });

      this.activeSockets.set(userId, sock);
      console.log(`[GATEWAY] Socket inicializado para ${userId}`);

      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        const errorMessage =
          (lastDisconnect?.error as Boom)?.message ||
          (lastDisconnect?.error as Error)?.message;
        const errorStack = (lastDisconnect?.error as Error)?.stack;
        this.logger.debug(
          `[User ${userId}] Connection Update: ${connection}, LastDisconnect Error: ${errorMessage}`,
        );

        if (qr) {
          this.logger.log(`QR Code gerado para usuário ${userId}`);
          this.whatsappGateway.sendStatusUpdate(userId, 'request_qr');
          try {
            const qrDataURL = await qrcode.toDataURL(qr);
            this.whatsappGateway.sendQrToUser(userId, qrDataURL);
          } catch (err) {
            this.logger.error(
              `[User ${userId}] Erro ao gerar QR Code URL`,
              (err as Error).stack,
            );
          }
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as Boom)?.output
            ?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          this.logger.error(
            `Conexão fechada para ${userId} | Motivo: ${DisconnectReason[statusCode as number] || 'Desconhecido'} (${statusCode}) | Reconectando: ${shouldReconnect}`,
            errorStack,
          );
          this.activeSockets.delete(userId);
          if (!shouldReconnect) {
            this.logger.warn(
              `Logout permanente ou erro crítico (${statusCode}) para usuário ${userId}. Limpando estado.`,
            );
            await authStore.clearState();
            this.whatsappGateway.sendStatusUpdate(userId, 'logged_out');
          } else {
            this.logger.log(
              `Tentando reconectar usuário ${userId} em 5 segundos...`,
            );
            this.whatsappGateway.sendStatusUpdate(userId, 'close');
            setTimeout(() => {
              this.logger.log(
                `[User ${userId}] Iniciando tentativa de reconexão...`,
              );
              this.initializeSocketForUser(userId).catch((e) =>
                this.logger.error(
                  `[User ${userId}] Erro CRÍTICO durante tentativa de reconexão`,
                  (e as Error).stack,
                ),
              );
            }, 5000);
          }
        } else if (connection === 'open') {
          this.logger.log(
            `WhatsApp conectado para usuário ${userId}: ${sock.user?.id}`,
          );
          this.whatsappGateway.sendStatusUpdate(userId, 'open');
        } else if (connection === 'connecting') {
          this.logger.log(`[User ${userId}] Socket está conectando...`);
        }
      });

      sock.ev.on('creds.update', authStore.saveCreds);
    } catch (error) {
      this.logger.error(
        `Erro CRÍTICO durante inicialização para ${userId}`,
        (error as Error).stack,
      );
      this.activeSockets.delete(userId);
      await authStore.clearState();
      this.whatsappGateway.sendStatusUpdate(userId, 'error');
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
      return sock.user ? 'open' : 'connecting';
    }
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { whatsappSession: true },
      });
      return user?.whatsappSession ? 'close' : 'logged_out';
    } catch (e) {
      this.logger.error(
        `Erro ao verificar estado do socket para ${userId} no DB`,
        (e as Error).stack,
      );
      return 'error';
    }
  }

  async sendMessage(
    userId: number,
    targetNumber: string,
    text: string,
  ): Promise<any> {
    const sock = this.activeSockets.get(userId);
    if (!sock || !sock.user) {
      throw new Error(`WhatsApp não conectado para o usuário ${userId}.`);
    }
    const numberOnly = targetNumber.replace(/\D/g, '');
    if (!numberOnly || numberOnly.length < 10 || numberOnly.length > 15) {
      throw new Error(`Número inválido: ${targetNumber}`);
    }
    const jid = `${numberOnly}@s.whatsapp.net`;
    if (!/^\d+@s\.whatsapp\.net$/.test(jid)) {
      throw new Error(`Falha ao formatar número: ${targetNumber}`);
    }
    try {
      const result = await sock.sendMessage(jid, { text: text });
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
        `Falha ao enviar mensagem WhatsApp: ${(error as Error).message || 'Erro desconhecido'}`,
      );
    }
  }

  async disconnectUser(userId: number): Promise<void> {
    const sock = this.activeSockets.get(userId);
    const authStore = this.createPrismaAuthStore(userId);
    if (sock) {
      this.logger.log(`Tentando desconectar usuário ${userId}...`);
      try {
        await sock.logout(`Desconectado pelo usuário via App.`);
      } catch (logoutError) {
        this.logger.warn(
          `Erro durante sock.logout() para ${userId}:`,
          (logoutError as Error).message,
        );
      } finally {
        await authStore.clearState();
        this.logger.log(
          `Estado de autenticação limpo para ${userId} após tentativa de desconexão.`,
        );
        if (this.activeSockets.has(userId)) {
          try {
            this.logger.log(
              `Forçando encerramento da conexão WebSocket para ${userId}.`,
            );
            sock.end(
              new Error('Desconexão solicitada pelo usuário e estado limpo.'),
            );
          } catch (endError) {
            this.logger.error(
              `Erro ao forçar encerramento para ${userId}:`,
              (endError as Error).message,
            );
          }
          this.activeSockets.delete(userId);
        }
        this.authStateCache.delete(userId);
        this.whatsappGateway.sendStatusUpdate(userId, 'logged_out');
      }
    } else {
      this.logger.warn(
        `Nenhum socket ativo para desconectar ${userId}, limpando estado.`,
      );
      await authStore.clearState();
      this.authStateCache.delete(userId);
      this.whatsappGateway.sendStatusUpdate(userId, 'logged_out');
    }
  }
}
