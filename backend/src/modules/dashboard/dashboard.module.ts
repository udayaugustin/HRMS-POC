import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Employee } from '../employees/entities/employee.entity';
import { Department } from '../departments/entities/department.entity';
import { FlowDefinition } from '../flows/entities/flow-definition.entity';
import { FlowStepInstance } from '../flows/entities/flow-step-instance.entity';
import { Approval } from '../approvals/entities/approval.entity';
import { LeaveRequest } from '../leave/entities/leave-request.entity';
import { LeaveBalance } from '../leave/entities/leave-balance.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { RolePermission } from '../roles/entities/role-permission.entity';
import { UserRole } from '../roles/entities/user-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      Department,
      FlowDefinition,
      FlowStepInstance,
      Approval,
      LeaveRequest,
      LeaveBalance,
      Notification,
      User,
      RolePermission,
      UserRole,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
