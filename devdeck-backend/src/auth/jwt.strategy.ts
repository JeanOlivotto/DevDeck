/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service'; // Opcional: Se precisar validar se o usuário ainda existe

// Idealmente, use a mesma fonte para o segredo que você usou no AuthModule
// Exemplo: process.env.JWT_SECRET
const JWT_SECRET =
  'sk_jwt_7x9A2qB8vR3tY6wE1zC5nM8pQ0sK3jH7gF4dL9oV2cX6rT1yU5iW8aB0eN3mZ7qP';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    // Injetar UserService
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrai o token do cabeçalho 'Authorization: Bearer <token>'
      ignoreExpiration: false, // Garante que tokens expirados sejam rejeitados
      secretOrKey: JWT_SECRET, // Usa a mesma chave secreta para verificar a assinatura
    });
  }

  // Esta função é chamada automaticamente pelo Passport após verificar a assinatura do token
  // O payload é o objeto que definimos ao criar o token no AuthService (login)
  async validate(payload: any) {
    // payload = { email: user.email, sub: user.id }

    // Opcional: Você pode adicionar lógica extra aqui, como verificar se o usuário
    // ainda existe no banco de dados usando o payload.sub (userId).
    const user = await this.userService.findOneById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    // O objeto retornado aqui será injetado no objeto `request.user`
    // dos controllers protegidos pelo JwtAuthGuard.
    return { userId: payload.sub, email: payload.email };
  }
}
