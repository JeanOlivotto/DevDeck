import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsEmail,
} from 'class-validator';

// Enum para prioridade (opcional, mas bom para padronizar)
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsInt()
  @IsNotEmpty() // boardId continua obrigatório para tarefas internas
  boardId: number;

  // --- NOVOS CAMPOS ---
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: string; // Default será MEDIUM no banco

  @IsInt()
  @IsOptional()
  estimatedTime?: number; // Em minutos

  @IsDateString()
  @IsOptional()
  dueDate?: string; // Data ISO 8601

  @IsString()
  @IsOptional()
  tags?: string; // "bug,front,api"
}

// NOVO: DTO Exclusivo para Tickets Públicos (Não pede boardId, pede Token na URL)
export class CreateTicketDto {
  @IsString()
  @IsNotEmpty({ message: 'O título é obrigatório.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'A descrição é obrigatória.' })
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'Seu nome é obrigatório.' })
  requesterName: string;

  @IsEmail({}, { message: 'Forneça um email válido para contato.' })
  @IsNotEmpty()
  requesterEmail: string;

  // Prioridade opcional para o cliente (pode ser hidden no front ou não)
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: string;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsInt()
  @IsOptional()
  boardId?: number;

  @IsInt()
  @IsOptional()
  assignedUserId?: number; // Para "Aceitar" o ticket

  // --- NOVOS CAMPOS EM UPDATE ---
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: string;

  @IsInt()
  @IsOptional()
  estimatedTime?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  tags?: string;
}

// Mantive Subtasks igual
export class CreateSubtaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}

export class UpdateSubtaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
