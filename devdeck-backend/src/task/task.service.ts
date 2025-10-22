import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    // Verifica se o board existe antes de criar a tarefa
    await this.findBoardOrFail(createTaskDto.boardId);

    try {
      return await this.prisma.task.create({
        data: createTaskDto,
        include: { board: true }, // Inclui dados do board na resposta
      });
    } catch (error) {
      // Tratamento de erros específicos do Prisma podem ser adicionados aqui
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  }

  async findAll(boardId?: number) {
    const whereCondition: Prisma.TaskWhereInput = {};
    if (boardId) {
      whereCondition.boardId = boardId;
    }

    return await this.prisma.task.findMany({
      where: whereCondition,
      include: { board: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { board: true },
    });
    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada.`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    // Garante que a tarefa existe
    await this.findOne(id);

    // Se o boardId for alterado, verifica se o novo board existe
    if (updateTaskDto.boardId) {
      await this.findBoardOrFail(updateTaskDto.boardId);
    }

    try {
      return await this.prisma.task.update({
        where: { id },
        data: updateTaskDto,
        include: { board: true },
      });
    } catch (error) {
      console.error(`Erro ao atualizar tarefa ${id}:`, error);
      throw error;
    }
  }

  async remove(id: number) {
    // Garante que a tarefa existe antes de deletar
    await this.findOne(id);

    try {
      await this.prisma.task.delete({
        where: { id },
      });
      // Retorna void ou uma mensagem de sucesso
    } catch (error) {
      console.error(`Erro ao remover tarefa ${id}:`, error);
      throw error;
    }
  }

  // Função auxiliar para verificar se um board existe
  private async findBoardOrFail(boardId: number) {
    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException(`Quadro com ID ${boardId} não encontrado.`);
    }
    return board;
  }
}
