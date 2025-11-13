import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';

export class ApplyLeaveDto {
  @IsUUID()
  @IsNotEmpty()
  leaveTypeId: string;

  @IsDateString()
  @IsNotEmpty()
  fromDate: string;

  @IsDateString()
  @IsNotEmpty()
  toDate: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0.5)
  numberOfDays: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
