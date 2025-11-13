import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreateApprovalDto {
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  entityType: string;

  @IsUUID()
  @IsNotEmpty()
  entityId: string;

  @IsUUID()
  @IsNotEmpty()
  approverId: string;

  @IsString()
  @IsOptional()
  approverRole?: string;

  @IsUUID()
  @IsOptional()
  flowStepInstanceId?: string;
}
