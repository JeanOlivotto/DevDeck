/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Serviço para enviar mensagens WhatsApp usando Meta Business API
 * ✅ FUNCIONA NA VERCEL (não precisa de WebSocket persistente)
 * ✅ GRATUITO: 1000 conversas/mês por usuário
 * ✅ Controla limite automático para não cobrar
 *
 * Setup:
 * 1. Usuário acessa https://developers.facebook.com/apps
 * 2. Cria um app > Adiciona WhatsApp
 * 3. Obtém: PHONE_NUMBER_ID e ACCESS_TOKEN
 * 4. Salva nas configurações do perfil
 */
@Injectable()
export class WhatsappMetaService {
  private readonly logger = new Logger(WhatsappMetaService.name);
  private readonly MESSAGE_LIMIT = 950; // Limite seguro (50 de margem)

  constructor(private prisma: PrismaService) {}

  /**
   * Verifica se o usuário tem WhatsApp Meta configurado
   */
  async isConfigured(userId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        whatsappMetaPhoneNumberId: true,
        whatsappMetaAccessToken: true,
      },
    });

    return !!(user?.whatsappMetaPhoneNumberId && user?.whatsappMetaAccessToken);
  }

  /**
   * Obtém status do usuário (mensagens enviadas, limite, etc)
   */
  async getStatus(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        whatsappMetaPhoneNumberId: true,
        whatsappMetaAccessToken: true,
        whatsappMessagesThisMonth: true,
        whatsappMonthResetDate: true,
        whatsappNumber: true,
        notifyViaWhatsApp: true,
      },
    });

    if (!user) {
      return {
        configured: false,
        messagesUsed: 0,
        messagesRemaining: 1000,
        limitReached: false,
      };
    }

    // Verificar se precisa resetar o contador (novo mês)
    await this.checkAndResetMonthlyCounter(userId, user.whatsappMonthResetDate);

    // Recarregar dados após possível reset
    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { whatsappMessagesThisMonth: true },
    });

    const messagesUsed = updatedUser?.whatsappMessagesThisMonth || 0;
    const configured = !!(
      user.whatsappMetaPhoneNumberId && user.whatsappMetaAccessToken
    );

    return {
      configured,
      messagesUsed,
      messagesRemaining: Math.max(0, this.MESSAGE_LIMIT - messagesUsed),
      limitReached: messagesUsed >= this.MESSAGE_LIMIT,
      phoneNumber: user.whatsappNumber,
      enabled: user.notifyViaWhatsApp,
    };
  }

  /**
   * Verifica e reseta o contador mensal se necessário
   */
  private async checkAndResetMonthlyCounter(
    userId: number,
    lastResetDate: Date | null,
  ): Promise<void> {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Se não tem data de reset ou é um mês diferente, resetar
    if (
      !lastResetDate ||
      lastResetDate.getMonth() !== currentMonth ||
      lastResetDate.getFullYear() !== currentYear
    ) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          whatsappMessagesThisMonth: 0,
          whatsappMonthResetDate: new Date(currentYear, currentMonth, 1),
        },
      });

      this.logger.log(`Contador de mensagens resetado para usuário ${userId}`);
    }
  }

  /**
   * Envia mensagem de texto via WhatsApp
   * @param userId ID do usuário (usa suas credenciais)
   * @param to Número com código do país (ex: 5519999998888)
   * @param message Texto da mensagem
   * @returns Objeto com sucesso e informações
   */
  async sendMessage(
    userId: number,
    to: string,
    message: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Buscar credenciais do usuário
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          whatsappMetaPhoneNumberId: true,
          whatsappMetaAccessToken: true,
          whatsappMessagesThisMonth: true,
          whatsappMonthResetDate: true,
        },
      });

      if (!user?.whatsappMetaPhoneNumberId || !user?.whatsappMetaAccessToken) {
        return {
          success: false,
          error: 'WhatsApp Meta API não configurado. Configure nas opções.',
        };
      }

      // Verificar e resetar contador se necessário
      await this.checkAndResetMonthlyCounter(
        userId,
        user.whatsappMonthResetDate,
      );

      // Recarregar contador atualizado
      const updatedUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { whatsappMessagesThisMonth: true },
      });

      const messagesUsed = updatedUser?.whatsappMessagesThisMonth || 0;

      // Verificar limite
      if (messagesUsed >= this.MESSAGE_LIMIT) {
        this.logger.warn(
          `Usuário ${userId} atingiu o limite de mensagens (${messagesUsed}/${this.MESSAGE_LIMIT})`,
        );
        return {
          success: false,
          error: `Limite mensal atingido (${messagesUsed}/${this.MESSAGE_LIMIT}). Redefine no próximo mês.`,
        };
      }

      // Limpa e formata o número
      const cleanNumber = to.replace(/\D/g, '');
      const internationalNumber = cleanNumber.startsWith('55')
        ? cleanNumber
        : `55${cleanNumber}`;

      this.logger.log(
        `[${userId}] Enviando WhatsApp para ${internationalNumber} (${messagesUsed + 1}/${this.MESSAGE_LIMIT})`,
      );

      const apiUrl = `https://graph.facebook.com/v18.0/${user.whatsappMetaPhoneNumberId}/messages`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.whatsappMetaAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: internationalNumber,
          type: 'text',
          text: {
            preview_url: false,
            body: message,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        this.logger.error(`Erro ao enviar via Meta API (${userId}):`, error);
        return {
          success: false,
          error: `Erro da API: ${error.error?.message || 'Desconhecido'}`,
        };
      }

      const result = await response.json();
      const messageId = result.messages[0].id;

      // Incrementar contador
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          whatsappMessagesThisMonth: { increment: 1 },
        },
      });

      this.logger.log(
        `✅ [${userId}] Mensagem enviada! ID: ${messageId} (${messagesUsed + 1}/${this.MESSAGE_LIMIT})`,
      );

      return {
        success: true,
        messageId,
      };
    } catch (error) {
      this.logger.error(`Erro ao enviar WhatsApp (${userId}):`, error);
      return {
        success: false,
        error: (error as Error).message || 'Erro desconhecido',
      };
    }
  }

  /**
   * Salva/atualiza credenciais do Meta WhatsApp para o usuário
   */
  async saveCredentials(
    userId: number,
    phoneNumberId: string,
    accessToken: string,
  ): Promise<boolean> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          whatsappMetaPhoneNumberId: phoneNumberId,
          whatsappMetaAccessToken: accessToken,
          whatsappMonthResetDate: new Date(), // Inicia o contador
        },
      });

      this.logger.log(
        `✅ Credenciais Meta WhatsApp salvas para usuário ${userId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Erro ao salvar credenciais para ${userId}:`, error);
      return false;
    }
  }

  /**
   * Remove credenciais do usuário
   */
  async removeCredentials(userId: number): Promise<boolean> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          whatsappMetaPhoneNumberId: null,
          whatsappMetaAccessToken: null,
          whatsappMessagesThisMonth: 0,
        },
      });

      this.logger.log(
        `🗑️ Credenciais Meta WhatsApp removidas para usuário ${userId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Erro ao remover credenciais para ${userId}:`, error);
      return false;
    }
  }
}
