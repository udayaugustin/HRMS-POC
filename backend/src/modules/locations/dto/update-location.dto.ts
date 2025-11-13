import {
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';

export class UpdateLocationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
