import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/board.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BoardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBoardDto: CreateBoardDto) {
    try {
      return await this.prisma.board.create({
        data: createBoardDto,
      });
    } catch (error) {
      // Trata erro de nome único
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new NotFoundException(
          `Um quadro com o nome '${createBoardDto.name}' já existe.`,
        );
      }
      throw error;
    }
  }

  async findAll() {
    // Ordena os quadros por ID e inclui as tarefas ordenadas por createdAt
    return await this.prisma.board.findMany({
      include: {
        tasks: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
    if (!board) {
      throw new NotFoundException(`Quadro com ID ${id} não encontrado.`);
    }
    return board;
  }

  // Opcional: Adicionar Update e Remove
  // async update(id: number, updateBoardDto: UpdateBoardDto) { ... }
  // async remove(id: number) { ... }
}
