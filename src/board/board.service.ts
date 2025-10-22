import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BoardService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.board.findMany({ include: { tasks: true } });
  }

  async findOne(id: number) {
    return await this.prisma.board.findUnique({ where: { id }, include: { tasks: true } });
  }

  async create(data: { name: string }) {
    return await this.prisma.board.create({ data });
  }
}
