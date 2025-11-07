// Usaremos class-validator para validação
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  IsInt,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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

export class BoardOrderDto {
  @IsInt({ message: 'O ID deve ser um número inteiro.' })
  id: number;

  @IsInt({ message: 'A ordem deve ser um número inteiro.' })
  order: number;
}

export class ReorderBoardsDto {
  @IsArray({ message: 'Boards deve ser um array.' })
  @ValidateNested({ each: true })
  @Type(() => BoardOrderDto)
  boards: BoardOrderDto[];
}

// Para Update, podemos usar PartialType ou criar um DTO específico se necessário
// import { PartialType } from '@nestjs/mapped-types';
// export class UpdateBoardDto extends PartialType(CreateBoardDto) {}
