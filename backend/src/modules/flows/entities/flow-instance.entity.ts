import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { IsNotEmpty, IsString, IsInt, IsDate, IsOptional } from 'class-validator';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { FlowVersion } from './flow-version.entity';
import { FlowStepInstance } from './flow-step-instance.entity';
import { User } from '../../users/entities/user.entity';
import { LeaveRequest } from '../../leave/entities/leave-request.entity';

@Entity('flow_instances')
@Index('idx_flow_instances_tenant', ['tenantId'])
@Index('idx_flow_instances_flow_version', ['flowVersionId'])
@Index('idx_flow_instances_initiator', ['initiatedById'])
@Index('idx_flow_instances_status', ['tenantId', 'status'])
@Index('idx_flow_instances_entity', ['entityType', 'entityId'])
export class FlowInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'uuid', name: 'flow_version_id' })
  flowVersionId: string;

  @Column({ type: 'varchar', length: 50, name: 'flow_type' })
  @IsNotEmpty()
  @IsString()
  flowType: string;

  @Column({ type: 'uuid', nullable: true, name: 'entity_id' })
  @IsOptional()
  entityId: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'entity_type' })
  @IsOptional()
  @IsString()
  entityType: string;

  @Column({ type: 'varchar', length: 50, default: 'IN_PROGRESS' })
  @IsString()
  status: string;

  @Column({ type: 'uuid', name: 'initiated_by' })
  initiatedById: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'started_at' })
  @IsDate()
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
  @IsOptional()
  @IsDate()
  completedAt: Date;

  @Column({ type: 'integer', default: 1, name: 'current_step_order' })
  @IsInt()
  currentStepOrder: number;

  // Relationships
  @ManyToOne(() => Tenant, (tenant) => tenant.flowInstances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => FlowVersion, (flowVersion) => flowVersion.flowInstances)
  @JoinColumn({ name: 'flow_version_id' })
  flowVersion: FlowVersion;

  @ManyToOne(() => User, (user) => user.initiatedFlowInstances)
  @JoinColumn({ name: 'initiated_by' })
  initiatedBy: User;

  @OneToMany(() => FlowStepInstance, (flowStepInstance) => flowStepInstance.flowInstance)
  flowStepInstances: FlowStepInstance[];

  @OneToOne(() => LeaveRequest, (leaveRequest) => leaveRequest.flowInstance)
  leaveRequest: LeaveRequest;
}
