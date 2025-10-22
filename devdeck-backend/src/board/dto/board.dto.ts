/* eslint-disable @typescript-eslint/no-unsafe-call */
// Usaremos class-validator para validação
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBoardDto {
  @IsString({ message: 'O nome deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
  @MaxLength(100, { message: 'O nome não pode ter mais que 100 caracteres.' })
  name: string;
}
export class UpdateBoardDto {
  @IsString({ message: 'O nome deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
  @MaxLength(100, { message: 'O nome não pode ter mais que 100 caracteres.' })
  @IsOptional() // Torna opcional, mas se enviado, deve ser válido
  name?: string;
}

// Para Update, podemos usar PartialType ou criar um DTO específico se necessário
// import { PartialType } from '@nestjs/mapped-types';
// export class UpdateBoardDto extends PartialType(CreateBoardDto) {}
