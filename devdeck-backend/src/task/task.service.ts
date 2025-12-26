import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSubtaskDto,
  CreateTaskDto,
  UpdateSubtaskDto,
  UpdateTaskDto,
  CreateTicketDto,
} from './dto/task.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, userId: number) {
    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status || 'TODO',
        boardId: createTaskDto.boardId,

        priority: createTaskDto.priority || 'MEDIUM',
        dueDate: createTaskDto.dueDate,
        estimatedTime: createTaskDto.estimatedTime,
        tags: createTaskDto.tags,

        // Se quiser atribuir ao criador:
        // assignedUserId: userId
      },
    });
  }

  async createPublicTicket(
    publicToken: string,
    createTicketDto: CreateTicketDto,
  ) {
    const board = await this.prisma.board.findUnique({
      where: { publicToken: publicToken },
    });

    if (!board || !board.isPublicTicketBoard) {
      throw new NotFoundException('Quadro de tickets inválido ou desativado.');
    }

    return this.prisma.task.create({
      data: {
        title: createTicketDto.title,
        description: createTicketDto.description,
        status: 'TODO',
        boardId: board.id,
        priority: createTicketDto.priority || 'MEDIUM',

        isTicket: true,
        requesterName: createTicketDto.requesterName,
        requesterEmail: createTicketDto.requesterEmail,
        tags: 'ticket,suporte',
      },
    });
  }

  async findAll(boardId: number) {
    return this.prisma.task.findMany({
      where: { boardId },
      include: {
        subtasks: { orderBy: { id: 'asc' } },
        assignedUser: { select: { id: true, name: true, email: true } },
      },
      // CORREÇÃO: Usar createdAt em vez de 'order'
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { subtasks: true },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    await this.findOne(id);
    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.task.delete({
      where: { id },
    });
  }

  async createSubtask(taskId: number, createSubtaskDto: CreateSubtaskDto) {
    return this.prisma.subtask.create({
      data: {
        taskId,
        title: createSubtaskDto.title,
        completed: createSubtaskDto.completed || false,
      },
    });
  }

  async updateSubtask(
    taskId: number,
    subtaskId: number,
    updateSubtaskDto: UpdateSubtaskDto,
  ) {
    return this.prisma.subtask.update({
      where: { id: subtaskId, taskId },
      data: updateSubtaskDto,
    });
  }

  async removeSubtask(taskId: number, subtaskId: number) {
    return this.prisma.subtask.delete({
      where: { id: subtaskId, taskId },
    });
  }
}
