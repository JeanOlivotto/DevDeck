import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module'; // Importa o PrismaModule
import { BoardModule } from './board/board.module';
import { TaskModule } from './task/task.module';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { UserController } from './user/user.controller';
import { EmailModule } from './email/email.module';
import { EmailService } from './email/email.service';
import { NotificationModule } from './notification/notification.module';
import { NotificationService } from './notification/notification.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule, // Disponibiliza o PrismaService globalmente
    BoardModule,
    TaskModule,
    UserModule,
    AuthModule,
    EmailModule,
    NotificationModule,
  ],
  controllers: [AuthController, UserController],
  providers: [UserService, AuthService, EmailService, NotificationService],
})
export class AppModule {}
