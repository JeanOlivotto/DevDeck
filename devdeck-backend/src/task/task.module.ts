import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
// PrismaModule já é global

@Module({
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
