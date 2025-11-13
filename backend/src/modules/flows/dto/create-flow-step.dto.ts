import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  IsObject,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateFlowStepDto {
  @IsUUID()
  @IsNotEmpty()
  flowVersionId: string;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  stepOrder: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  stepType: string; // 'FORM', 'APPROVAL', etc.

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  formSchemaId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  approvalRole?: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;
}
