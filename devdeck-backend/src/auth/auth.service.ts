/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    // 1. Verifica se o usuário já existe
    const existingUser = await this.userService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('Este email já está em uso.');
    }

    // 2. Cria o hash da senha
    const saltRounds = 10; // Fator de custo para o hash
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, saltRounds);
    } catch (error) {
      this.logger.error(
        `Erro ao gerar hash da senha para ${email}`,
        error.stack,
      );
      throw new InternalServerErrorException('Erro ao processar cadastro.');
    }

    // 3. Cria o usuário no banco de dados
    try {
      const user = await this.userService.create({
        email,
        password: hashedPassword, // Salva a senha hashada
      });

      // Retorna o usuário criado (sem a senha)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user; // Remove a senha do objeto retornado
      return result;
    } catch (error) {
      // O Prisma pode lançar P2002 se houver race condition (apesar da verificação acima)
      if (error.code === 'P2002') {
        throw new ConflictException('Este email já está em uso.');
      }
      this.logger.error(`Erro ao criar usuário ${email}`, error.stack);
      throw new InternalServerErrorException('Erro ao criar usuário.');
    }
  }

  // Valida se a senha fornecida corresponde ao hash no banco
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user; // Retorna o usuário sem a senha
      return result;
    }
    return null; // Retorna null se a validação falhar
  }

  // Gera o token JWT para um usuário validado
  async login(loginUserDto: LoginUserDto) {
    const user = await this.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const payload = { email: user.email, sub: user.id }; // 'sub' é o padrão para subject (ID do usuário)

    return {
      access_token: this.jwtService.sign(payload),
      // Você pode adicionar mais informações se desejar, como user info
      // user: { id: user.id, email: user.email }
    };
  }
}
