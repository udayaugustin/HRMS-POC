import { PartialType } from '@nestjs/mapped-types';
import { CreateFlowDefinitionDto } from './create-flow-definition.dto';

export class UpdateFlowDefinitionDto extends PartialType(CreateFlowDefinitionDto) {}
