import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module'; // Importa o PrismaModule
import { BoardModule } from './board/board.module';
import { TaskModule } from './task/task.module';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [
    PrismaModule, // Disponibiliza o PrismaService globalmente
    BoardModule,
    TaskModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AuthController],
  providers: [UserService, AuthService],
})
export class AppModule {}
