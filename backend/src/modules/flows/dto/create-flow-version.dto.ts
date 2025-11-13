import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateFlowVersionDto {
  @IsUUID()
  @IsNotEmpty()
  flowDefinitionId: string;
}
