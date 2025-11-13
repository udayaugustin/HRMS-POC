import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { LeaveBalance } from './leave-balance.entity';
import { LeaveRequest } from './leave-request.entity';

@Entity('leave_types')
@Index('idx_leave_types_tenant', ['tenantId'])
@Index(['tenantId', 'code'], { unique: true })
export class LeaveType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  @IsString()
  name: string;

  @Column({ type: 'varchar', length: 50 })
  @IsNotEmpty()
  @IsString()
  code: string;

  @Column({ type: 'text', nullable: true })
  @IsString()
  description: string;

  @Column({ type: 'boolean', default: true, name: 'is_paid' })
  @IsBoolean()
  isPaid: boolean;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  @IsBoolean()
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => Tenant, (tenant) => tenant.leaveTypes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => LeaveBalance, (leaveBalance) => leaveBalance.leaveType)
  leaveBalances: LeaveBalance[];

  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.leaveType)
  leaveRequests: LeaveRequest[];
}
