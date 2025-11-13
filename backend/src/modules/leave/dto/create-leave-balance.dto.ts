import {
  IsNotEmpty,
  IsUUID,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateLeaveBalanceDto {
  @IsUUID()
  @IsNotEmpty()
  employeeId: string;

  @IsUUID()
  @IsNotEmpty()
  leaveTypeId: string;

  @IsInt()
  @IsNotEmpty()
  @Min(2000)
  year: number;

  @IsNumber()
  @IsOptional()
  openingBalance?: number;

  @IsNumber()
  @IsOptional()
  accrued?: number;
}
