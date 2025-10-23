/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
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
  ): Promise<Omit<User, 'password' | 'whatsappSession'>> {
    // Omitir whatsappSession
    // Verifica se o usuário existe
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExists) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado.`);
    }

    // Validação extra: Se notifyViaWhatsApp é true, whatsappNumber não pode ser null/vazio
    if (settings.notifyViaWhatsApp === true) {
      // Se o número não está sendo atualizado agora, busca o atual no banco
      const currentNumber =
        settings.whatsappNumber ?? userExists.whatsappNumber;
      if (!currentNumber) {
        throw new InternalServerErrorException(
          'É necessário fornecer um número de WhatsApp para ativar as notificações.',
        );
      }
      // Atualiza o número no DTO se ele foi buscado do banco, para garantir que seja salvo
      if (!settings.whatsappNumber && currentNumber) {
        settings.whatsappNumber = currentNumber;
      }
    }
    // Se está desativando as notificações, NÃO limpar o número automaticamente
    // if (settings.notifyViaWhatsApp === false) {
    //     settings.whatsappNumber = null; // Ou manter o número salvo
    // }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: settings, // Salva todas as configurações passadas
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, whatsappSession, ...result } = updatedUser; // Remover whatsappSession da resposta
      return result;
    } catch (error) {
      this.logger.error(
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
