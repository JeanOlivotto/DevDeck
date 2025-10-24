// devdeck-backend/src/whatsapp/whatsapp.module.ts
import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappGateway } from './whatsapp.gateway';
import { WhatsappController } from './whatsapp.controller';
import { ConfigModule } from '@nestjs/config';
import { EncryptionModule } from 'src/encryption/encryption.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [ConfigModule, EncryptionModule, PrismaModule],
  controllers: [WhatsappController],
  providers: [WhatsappService, WhatsappGateway],
  exports: [WhatsappService, WhatsappGateway],
})
export class WhatsappModule {}
