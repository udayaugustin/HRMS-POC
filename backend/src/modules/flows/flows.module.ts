import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlowsController } from './flows.controller';
import { FlowDefinitionsService } from './flow-definitions.service';
import { FlowVersionsService } from './flow-versions.service';
import { FlowStepsService } from './flow-steps.service';
import { FlowExecutionService } from './flow-execution.service';

// Import all flow entities
import { FlowDefinition } from './entities/flow-definition.entity';
import { FlowVersion } from './entities/flow-version.entity';
import { FlowStepDefinition } from './entities/flow-step-definition.entity';
import { FlowInstance } from './entities/flow-instance.entity';
import { FlowStepInstance } from './entities/flow-step-instance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FlowDefinition,
      FlowVersion,
      FlowStepDefinition,
      FlowInstance,
      FlowStepInstance,
    ]),
  ],
  controllers: [FlowsController],
  providers: [
    FlowDefinitionsService,
    FlowVersionsService,
    FlowStepsService,
    FlowExecutionService,
  ],
  exports: [
    FlowDefinitionsService,
    FlowVersionsService,
    FlowStepsService,
    FlowExecutionService,
  ],
})
export class FlowsModule {}
