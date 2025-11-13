import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class StartFlowDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  flowType: string;

  @IsUUID()
  @IsOptional()
  entityId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  entityType?: string;
}
