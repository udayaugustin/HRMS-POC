import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
} from 'class-validator';

export class CreateDesignationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  code: string;

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
