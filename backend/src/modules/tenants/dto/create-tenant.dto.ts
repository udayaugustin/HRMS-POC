import { IsNotEmpty, IsString, IsBoolean, IsObject, IsOptional, MaxLength } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  subdomain: string;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
