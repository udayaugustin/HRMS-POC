import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SubmitStepDto {
  @IsUUID()
  @IsNotEmpty()
  stepInstanceId: string;

  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;

  @IsString()
  @IsOptional()
  comments?: string;

  @IsUUID()
  @IsOptional()
  assignedToId?: string;
}
