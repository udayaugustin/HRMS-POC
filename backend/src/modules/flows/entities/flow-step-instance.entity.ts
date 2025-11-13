import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { IsNotEmpty, IsString, IsInt, IsDate, IsObject, IsOptional } from 'class-validator';
import { FlowInstance } from './flow-instance.entity';
import { FlowStepDefinition } from './flow-step-definition.entity';
import { User } from '../../users/entities/user.entity';
import { Approval } from '../../approvals/entities/approval.entity';

@Entity('flow_step_instances')
@Index('idx_flow_step_instances_flow', ['flowInstanceId'])
@Index('idx_flow_step_instances_assigned', ['assignedToId'])
@Index('idx_flow_step_instances_status', ['flowInstanceId', 'status'])
export class FlowStepInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'flow_instance_id' })
  flowInstanceId: string;

  @Column({ type: 'uuid', name: 'step_definition_id' })
  stepDefinitionId: string;

  @Column({ type: 'integer', name: 'step_order' })
  @IsNotEmpty()
  @IsInt()
  stepOrder: number;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  @IsString()
  status: string;

  @Column({ type: 'jsonb', default: {} })
  @IsObject()
  data: Record<string, any>;

  @Column({ type: 'uuid', nullable: true, name: 'assigned_to' })
  @IsOptional()
  assignedToId: string;

  @Column({ type: 'uuid', nullable: true, name: 'completed_by' })
  @IsOptional()
  completedById: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  comments: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'started_at' })
  @IsDate()
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
  @IsOptional()
  @IsDate()
  completedAt: Date;

  // Relationships
  @ManyToOne(() => FlowInstance, (flowInstance) => flowInstance.flowStepInstances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flow_instance_id' })
  flowInstance: FlowInstance;

  @ManyToOne(() => FlowStepDefinition, (stepDefinition) => stepDefinition.flowStepInstances)
  @JoinColumn({ name: 'step_definition_id' })
  stepDefinition: FlowStepDefinition;

  @ManyToOne(() => User, (user) => user.assignedFlowStepInstances, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignedTo: User;

  @ManyToOne(() => User, (user) => user.completedFlowStepInstances, { nullable: true })
  @JoinColumn({ name: 'completed_by' })
  completedBy: User;

  @OneToMany(() => Approval, (approval) => approval.flowStepInstance)
  approvals: Approval[];
}
