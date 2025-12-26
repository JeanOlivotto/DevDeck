import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';
@Module({
  imports: [UserModule, EmailModule],
  providers: [NotificationService],
})
export class NotificationModule {}
