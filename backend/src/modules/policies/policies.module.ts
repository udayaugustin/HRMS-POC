import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoliciesService } from './policies.service';
import { PolicyEngineService } from './policy-engine.service';
import { PoliciesController } from './policies.controller';
import { PolicyDefinition } from './entities/policy-definition.entity';
import { LeaveBalance } from '../leave/entities/leave-balance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PolicyDefinition, LeaveBalance])],
  controllers: [PoliciesController],
  providers: [PoliciesService, PolicyEngineService],
  exports: [PoliciesService, PolicyEngineService],
})
export class PoliciesModule {}
