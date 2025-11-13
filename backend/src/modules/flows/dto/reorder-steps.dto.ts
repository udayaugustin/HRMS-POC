import { IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class StepOrder {
  @IsNotEmpty()
  stepId: string;

  @IsNotEmpty()
  order: number;
}

export class ReorderStepsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepOrder)
  steps: StepOrder[];
}
