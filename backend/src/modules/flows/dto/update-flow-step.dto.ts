import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateFlowStepDto } from './create-flow-step.dto';

export class UpdateFlowStepDto extends PartialType(
  OmitType(CreateFlowStepDto, ['flowVersionId'] as const)
) {}
