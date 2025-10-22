// src/task/task.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  Req, // Mantido
  BadRequestException,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTaskDto: CreateTaskDto, @Req() req) {
    // <-- req já estava no lugar certo
    const userId = req.user.userId;
    return this.taskService.create(createTaskDto, userId);
  }

  @Get()
  // CORREÇÃO: Inverter a ordem de @Req e @Query
  findAll(@Req() req, @Query('boardId') boardId?: string) {
    // <--- CORRIGIDO
    const userId = req.user.userId;
    let boardIdNum: number | undefined = undefined;

    if (boardId !== undefined) {
      boardIdNum = parseInt(boardId, 10);
      if (isNaN(boardIdNum)) {
        return [];
      }
    }
    // A chamada ao serviço já estava correta
    return this.taskService.findAll(userId, boardIdNum);
  }

  // findOne, update, remove já estavam corretos
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = req.user.userId;
    return this.taskService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req,
  ) {
    const userId = req.user.userId;
    return this.taskService.update(id, updateTaskDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = req.user.userId;
    return this.taskService.remove(id, userId);
  }
}
