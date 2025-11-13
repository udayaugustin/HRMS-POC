import { IsString, IsBoolean, IsObject, IsOptional, MaxLength } from 'class-validator';

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  subdomain?: string;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
