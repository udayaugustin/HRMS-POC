import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateLeaveTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
