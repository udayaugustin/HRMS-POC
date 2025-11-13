import {
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class UpdateDepartmentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsUUID()
  @IsOptional()
  parentDepartmentId?: string;

  @IsUUID()
  @IsOptional()
  managerId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
