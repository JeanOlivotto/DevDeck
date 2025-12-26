import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TaskService } from './task.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  CreateSubtaskDto,
  UpdateSubtaskDto,
  CreateTicketDto,
} from './dto/task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req, @Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto, req.user.userId);
  }

  // ROTA PÚBLICA: Criar Ticket (Sem Guard)
  // POST /tasks/ticket/TOKEN_DO_BOARD
  @Post('ticket/:token')
  async createTicket(
    @Param('token') token: string,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    return this.taskService.createPublicTicket(token, createTicketDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('boardId') boardId: string) {
    return this.taskService.findAll(+boardId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(+id, updateTaskDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskService.remove(+id);
  }

  // Subtasks
  @UseGuards(JwtAuthGuard)
  @Post(':id/subtasks')
  createSubtask(
    @Param('id') id: string,
    @Body() createSubtaskDto: CreateSubtaskDto,
  ) {
    return this.taskService.createSubtask(+id, createSubtaskDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/subtasks/:subtaskId')
  updateSubtask(
    @Param('id') id: string,
    @Param('subtaskId') subtaskId: string,
    @Body() updateSubtaskDto: UpdateSubtaskDto,
  ) {
    return this.taskService.updateSubtask(+id, +subtaskId, updateSubtaskDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/subtasks/:subtaskId')
  removeSubtask(
    @Param('id') id: string,
    @Param('subtaskId') subtaskId: string,
  ) {
    return this.taskService.removeSubtask(+id, +subtaskId);
  }
}
