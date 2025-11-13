import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RejectDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  comments?: string;
}
