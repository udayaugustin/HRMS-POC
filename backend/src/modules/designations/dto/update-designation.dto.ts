import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
} from 'class-validator';

export class UpdateDesignationDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsInt()
  @IsOptional()
  level?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
