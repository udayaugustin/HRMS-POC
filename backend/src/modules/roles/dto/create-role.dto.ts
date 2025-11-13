import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PermissionDto {
  @IsString()
  @IsNotEmpty()
  module: string;

  @IsString()
  @IsNotEmpty()
  action: string;
}

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  @IsOptional()
  permissions?: PermissionDto[];
}
