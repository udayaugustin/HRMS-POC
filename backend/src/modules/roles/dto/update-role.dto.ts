import {
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PermissionDto {
  @IsString()
  module: string;

  @IsString()
  action: string;
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  @IsOptional()
  permissions?: PermissionDto[];
}
