import {
  IsBoolean,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class UpdateUserSettingsDto {
  @IsBoolean()
  @IsOptional()
  notifyDailySummary?: boolean;

  @IsBoolean()
  @IsOptional()
  notifyStaleTasks?: boolean;

  @IsBoolean()
  @IsOptional()
  notifyViaWhatsApp?: boolean;

  @IsPhoneNumber('BR')
  @IsString()
  @IsOptional()
  whatsappNumber?: string;
}
