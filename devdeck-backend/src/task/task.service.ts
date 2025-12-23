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

  // Modificado para receber userId e filtrar por ele (personal) ou grupos
  async findAll(userId: number, boardId?: number) {
    const whereCondition: Prisma.TaskWhereInput = {};

    if (boardId) {
      // Garante que o boardId existe e pertence ao usuário ou grupo
      await this.findBoardOrFailForUser(boardId, userId);
      whereCondition.boardId = boardId;
    } else {
      // Busca tarefas de todos os boards acessíveis (personal + grupos)
      whereCondition.board = {
        OR: [
          { userId: userId }, // Boards pessoais
          {
            // Boards de grupos onde user é membro
            group: {
              members: {
                some: {
                  userId: userId,
                  inviteStatus: 'accepted',
                },
              },
            },
          },
        ],
      };
    }

    return await this.prisma.task.findMany({
      where: whereCondition,
      include: { board: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Modificado para receber userId e verificar pertencimento (personal ou grupo)
  async findOne(id: number, userId: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        board: {
          include: { group: { include: { members: true } } },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada.`);
    }

    // Verificar acesso
    if (task.board.type === 'personal') {
      if (task.board.userId !== userId) {
        throw new ForbiddenException(
          'Você não tem permissão para acessar esta tarefa.',
        );
      }
    } else if (task.board.type === 'group') {
      const isMember = task.board.group?.members.some(
        (m) => m.userId === userId && m.inviteStatus === 'accepted',
      );
      if (!isMember) {
        throw new ForbiddenException(
          'Você não é membro do grupo desta tarefa.',
        );
      }
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

  // Função auxiliar para verificar board E pertencimento (personal ou grupo)
  private async findBoardOrFailForUser(boardId: number, userId: number) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        group: { include: { members: true } },
      },
    });

    if (!board) {
      throw new NotFoundException(`Quadro com ID ${boardId} não encontrado.`);
    }

    // Verificar acesso
    if (board.type === 'personal') {
      if (board.userId !== userId) {
        throw new ForbiddenException(
          `Quadro pessoal com ID ${boardId} não pertence a você.`,
        );
      }
    } else if (board.type === 'group') {
      const isMember = board.group?.members.some(
        (m) => m.userId === userId && m.inviteStatus === 'accepted',
      );
      if (!isMember) {
        throw new ForbiddenException(
          'Você não é membro do grupo deste quadro.',
        );
      }
    }

    return board;
  }
}
