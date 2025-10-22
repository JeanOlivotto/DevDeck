import {
  Controller,
  Get,
  Post,
  Body,
  Patch, // Usar PATCH para atualizações parciais
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query, // Para filtrar por boardId
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Get()
  findAll(@Query('boardId') boardId?: string) {
    // Filtra tarefas por boardId se o query parameter for fornecido
    const boardIdNum = boardId ? parseInt(boardId, 10) : undefined;
    if (boardId && isNaN(boardIdNum)) {
      // Tratamento básico se boardId não for um número válido
      return [];
    }
    return this.taskService.findAll(boardIdNum);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Retorna 204 No Content
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.remove(id);
  }
}
