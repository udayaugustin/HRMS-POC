import { IsOptional, IsUUID, IsString, IsEnum } from 'class-validator';

export enum LeaveRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export class LeaveRequestFiltersDto {
  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @IsUUID()
  @IsOptional()
  leaveTypeId?: string;

  @IsEnum(LeaveRequestStatus)
  @IsOptional()
  status?: LeaveRequestStatus;

  @IsString()
  @IsOptional()
  fromDate?: string;

  @IsString()
  @IsOptional()
  toDate?: string;
}
