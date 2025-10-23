import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client'; // Importe User se precisar do tipo
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
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

  async updateSettings(
    userId: number,
    settings: UpdateUserSettingsDto,
  ): Promise<Omit<User, 'password'>> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: settings,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = updatedUser;
      return result;
    } catch (error) {
      this.logger?.error?.(
        `Erro ao atualizar configurações do usuário ${userId}`,
        error,
      );
      throw new InternalServerErrorException(
        'Não foi possível salvar as configurações.',
      );
    }
  }
  async create(data: Prisma.UserCreateInput): Promise<User> {
    // A verificação se o email já existe geralmente é feita antes de chamar create,
    // mas o Prisma lançará um erro P2002 se tentarmos criar com email duplicado.
    return this.prisma.user.create({
      data,
    });
  }

  // Você pode adicionar outros métodos conforme necessário (ex: update, delete)
}
