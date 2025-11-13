import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveController } from './leave.controller';
import { LeaveTypesService } from './services/leave-types.service';
import { LeaveBalancesService } from './services/leave-balances.service';
import { LeaveRequestsService } from './services/leave-requests.service';

// Import all leave entities
import { LeaveType } from './entities/leave-type.entity';
import { LeaveBalance } from './entities/leave-balance.entity';
import { LeaveRequest } from './entities/leave-request.entity';

// Import FlowsModule for FlowExecutionService
import { FlowsModule } from '../flows/flows.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LeaveType,
      LeaveBalance,
      LeaveRequest,
    ]),
    FlowsModule,
  ],
  controllers: [LeaveController],
  providers: [
    LeaveTypesService,
    LeaveBalancesService,
    LeaveRequestsService,
  ],
  exports: [
    LeaveTypesService,
    LeaveBalancesService,
    LeaveRequestsService,
  ],
})
export class LeaveModule {}
