import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
@Module({
  imports: [UserModule, EmailModule, WhatsappModule],
  providers: [NotificationService],
})
export class NotificationModule {}
