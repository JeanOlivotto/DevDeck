/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  ForbiddenException, // <-- Importe ForbiddenException
  Logger, // <-- Opcional: Importe Logger
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name); // Opcional

  constructor(private readonly prisma: PrismaService) {}

  // Modificado para receber userId e verificar boardId
  async create(createTaskDto: CreateTaskDto, userId: number) {
    // Verifica se o board existe E pertence ao usuário
    await this.findBoardOrFailForUser(createTaskDto.boardId, userId);

    try {
      return await this.prisma.task.create({
        data: createTaskDto, // boardId já está no DTO
        include: { board: true },
      });
    } catch (error) {
      this.logger.error('Erro ao criar tarefa:', error);
      throw error;
    }
  }

  // Modificado para receber userId e filtrar por ele ou por boardId (do usuário)
  async findAll(userId: number, boardId?: number) {
    const whereCondition: Prisma.TaskWhereInput = {};

    if (boardId) {
      // Garante que o boardId pertence ao usuário antes de filtrar as tasks
      await this.findBoardOrFailForUser(boardId, userId);
      whereCondition.boardId = boardId;
    } else {
      // Se nenhum boardId específico foi pedido, busca tarefas de TODOS os quadros do usuário
      whereCondition.board = {
        userId: userId,
      };
    }

    return await this.prisma.task.findMany({
      where: whereCondition,
      include: { board: true }, // Inclui board para contexto, mesmo filtrando por board.userId
      orderBy: { createdAt: 'asc' },
    });
  }

  // Modificado para receber userId e verificar pertencimento da tarefa (via quadro)
  async findOne(id: number, userId: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { board: true }, // Inclui o board para verificar o userId
    });

    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada.`);
    }
    // Verifica se o quadro da tarefa pertence ao usuário logado
    if (task.board.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esta tarefa.',
      );
    }
    return task;
  }

  // Modificado para receber userId e verificar pertencimento
  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number) {
    // findOne já verifica se a tarefa existe E pertence ao usuário (via board)
    const existingTask = await this.findOne(id, userId);

    // Se o boardId estiver sendo alterado, verifica se o NOVO board pertence ao usuário
    if (
      updateTaskDto.boardId &&
      updateTaskDto.boardId !== existingTask.boardId
    ) {
      await this.findBoardOrFailForUser(updateTaskDto.boardId, userId);
    }

    try {
      return await this.prisma.task.update({
        where: { id }, // Não precisa mais where: { id, board: { userId } }
        data: updateTaskDto,
        include: { board: true },
      });
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar tarefa ${id} pelo usuário ${userId}:`,
        error,
      );
      throw error;
    }
  }

  // Modificado para receber userId e verificar pertencimento
  async remove(id: number, userId: number) {
    // findOne já verifica se a tarefa existe E pertence ao usuário (via board)
    await this.findOne(id, userId);

    try {
      await this.prisma.task.delete({
        where: { id }, // Não precisa mais where: { id, board: { userId } }
      });
      this.logger.log(
        `Tarefa com ID ${id} excluída com sucesso pelo usuário ${userId}.`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao remover tarefa ${id} pelo usuário ${userId}:`,
        error,
      );
      throw error;
    }
  }

  // Função auxiliar modificada para verificar board E pertencimento ao usuário
  private async findBoardOrFailForUser(boardId: number, userId: number) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });
    if (!board) {
      throw new NotFoundException(`Quadro com ID ${boardId} não encontrado.`);
    }
    if (board.userId !== userId) {
      throw new ForbiddenException(
        `Quadro com ID ${boardId} não pertence a você.`,
      );
    }
    return board; // Retorna o quadro se encontrado e pertencer ao usuário
  }

  // Remover a função findBoardOrFail antiga se não for mais usada em outro lugar
  // private async findBoardOrFail(boardId: number) { ... }
}
