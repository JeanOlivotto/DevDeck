/* eslint-disable @typescript-eslint/require-await */
import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappGateway } from './whatsapp.gateway';
import { JwtModule } from '@nestjs/jwt'; // Necessário para o Gateway autenticar
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EncryptionModule } from 'src/encryption/encryption.module';
// EncryptionModule já é global
// PrismaModule já é global

@Module({
  imports: [
    ConfigModule, // Garante que ConfigService esteja disponível
    EncryptionModule,
    JwtModule.registerAsync({
      // Configura JwtModule para o Gateway
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Use sua variável .env
        // signOptions: { expiresIn: '...', }, // Opcional se precisar assinar
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [WhatsappService, WhatsappGateway],
  exports: [WhatsappService, WhatsappGateway], // Exporta o serviço para ser usado em NotificationService
})
export class WhatsappModule {}
