/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable prettier/prettier */
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
  Injectable,
  Logger,
  OnModuleDestroy,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as qrcode from 'qrcode';
import { WhatsappGateway } from './whatsapp.gateway';
import * as fs from 'fs/promises';
import * as path from 'path';

// Dynamic imports para ESM modules
let makeWASocket: any;
let DisconnectReason: any;
let fetchLatestBaileysVersion: any;
let Browsers: any;
let useMultiFileAuthState: any;
let Boom: any;

// Função para inicializar imports ESM
async function initializeBaileysImports() {
  if (makeWASocket) return; // Já inicializado

  const baileysModule = await import('@whiskeysockets/baileys');
  makeWASocket = baileysModule.makeWASocket;
  DisconnectReason = baileysModule.DisconnectReason;
  fetchLatestBaileysVersion = baileysModule.fetchLatestBaileysVersion;
  Browsers = baileysModule.Browsers;
  useMultiFileAuthState = baileysModule.useMultiFileAuthState;

  const boomModule = await import('@hapi/boom');
  Boom = boomModule.Boom;
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
  private activeSockets = new Map<number, any>();
  private readonly SESSIONS_DIR = path.join(
    __dirname,
    '..',
    '..',
    'whatsapp_sessions',
  );

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => WhatsappGateway))
    private whatsappGateway: WhatsappGateway,
  ) {
    this.ensureSessionsDirExists();
  }

  private async ensureSessionsDirExists() {
    try {
      await fs.mkdir(this.SESSIONS_DIR, { recursive: true });
      this.logger.log(`Diretório de sessões garantido: ${this.SESSIONS_DIR}`);
    } catch (error) {
      this.logger.error(
        `Falha ao criar diretório de sessões: ${this.SESSIONS_DIR}`,
        (error as Error).stack,
      );
    }
  }

  async onModuleDestroy() {
    this.logger.log('Desconectando todos os sockets Baileys...');
    const disconnectionPromises = Array.from(this.activeSockets.entries()).map(
      async ([userId, sock]) => {
        try {
          sock.ws.close();
          await sock.logout('Serviço sendo desligado');
          this.logger.log(`Socket para usuário ${userId} encerrado.`);
        } catch (e) {
          this.logger.error(
            `Erro ao fechar/logout socket para ${userId}: ${(e as Error).message}`,
          );
          try {
            sock.end(new Error('Serviço encerrado forçadamente'));
          } catch (endErr) {}
        }
      },
    );
    await Promise.allSettled(disconnectionPromises);
    this.activeSockets.clear();
  }

  async initializeSocketForUser(userId: number): Promise<void> {
    // Inicializa imports ESM
    await initializeBaileysImports();

    const existingSock = this.activeSockets.get(userId);
    if (existingSock?.user) {
      this.logger.log(`Socket ativo reutilizado para usuário ${userId}`);
      this.whatsappGateway.sendStatusUpdate(userId, 'open');
      return;
    }
    if (existingSock) {
      try {
        this.logger.log(`Encerrando socket anterior existente para ${userId}.`);
        existingSock.end(new Error('Recriando socket a pedido'));
      } catch (e) {
        this.logger.debug(
          `Erro (ignorado) ao fechar socket anterior para ${userId}: ${(e as Error).message}`,
        );
      }
      this.activeSockets.delete(userId);
    }

    this.logger.log(`Inicializando novo socket para usuário ${userId}`);
    this.whatsappGateway.sendStatusUpdate(userId, 'connecting');

    const sessionDir = path.join(this.SESSIONS_DIR, `user_${userId}`);
    await fs.mkdir(sessionDir, { recursive: true });

    try {
      const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
      this.logger.debug(
        `[User ${userId}] Estado de autenticação carregado/inicializado de ${sessionDir}`,
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
        `[User ${userId}] Criando socket com Baileys v${version.join('.')}...`,
      );

      const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        browser: Browsers.macOS('Chrome'),
        logger: loggerPino as any,
      });

      this.activeSockets.set(userId, sock);
      console.log(`[GATEWAY] Socket inicializado para ${userId}`);

      sock.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;
        const errorMessage =
          (lastDisconnect?.error as any)?.message ||
          (lastDisconnect?.error as Error)?.message;
        const errorStack = (lastDisconnect?.error as Error)?.stack;
        this.logger.debug(
          `[User ${userId}] Connection Update: ${connection}, LastDisconnect Error: ${errorMessage}`,
        );

        if (qr) {
          this.logger.log(
            `[User ${userId}] QR String recebido do Baileys: ${qr}`,
          );
          this.whatsappGateway.sendStatusUpdate(userId, 'request_qr');
          try {
            const qrDataURL = await qrcode.toDataURL(qr);
            this.logger.debug(
              `[User ${userId}] QR Data URL gerada: ${qrDataURL.substring(0, 50)}...`,
            );
            if (!qrDataURL || !qrDataURL.startsWith('data:image/png;base64,')) {
              this.logger.error(
                `[User ${userId}] QR Data URL gerada parece inválida!`,
              );
            }
            this.whatsappGateway.sendQrToUser(userId, qrDataURL);
          } catch (err) {
            this.logger.error(
              `[User ${userId}] Erro ao gerar QR Code para URL de dados`,
              (err as Error).stack,
            );
          }
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          this.logger.error(
            `Conexão fechada para ${userId} | Motivo: ${DisconnectReason[statusCode as number] || 'Desconhecido'} (${statusCode}) | Reconectando: ${shouldReconnect}`,
            errorStack,
          );

          this.activeSockets.delete(userId);

          if (!shouldReconnect) {
            this.logger.warn(
              `Logout permanente ou erro crítico (${statusCode}) para usuário ${userId}. Removendo diretório da sessão.`,
            );
            await this.removeSessionDir(userId);
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
              void this.initializeSocketForUser(userId).catch((e) =>
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

      sock.ev.on('creds.update', saveCreds);
    } catch (error) {
      this.logger.error(
        `Erro CRÍTICO durante inicialização para ${userId}`,
        (error as Error).stack,
      );
      this.activeSockets.delete(userId);
      await this.removeSessionDir(userId);
      this.whatsappGateway.sendStatusUpdate(userId, 'error');
    }
  }

  private async removeSessionDir(userId: number): Promise<void> {
    const sessionDir = path.join(this.SESSIONS_DIR, `user_${userId}`);
    try {
      await fs.rm(sessionDir, { recursive: true, force: true });
      this.logger.log(
        `Diretório da sessão removido para usuário ${userId}: ${sessionDir}`,
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.error(
          `Falha ao remover diretório da sessão para usuário ${userId}: ${sessionDir}`,
          (error as Error).stack,
        );
      }
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
    const sessionDir = path.join(this.SESSIONS_DIR, `user_${userId}`);
    try {
      await fs.access(sessionDir);
      return 'close';
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return 'logged_out';
      }
      this.logger.error(
        `Erro ao verificar diretório da sessão para ${userId}: ${sessionDir}`,
        (error as Error).stack,
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
    if (sock) {
      this.logger.log(`Tentando desconectar usuário ${userId}...`);
      try {
        await sock.logout(`Desconectado pelo usuário via App.`);
        this.logger.log(
          `Logout via sock.logout() bem-sucedido para ${userId}.`,
        );
      } catch (logoutError) {
        this.logger.warn(
          `Erro durante sock.logout() para ${userId} (pode já estar desconectado):`,
          (logoutError as Error).message,
        );
        try {
          sock.end(new Error('Forçando desconexão após erro no logout'));
        } catch (e) {}
        this.activeSockets.delete(userId);
        await this.removeSessionDir(userId);
        this.whatsappGateway.sendStatusUpdate(userId, 'logged_out');
      }
    } else {
      this.logger.warn(
        `Nenhum socket ativo para desconectar ${userId}, limpando diretório da sessão.`,
      );
      await this.removeSessionDir(userId);
      this.whatsappGateway.sendStatusUpdate(userId, 'logged_out');
    }
  }
}
