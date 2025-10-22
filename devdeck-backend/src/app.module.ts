import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module'; // Importa o PrismaModule
import { BoardModule } from './board/board.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [
    PrismaModule, // Disponibiliza o PrismaService globalmente
    BoardModule,
    TaskModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
