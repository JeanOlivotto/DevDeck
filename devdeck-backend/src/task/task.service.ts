import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import {
  CreateSubtaskDto,
  CreateTaskDto,
  CreateEmployeeTicketDto,
  UpdateSubtaskDto,
  UpdateTaskDto,
  CreateTicketDto,
} from './dto/task.dto';

const STATUS_LABELS: Record<string, string> = {
  TODO: 'Na Fila',
  DOING: 'Em Andamento',
  DONE: 'Concluído',
};

@Injectable()
export class TaskService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

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
    files?: Express.Multer.File[],
  ) {
    const board = await this.prisma.board.findUnique({
      where: { publicToken: publicToken },
    });

    if (!board || !board.isPublicTicketBoard) {
      throw new NotFoundException('Quadro de tickets inválido ou desativado.');
    }

    const attachments = files?.length
      ? JSON.stringify(files.map((f) => `/uploads/${f.filename}`))
      : null;

    return this.prisma.task.create({
      data: {
        title: createTicketDto.title,
        description: createTicketDto.description,
        status: 'TODO',
        boardId: board.id,
        priority: 'MEDIUM',
        isTicket: true,
        requesterName: createTicketDto.requesterName,
        requesterEmail: createTicketDto.requesterEmail,
        category: createTicketDto.category,
        tags: `ticket,suporte${createTicketDto.category ? ',' + createTicketDto.category.toLowerCase().replace(/\s+/g, '-') : ''}`,
        attachments,
      },
    });
  }

  async createEmployeeTicket(
    userId: number,
    dto: CreateEmployeeTicketDto,
    files?: Express.Multer.File[],
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    const board = await this.prisma.board.findFirst({
      where: { isMainTicketBoard: true },
    });
    if (!board) {
      throw new NotFoundException(
        'Nenhum board principal de tickets configurado. Contate o administrador.',
      );
    }

    const attachments = files?.length
      ? JSON.stringify(files.map((f) => `/uploads/${f.filename}`))
      : null;

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: 'TODO',
        boardId: board.id,
        priority: 'MEDIUM',
        isTicket: true,
        category: dto.category,
        requesterUserId: userId,
        requesterName: user.name,
        requesterEmail: user.email,
        tags: `ticket,${dto.category.toLowerCase().replace(/\s+/g, '-')}`,
        attachments,
      },
    });
  }

  async findMyTickets(userId: number) {
    return this.prisma.task.findMany({
      where: { requesterUserId: userId },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        status: true,
        priority: true,
        attachments: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
        assignedUser: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(boardId: number) {
    return this.prisma.task.findMany({
      where: { boardId },
      include: {
        subtasks: { orderBy: { id: 'asc' } },
        assignedUser: { select: { id: true, name: true, email: true } },
        requester: {
          select: { id: true, name: true, email: true, company: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        subtasks: true,
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const existing = await this.findOne(id);
    const updated = await this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });

    if (
      updateTaskDto.status &&
      updateTaskDto.status !== existing.status &&
      existing.requesterUserId
    ) {
      const requester = await this.prisma.user.findUnique({
        where: { id: existing.requesterUserId },
      });
      if (requester) {
        const statusLabel =
          STATUS_LABELS[updateTaskDto.status] || updateTaskDto.status;
        await this.emailService.sendEmail(
          requester.email,
          `Atualização do seu ticket: ${existing.title}`,
          `Olá ${requester.name},\n\nSeu ticket "${existing.title}" foi atualizado para: ${statusLabel}.\n\nAtt,\nEquipe de Desenvolvimento BJGROUP`,
          `<p>Olá <strong>${requester.name}</strong>,</p><p>Seu ticket <strong>"${existing.title}"</strong> foi atualizado para: <strong>${statusLabel}</strong>.</p><br><p>Att,<br>Equipe de Desenvolvimento BJGROUP</p>`,
        );
      }
    }

    return updated;
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
