import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserSettingsDto {
  @IsBoolean()
  @IsOptional()
  notifyDailySummary?: boolean;

  @IsBoolean()
  @IsOptional()
  notifyStaleTasks?: boolean;
}
