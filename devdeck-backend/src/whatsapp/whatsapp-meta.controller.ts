/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WhatsappMetaService } from './whatsapp-meta.service';

@Controller('whatsapp-meta')
@UseGuards(JwtAuthGuard)
export class WhatsappMetaController {
  constructor(private readonly whatsappMetaService: WhatsappMetaService) {}

  /**
   * GET /whatsapp-meta/status
   * Retorna status das configurações do usuário
   */
  @Get('status')
  async getStatus(@Req() req) {
    const userId = req.user.userId;
    return await this.whatsappMetaService.getStatus(userId);
  }

  /**
   * POST /whatsapp-meta/credentials
   * Salva credenciais do Meta WhatsApp
   */
  @Post('credentials')
  @HttpCode(HttpStatus.OK)
  async saveCredentials(
    @Body() body: { phoneNumberId: string; accessToken: string },
    @Req() req,
  ) {
    const userId = req.user.userId;

    if (!body.phoneNumberId || !body.accessToken) {
      return {
        success: false,
        error: 'Phone Number ID e Access Token são obrigatórios',
      };
    }

    const success = await this.whatsappMetaService.saveCredentials(
      userId,
      body.phoneNumberId,
      body.accessToken,
    );

    return {
      success,
      message: success
        ? 'Credenciais salvas com sucesso!'
        : 'Erro ao salvar credenciais',
    };
  }

  /**
   * DELETE /whatsapp-meta/credentials
   * Remove credenciais do usuário
   */
  @Delete('credentials')
  @HttpCode(HttpStatus.OK)
  async removeCredentials(@Req() req) {
    const userId = req.user.userId;

    const success = await this.whatsappMetaService.removeCredentials(userId);

    return {
      success,
      message: success
        ? 'Credenciais removidas com sucesso!'
        : 'Erro ao remover credenciais',
    };
  }

  /**
   * POST /whatsapp-meta/test
   * Envia mensagem de teste
   */
  @Post('test')
  @HttpCode(HttpStatus.OK)
  async sendTestMessage(@Req() req) {
    const userId = req.user.userId;

    const status = await this.whatsappMetaService.getStatus(userId);

    if (!status.configured) {
      return {
        success: false,
        error: 'Configure as credenciais do WhatsApp Meta primeiro',
      };
    }

    if (!status.phoneNumber) {
      return {
        success: false,
        error: 'Configure seu número de WhatsApp nas notificações',
      };
    }

    if (status.limitReached) {
      return {
        success: false,
        error: `Limite mensal atingido (${status.messagesUsed}/${status.messagesUsed + status.messagesRemaining})`,
      };
    }

    const result = await this.whatsappMetaService.sendMessage(
      userId,
      status.phoneNumber,
      `🎉 Teste DevDeck!\n\nSua integração com WhatsApp Meta API está funcionando perfeitamente!\n\n📊 Mensagens usadas este mês: ${status.messagesUsed + 1}/950\n\n✨ Agora você receberá notificações por aqui!`,
    );

    return result;
  }
}
