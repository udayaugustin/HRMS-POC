import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { IsNotEmpty, IsString, IsEmail, IsBoolean, IsDate } from 'class-validator';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { UserRole } from '../../roles/entities/user-role.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { FlowVersion } from '../../flows/entities/flow-version.entity';
import { FlowInstance } from '../../flows/entities/flow-instance.entity';
import { FlowStepInstance } from '../../flows/entities/flow-step-instance.entity';
import { LeaveRequest } from '../../leave/entities/leave-request.entity';
import { Approval } from '../../approvals/entities/approval.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Department } from '../../departments/entities/department.entity';

@Entity('users')
@Index('idx_users_tenant', ['tenantId'])
@Index('idx_users_email', ['tenantId', 'email'])
@Index('idx_users_active', ['tenantId', 'isActive'])
@Index(['tenantId', 'email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  @IsNotEmpty()
  @IsString()
  passwordHash: string;

  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @Column({ type: 'varchar', length: 100, name: 'last_name' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  @IsBoolean()
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'last_login_at' })
  @IsDate()
  lastLoginAt: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Tenant, (tenant) => tenant.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @OneToOne(() => Employee, (employee) => employee.user)
  employee: Employee;

  @OneToMany(() => Department, (department) => department.manager)
  managedDepartments: Department[];

  @OneToMany(() => FlowVersion, (flowVersion) => flowVersion.createdBy)
  createdFlowVersions: FlowVersion[];

  @OneToMany(() => FlowInstance, (flowInstance) => flowInstance.initiatedBy)
  initiatedFlowInstances: FlowInstance[];

  @OneToMany(() => FlowStepInstance, (flowStepInstance) => flowStepInstance.assignedTo)
  assignedFlowStepInstances: FlowStepInstance[];

  @OneToMany(() => FlowStepInstance, (flowStepInstance) => flowStepInstance.completedBy)
  completedFlowStepInstances: FlowStepInstance[];

  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.approvedBy)
  approvedLeaveRequests: LeaveRequest[];

  @OneToMany(() => Approval, (approval) => approval.approver)
  approvals: Approval[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
