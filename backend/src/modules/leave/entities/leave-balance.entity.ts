import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { IsNotEmpty, IsInt, IsNumber } from 'class-validator';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { LeaveType } from './leave-type.entity';

@Entity('leave_balances')
@Index('idx_leave_balances_employee', ['tenantId', 'employeeId'])
@Index('idx_leave_balances_year', ['tenantId', 'year'])
@Index(['tenantId', 'employeeId', 'leaveTypeId', 'year'], { unique: true })
export class LeaveBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string;

  @Column({ type: 'uuid', name: 'leave_type_id' })
  leaveTypeId: string;

  @Column({ type: 'integer' })
  @IsNotEmpty()
  @IsInt()
  year: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'opening_balance' })
  @IsNumber()
  openingBalance: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @IsNumber()
  accrued: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @IsNumber()
  used: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @IsNumber()
  pending: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    generatedType: 'STORED',
    asExpression: 'opening_balance + accrued - used - pending',
  })
  available: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Tenant, (tenant) => tenant.leaveBalances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Employee, (employee) => employee.leaveBalances)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => LeaveType, (leaveType) => leaveType.leaveBalances)
  @JoinColumn({ name: 'leave_type_id' })
  leaveType: LeaveType;
}
