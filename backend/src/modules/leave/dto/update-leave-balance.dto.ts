import { IsNumber, IsOptional } from 'class-validator';

export class UpdateLeaveBalanceDto {
  @IsNumber()
  @IsOptional()
  openingBalance?: number;

  @IsNumber()
  @IsOptional()
  accrued?: number;

  @IsNumber()
  @IsOptional()
  used?: number;

  @IsNumber()
  @IsOptional()
  pending?: number;
}
