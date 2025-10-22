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
    let boardIdNum: number | undefined = undefined;

    // Se boardId foi fornecido (não é undefined)
    if (boardId !== undefined) {
      boardIdNum = parseInt(boardId, 10);
      // Agora checamos com segurança, pois boardIdNum é um 'number' (ou NaN)
      if (isNaN(boardIdNum)) {
        // Se não for um número válido (ex: "abc" ou ""), retorna vazio
        return [];
      }
    }

    // Passa 'undefined' (se nada foi fornecido) ou o número (se era "123")
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
