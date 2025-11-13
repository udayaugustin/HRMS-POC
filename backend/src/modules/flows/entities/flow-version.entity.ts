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
import { IsNotEmpty, IsString, IsInt, IsDate, IsOptional } from 'class-validator';
import { FlowDefinition } from './flow-definition.entity';
import { FlowStepDefinition } from './flow-step-definition.entity';
import { FlowInstance } from './flow-instance.entity';
import { User } from '../../users/entities/user.entity';

@Entity('flow_versions')
@Index('idx_flow_versions_flow', ['flowDefinitionId'])
@Index('idx_flow_versions_status', ['flowDefinitionId', 'status'])
@Index(['flowDefinitionId', 'versionNumber'], { unique: true })
export class FlowVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'flow_definition_id' })
  flowDefinitionId: string;

  @Column({ type: 'integer', name: 'version_number' })
  @IsNotEmpty()
  @IsInt()
  versionNumber: number;

  @Column({ type: 'varchar', length: 50, default: 'DRAFT' })
  @IsString()
  status: string;

  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  createdById: string;

  @Column({ type: 'timestamp', nullable: true, name: 'published_at' })
  @IsOptional()
  @IsDate()
  publishedAt: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => FlowDefinition, (flowDefinition) => flowDefinition.flowVersions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flow_definition_id' })
  flowDefinition: FlowDefinition;

  @ManyToOne(() => User, (user) => user.createdFlowVersions, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => FlowStepDefinition, (flowStepDefinition) => flowStepDefinition.flowVersion)
  flowStepDefinitions: FlowStepDefinition[];

  @OneToMany(() => FlowInstance, (flowInstance) => flowInstance.flowVersion)
  flowInstances: FlowInstance[];
}
