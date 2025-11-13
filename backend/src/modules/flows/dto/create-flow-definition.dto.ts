import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CreateFlowDefinitionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  flowType: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
