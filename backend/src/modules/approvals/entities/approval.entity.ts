import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { IsNotEmpty, IsString, IsDate, IsOptional } from 'class-validator';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { FlowStepInstance } from '../../flows/entities/flow-step-instance.entity';
import { User } from '../../users/entities/user.entity';

@Entity('approvals')
@Index('idx_approvals_tenant', ['tenantId'])
@Index('idx_approvals_approver', ['approverId', 'status'])
@Index('idx_approvals_entity', ['entityType', 'entityId'])
export class Approval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'uuid', nullable: true, name: 'flow_step_instance_id' })
  flowStepInstanceId: string;

  @Column({ type: 'varchar', length: 50, name: 'entity_type' })
  @IsNotEmpty()
  @IsString()
  entityType: string;

  @Column({ type: 'uuid', name: 'entity_id' })
  @IsNotEmpty()
  entityId: string;

  @Column({ type: 'uuid', name: 'approver_id' })
  approverId: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'approver_role' })
  @IsOptional()
  @IsString()
  approverRole: string;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  @IsString()
  status: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  comments: string;

  @Column({ type: 'timestamp', nullable: true, name: 'approved_at' })
  @IsOptional()
  @IsDate()
  approvedAt: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => Tenant, (tenant) => tenant.approvals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => FlowStepInstance, (flowStepInstance) => flowStepInstance.approvals, { nullable: true })
  @JoinColumn({ name: 'flow_step_instance_id' })
  flowStepInstance: FlowStepInstance;

  @ManyToOne(() => User, (user) => user.approvals)
  @JoinColumn({ name: 'approver_id' })
  approver: User;
}
