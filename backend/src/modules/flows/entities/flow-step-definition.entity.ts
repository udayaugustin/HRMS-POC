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
import { IsNotEmpty, IsString, IsInt, IsBoolean, IsObject, IsOptional } from 'class-validator';
import { FlowVersion } from './flow-version.entity';
import { FlowStepInstance } from './flow-step-instance.entity';
import { FormSchema } from '../../form-schemas/entities/form-schema.entity';

@Entity('flow_step_definitions')
@Index('idx_flow_step_definitions_version', ['flowVersionId'])
@Index('idx_flow_step_definitions_order', ['flowVersionId', 'stepOrder'])
@Index(['flowVersionId', 'stepOrder'], { unique: true })
export class FlowStepDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'flow_version_id' })
  flowVersionId: string;

  @Column({ type: 'integer', name: 'step_order' })
  @IsNotEmpty()
  @IsInt()
  stepOrder: number;

  @Column({ type: 'varchar', length: 50, name: 'step_type' })
  @IsNotEmpty()
  @IsString()
  stepType: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  @IsString()
  title: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description: string;

  @Column({ type: 'uuid', nullable: true, name: 'form_schema_id' })
  formSchemaId: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'approval_role' })
  @IsOptional()
  @IsString()
  approvalRole: string;

  @Column({ type: 'jsonb', default: {} })
  @IsObject()
  config: Record<string, any>;

  @Column({ type: 'boolean', default: true, name: 'is_mandatory' })
  @IsBoolean()
  isMandatory: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => FlowVersion, (flowVersion) => flowVersion.flowStepDefinitions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flow_version_id' })
  flowVersion: FlowVersion;

  @ManyToOne(() => FormSchema, (formSchema) => formSchema.flowStepDefinitions, { nullable: true })
  @JoinColumn({ name: 'form_schema_id' })
  formSchema: FormSchema;

  @OneToMany(() => FlowStepInstance, (flowStepInstance) => flowStepInstance.stepDefinition)
  flowStepInstances: FlowStepInstance[];
}
