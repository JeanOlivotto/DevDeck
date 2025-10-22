import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.task.findMany({ include: { board: true } });
  }

  async findOne(id: number) {
    return await this.prisma.task.findUnique({ where: { id }, include: { board: true } });
  }

  async create(data: any) {
    return await this.prisma.task.create({ data });
  }

  async update(id: number, data: any) {
    return await this.prisma.task.update({ where: { id }, data });
  }
}
