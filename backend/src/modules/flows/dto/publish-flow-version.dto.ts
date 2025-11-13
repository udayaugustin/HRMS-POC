import { IsOptional, IsBoolean } from 'class-validator';

export class PublishFlowVersionDto {
  @IsBoolean()
  @IsOptional()
  archiveOldVersion?: boolean;
}
