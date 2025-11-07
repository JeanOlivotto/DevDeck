// devdeck-backend/src/whatsapp/whatsapp.module.ts
import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappGateway } from './whatsapp.gateway';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappMetaService } from './whatsapp-meta.service';
import { WhatsappMetaController } from './whatsapp-meta.controller';
import { ConfigModule } from '@nestjs/config';
import { EncryptionModule } from 'src/encryption/encryption.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [ConfigModule, EncryptionModule, PrismaModule],
  controllers: [WhatsappController, WhatsappMetaController],
  providers: [WhatsappService, WhatsappGateway, WhatsappMetaService],
  exports: [WhatsappService, WhatsappGateway, WhatsappMetaService],
})
export class WhatsappModule {}
