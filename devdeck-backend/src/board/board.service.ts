/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  Logger,
  ConflictException,
  BadRequestException,
  ForbiddenException, // <-- Importe ForbiddenException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BoardService implements OnModuleInit {
  // ... (logger, defaultBoards, constructor, onModuleInit mantidos) ...
  private readonly logger = new Logger(BoardService.name);
  private readonly defaultBoards = [
    'Tasks Pendentes',
    'Novas Ideias',
    'Alinhamento com Cliente',
  ];
  constructor(private readonly prisma: PrismaService) {}
  async onModuleInit() {
    /* ... código mantido ... */
  }

  // Modificado para receber userId
  async create(createBoardDto: CreateBoardDto, userId: number) {
    try {
      return await this.prisma.board.create({
        data: {
          name: createBoardDto.name,
          userId: userId, // Associa ao usuário logado
        },
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

  // Modificado para receber userId e filtrar
  async findAll(userId: number) {
    return await this.prisma.board.findMany({
      where: { userId: userId }, // Filtra quadros pelo usuário logado
      include: { tasks: { orderBy: { createdAt: 'asc' } } },
      orderBy: { id: 'asc' },
    });
  }

  // Modificado para receber userId e verificar pertencimento
  async findOne(id: number, userId: number) {
    const board = await this.prisma.board.findUnique({
      where: { id }, // Busca pelo ID primeiro
      include: { tasks: { orderBy: { createdAt: 'asc' } } },
    });

    if (!board) {
      throw new NotFoundException(`Quadro com ID ${id} não encontrado.`);
    }
    // Verifica se o quadro pertence ao usuário logado
    if (board.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este quadro.',
      );
    }
    return board;
  }

  // Modificado para receber userId e verificar pertencimento antes de atualizar
  async update(id: number, updateBoardDto: UpdateBoardDto, userId: number) {
    // findOne já verifica se o quadro existe E pertence ao usuário
    await this.findOne(id, userId);

    if (!updateBoardDto.name) {
      throw new BadRequestException('Nenhum dado fornecido para atualização.');
    }

    try {
      return await this.prisma.board.update({
        where: { id }, // Não precisa mais where: { id, userId } pois findOne já validou
        data: { name: updateBoardDto.name },
        include: { tasks: { orderBy: { createdAt: 'asc' } } },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        // Verifica a constraint única [name, userId]
        const existing = await this.prisma.board.findUnique({
          where: { name_userId: { name: updateBoardDto.name, userId: userId } },
        });
        if (existing) {
          throw new ConflictException(
            `Você já possui um quadro com o nome '${updateBoardDto.name}'.`,
          );
        }
        // Se chegou aqui, pode ser outro erro P2002 inesperado
        this.logger.error(
          `Erro P2002 inesperado ao atualizar quadro ${id}:`,
          error,
        );
      }
      this.logger.error(`Erro ao atualizar quadro ${id}:`, error);
      throw error;
    }
  }

  // Modificado para receber userId e verificar pertencimento antes de remover
  async remove(id: number, userId: number) {
    // findOne já verifica se o quadro existe E pertence ao usuário
    const board = await this.findOne(id, userId);

    // Opcional: Impedir exclusão dos quadros padrão (mantido)
    // if (this.defaultBoards.includes(board.name)) {
    //   throw new BadRequestException(`Não é possível excluir o quadro padrão "${board.name}".`);
    // }

    try {
      await this.prisma.board.delete({
        where: { id }, // Não precisa mais where: { id, userId }
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
}
