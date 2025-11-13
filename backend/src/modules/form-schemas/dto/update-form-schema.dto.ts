import { PartialType } from '@nestjs/mapped-types';
import { CreateFormSchemaDto } from './create-form-schema.dto';

export class UpdateFormSchemaDto extends PartialType(CreateFormSchemaDto) {}
