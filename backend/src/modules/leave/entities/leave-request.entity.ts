import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { IsNotEmpty, IsString, IsDate, IsNumber, IsOptional } from 'class-validator';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { LeaveType } from './leave-type.entity';
import { FlowInstance } from '../../flows/entities/flow-instance.entity';
import { User } from '../../users/entities/user.entity';

@Entity('leave_requests')
@Index('idx_leave_requests_tenant', ['tenantId'])
@Index('idx_leave_requests_employee', ['employeeId'])
@Index('idx_leave_requests_status', ['tenantId', 'status'])
@Index('idx_leave_requests_dates', ['tenantId', 'fromDate', 'toDate'])
export class LeaveRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string;

  @Column({ type: 'uuid', name: 'leave_type_id' })
  leaveTypeId: string;

  @Column({ type: 'uuid', nullable: true, name: 'flow_instance_id' })
  flowInstanceId: string;

  @Column({ type: 'date', name: 'from_date' })
  @IsNotEmpty()
  @IsDate()
  fromDate: Date;

  @Column({ type: 'date', name: 'to_date' })
  @IsNotEmpty()
  @IsDate()
  toDate: Date;

  @Column({ type: 'decimal', precision: 4, scale: 2, name: 'number_of_days' })
  @IsNotEmpty()
  @IsNumber()
  numberOfDays: number;

  @Column({ type: 'text' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  @IsString()
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'applied_at' })
  @IsDate()
  appliedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'approved_at' })
  @IsOptional()
  @IsDate()
  approvedAt: Date;

  @Column({ type: 'uuid', nullable: true, name: 'approved_by' })
  @IsOptional()
  approvedById: string;

  @Column({ type: 'text', nullable: true, name: 'rejection_reason' })
  @IsOptional()
  @IsString()
  rejectionReason: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => Tenant, (tenant) => tenant.leaveRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Employee, (employee) => employee.leaveRequests)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => LeaveType, (leaveType) => leaveType.leaveRequests)
  @JoinColumn({ name: 'leave_type_id' })
  leaveType: LeaveType;

  @OneToOne(() => FlowInstance, (flowInstance) => flowInstance.leaveRequest, { nullable: true })
  @JoinColumn({ name: 'flow_instance_id' })
  flowInstance: FlowInstance;

  @ManyToOne(() => User, (user) => user.approvedLeaveRequests, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedBy: User;
}
