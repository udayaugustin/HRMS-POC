import { IsNotEmpty, IsString, IsBoolean, IsObject, IsOptional, MaxLength } from 'class-validator';

export class CreateFormSchemaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code: string;

  @IsObject()
  @IsNotEmpty()
  schemaJson: Record<string, any>;

  @IsObject()
  @IsOptional()
  validationRules?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
