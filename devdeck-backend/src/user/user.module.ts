// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
// PrismaModule é global, não precisa importar aqui

@Module({
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
