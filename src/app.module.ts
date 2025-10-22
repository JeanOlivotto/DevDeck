import { Module } from '@nestjs/common';
import { BoardModule } from './board/board.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [BoardModule, TaskModule],
})
export class AppModule {}
