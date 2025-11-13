import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

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
