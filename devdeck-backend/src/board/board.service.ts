/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  Logger,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateBoardDto,
  UpdateBoardDto,
  ReorderBoardsDto,
} from './dto/board.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BoardService implements OnModuleInit {
  private readonly logger = new Logger(BoardService.name);
  private readonly defaultBoards = [
    'Tasks Pendentes',
    'Novas Ideias',
    'Alinhamento com Cliente',
  ];

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    // Você pode deixar em branco se não quiser inicializar boards padrão
  }

  /**
   * Criar novo board (personal ou group)
   */
  async create(createBoardDto: CreateBoardDto, userId: number) {
    try {
      const boardData: any = {
        name: createBoardDto.name,
        type: createBoardDto.type || 'personal',
      };

      // Se type é 'group', groupId é obrigatório
      if (boardData.type === 'group') {
        if (!createBoardDto.groupId) {
          throw new BadRequestException(
            'groupId é obrigatório para criar um quadro de grupo',
          );
        }

        // Verificar se o usuário é membro do grupo
        const groupMember = await this.prisma.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId: createBoardDto.groupId,
              userId: userId,
            },
          },
        });

        if (!groupMember || groupMember.inviteStatus !== 'accepted') {
          throw new ForbiddenException('Você não é membro deste grupo');
        }

        boardData.groupId = createBoardDto.groupId;
      } else {
        // Personal board
        boardData.userId = userId;
      }

      return await this.prisma.board.create({
        data: boardData,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Você já possui um quadro com o nome '${createBoardDto.name}'.`,
        );
      }
      this.logger.error('Erro ao criar quadro:', error);
      throw error;
    }
  }

  /**
   * Listar boards (personal + grupos)
   */
  async findAll(userId: number, groupId?: number) {
    const where: any = {};

    if (groupId) {
      // Se groupId fornecido, retorna apenas boards do grupo
      where.groupId = groupId;

      // Verificar se user é membro do grupo
      const groupMember = await this.prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId,
          },
        },
      });

      if (!groupMember || groupMember.inviteStatus !== 'accepted') {
        throw new ForbiddenException('Você não é membro deste grupo');
      }
    } else {
      // Se sem groupId, retorna boards pessoais + de grupos onde user é membro
      where.OR = [
        { userId: userId },
        {
          group: {
            members: {
              some: {
                userId: userId,
                inviteStatus: 'accepted',
              },
            },
          },
        },
      ];
    }

    return await this.prisma.board.findMany({
      where,
      include: { tasks: { orderBy: { createdAt: 'asc' } } },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Obter um board específico (personal ou grupo)
   */
  async findOne(id: number, userId: number) {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: {
        tasks: { orderBy: { createdAt: 'asc' } },
        group: { include: { members: true } },
      },
    });

    if (!board) {
      throw new NotFoundException(`Quadro com ID ${id} não encontrado.`);
    }

    // Verificar acesso
    if (board.type === 'personal') {
      if (board.userId !== userId) {
        throw new ForbiddenException(
          'Você não tem permissão para acessar este quadro.',
        );
      }
    } else if (board.type === 'group') {
      const isMember = board.group?.members.some(
        (m) => m.userId === userId && m.inviteStatus === 'accepted',
      );
      if (!isMember) {
        throw new ForbiddenException('Você não é membro deste grupo.');
      }
    }

    return board;
  }

  /**
   * Atualizar um board
   */
  async update(id: number, updateBoardDto: UpdateBoardDto, userId: number) {
    const board = await this.findOne(id, userId);

    if (!updateBoardDto.name) {
      throw new BadRequestException('Nenhum dado fornecido para atualização.');
    }

    try {
      return await this.prisma.board.update({
        where: { id },
        data: { name: updateBoardDto.name },
        include: { tasks: { orderBy: { createdAt: 'asc' } } },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Um quadro com este nome já existe.');
      }
      this.logger.error(`Erro ao atualizar quadro ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deletar um board
   */
  async remove(id: number, userId: number) {
    await this.findOne(id, userId);

    try {
      await this.prisma.board.delete({
        where: { id },
      });
      this.logger.log(
        `Quadro com ID ${id} excluído com sucesso pelo usuário ${userId}.`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao remover quadro ${id} pelo usuário ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Reordenar boards (personal ou grupo)
   */
  async reorderBoards(reorderDto: ReorderBoardsDto, userId: number) {
    // Verifica se todos os quadros pertencem ao usuário (personal) ou grupos que é membro
    const boardIds = reorderDto.boards.map((b) => b.id);
    const boards = await this.prisma.board.findMany({
      where: {
        id: { in: boardIds },
      },
      include: { group: { include: { members: true } } },
    });

    // Validar acesso para cada board
    for (const board of boards) {
      if (board.type === 'personal' && board.userId !== userId) {
        throw new ForbiddenException(
          'Você não tem permissão para reordenar este quadro pessoal.',
        );
      }
      if (board.type === 'group') {
        const isMember = board.group?.members.some(
          (m) => m.userId === userId && m.inviteStatus === 'accepted',
        );
        if (!isMember) {
          throw new ForbiddenException('Você não é membro deste grupo.');
        }
      }
    }

    // Atualiza a ordem de cada quadro
    const updatePromises = reorderDto.boards.map((board) =>
      this.prisma.board.update({
        where: { id: board.id },
        data: { order: board.order },
      }),
    );

    await Promise.all(updatePromises);

    // Retorna os quadros atualizados
    return await this.findAll(userId);
  }
}
