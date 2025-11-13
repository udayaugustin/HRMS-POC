import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  notificationType?: string;

  @IsString()
  @IsOptional()
  entityType?: string;

  @IsUUID()
  @IsOptional()
  entityId?: string;
}
