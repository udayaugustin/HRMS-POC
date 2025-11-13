import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class UpdateEmployeeDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  employeeCode?: string;

  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsUUID()
  @IsOptional()
  designationId?: string;

  @IsUUID()
  @IsOptional()
  locationId?: string;

  @IsUUID()
  @IsOptional()
  managerId?: string;

  @IsDateString()
  @IsOptional()
  joiningDate?: Date;

  @IsDateString()
  @IsOptional()
  exitDate?: Date;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  employmentStatus?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  personalEmail?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: Date;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  gender?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
