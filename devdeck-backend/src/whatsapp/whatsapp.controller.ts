/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// devdeck-backend/src/whatsapp/whatsapp.controller.ts
import {
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WhatsappGateway } from './whatsapp.gateway';

@Controller('whatsapp')
@UseGuards(JwtAuthGuard)
export class WhatsappController {
  constructor(private readonly whatsappGateway: WhatsappGateway) {}

  // Verifica se está rodando na Vercel
  private isVercel(): boolean {
    return process.env.VERCEL === '1' || !!process.env.VERCEL_URL;
  }

  private throwIfVercel() {
    if (this.isVercel()) {
      throw new BadRequestException(
        'WhatsApp não está disponível na Vercel (ambiente serverless). ' +
          'Para usar notificações via WhatsApp, deploy o backend em: ' +
          'Railway.app, Render.com ou um VPS. ' +
          'As notificações por email continuam funcionando normalmente.',
      );
    }
  }

  // Obter estado inicial
  @Get('status')
  async getStatus(@Req() req) {
    if (this.isVercel()) {
      return {
        status: 'unavailable',
        reason: 'WhatsApp não disponível em ambiente serverless (Vercel)',
        available: false,
      };
    }
    const userId = req.user.userId;
    return this.whatsappGateway.getInitialState(userId);
  }

  // Conectar WhatsApp
  @Post('connect')
  @HttpCode(HttpStatus.OK)
  async connect(@Req() req) {
    this.throwIfVercel();
    const userId = req.user.userId;
    return this.whatsappGateway.handleConnectRequest(userId);
  }

  // Desconectar WhatsApp
  @Post('disconnect')
  @HttpCode(HttpStatus.OK)
  async disconnect(@Req() req) {
    this.throwIfVercel();
    const userId = req.user.userId;
    return this.whatsappGateway.handleDisconnectRequest(userId);
  }

  // Enviar mensagem teste
  @Post('test-message')
  @HttpCode(HttpStatus.OK)
  async sendTestMessage(@Req() req) {
    this.throwIfVercel();
    const userId = req.user.userId;
    return this.whatsappGateway.handleSendTestMessage(userId);
  }
}
