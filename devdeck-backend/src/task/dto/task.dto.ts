import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsIn,
  IsInt,
  Min,
  IsBoolean,
} from 'class-validator';

// Status possíveis para uma tarefa
export const TASK_STATUSES = ['TODO', 'DOING', 'DONE'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export class CreateTaskDto {
  @IsString({ message: 'O título deve ser uma string.' })
  @IsNotEmpty({ message: 'O título não pode estar vazio.' })
  @MaxLength(255, { message: 'O título não pode ter mais que 255 caracteres.' })
  title: string;

  @IsString({ message: 'A descrição deve ser uma string.' })
  @IsOptional()
  @MaxLength(1000, {
    message: 'A descrição não pode ter mais que 1000 caracteres.',
  })
  description?: string;

  @IsString({ message: 'O status deve ser uma string.' })
  @IsNotEmpty({ message: 'O status não pode estar vazio.' })
  @IsIn(TASK_STATUSES, {
    message: `O status deve ser um dos seguintes: ${TASK_STATUSES.join(', ')}`,
  })
  status: TaskStatus = 'TODO'; // Default status

  @IsInt({ message: 'O ID do quadro deve ser um número inteiro.' })
  @Min(1, { message: 'O ID do quadro deve ser positivo.' })
  @IsNotEmpty({ message: 'O ID do quadro é obrigatório.' })
  boardId: number;
}

export class UpdateTaskDto {
  @IsString({ message: 'O título deve ser uma string.' })
  @IsOptional()
  @MaxLength(255, { message: 'O título não pode ter mais que 255 caracteres.' })
  title?: string;

  @IsString({ message: 'A descrição deve ser uma string.' })
  @IsOptional()
  @MaxLength(1000, {
    message: 'A descrição não pode ter mais que 1000 caracteres.',
  })
  description?: string;

  @IsString({ message: 'O status deve ser uma string.' })
  @IsOptional()
  @IsIn(TASK_STATUSES, {
    message: `O status deve ser um dos seguintes: ${TASK_STATUSES.join(', ')}`,
  })
  status?: TaskStatus;

  @IsInt({ message: 'O ID do quadro deve ser um número inteiro.' })
  @Min(1, { message: 'O ID do quadro deve ser positivo.' })
  @IsOptional() // Opcional ao atualizar, a menos que queira mover entre quadros
  boardId?: number;

  @IsInt({ message: 'O ID do usuário deve ser um número inteiro.' })
  @Min(1, { message: 'O ID do usuário deve ser positivo.' })
  @IsOptional() // Opcional, pode ser null ou não incluído
  assignedUserId?: number;
}

export class CreateSubtaskDto {
  @IsString({ message: 'O título da subtarefa deve ser uma string.' })
  @IsNotEmpty({ message: 'O título da subtarefa não pode estar vazio.' })
  @MaxLength(255, {
    message: 'O título da subtarefa não pode ter mais que 255 caracteres.',
  })
  title: string;

  @IsBoolean({ message: 'O campo completed deve ser booleano.' })
  @IsOptional()
  completed?: boolean;
}

export class UpdateSubtaskDto {
  @IsString({ message: 'O título da subtarefa deve ser uma string.' })
  @IsOptional()
  @MaxLength(255, {
    message: 'O título da subtarefa não pode ter mais que 255 caracteres.',
  })
  title?: string;

  @IsBoolean({ message: 'O campo completed deve ser booleano.' })
  @IsOptional()
  completed?: boolean;
}
