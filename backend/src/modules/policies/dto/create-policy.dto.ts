import { IsNotEmpty, IsString, IsBoolean, IsObject, IsOptional, MaxLength, IsDateString } from 'class-validator';

export class CreatePolicyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  policyType: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code: string;

  @IsObject()
  @IsNotEmpty()
  configJson: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsOptional()
  effectiveFrom?: Date;

  @IsDateString()
  @IsOptional()
  effectiveTo?: Date;
}
