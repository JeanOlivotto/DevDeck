/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client'; // Importe User se precisar do tipo

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Encontra um usuário pelo ID
  async findOneById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    // Não lançamos NotFoundException aqui, pois pode ser usado para verificações
    return user;
  }

  // Encontra um usuário pelo email (útil para login e verificação de cadastro)
  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Cria um novo usuário (usado pelo AuthService no cadastro)
  // Recebe email e a senha JÁ HASHADA
  async create(data: Prisma.UserCreateInput): Promise<User> {
    // A verificação se o email já existe geralmente é feita antes de chamar create,
    // mas o Prisma lançará um erro P2002 se tentarmos criar com email duplicado.
    return this.prisma.user.create({
      data,
    });
  }

  // Você pode adicionar outros métodos conforme necessário (ex: update, delete)
}
