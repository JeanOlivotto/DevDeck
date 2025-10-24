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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WhatsappGateway } from './whatsapp.gateway';

@Controller('whatsapp')
@UseGuards(JwtAuthGuard)
export class WhatsappController {
  constructor(private readonly whatsappGateway: WhatsappGateway) {}

  // Obter estado inicial
  @Get('status')
  async getStatus(@Req() req) {
    const userId = req.user.userId;
    return this.whatsappGateway.getInitialState(userId);
  }

  // Conectar WhatsApp
  @Post('connect')
  @HttpCode(HttpStatus.OK)
  async connect(@Req() req) {
    const userId = req.user.userId;
    return this.whatsappGateway.handleConnectRequest(userId);
  }

  // Desconectar WhatsApp
  @Post('disconnect')
  @HttpCode(HttpStatus.OK)
  async disconnect(@Req() req) {
    const userId = req.user.userId;
    return this.whatsappGateway.handleDisconnectRequest(userId);
  }

  // Enviar mensagem teste
  @Post('test-message')
  @HttpCode(HttpStatus.OK)
  async sendTestMessage(@Req() req) {
    const userId = req.user.userId;
    return this.whatsappGateway.handleSendTestMessage(userId);
  }
}
