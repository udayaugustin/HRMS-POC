import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { IsNotEmpty, IsString, IsBoolean, IsObject } from 'class-validator';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { FlowStepDefinition } from '../../flows/entities/flow-step-definition.entity';

@Entity('form_schema_definitions')
@Index('idx_form_schemas_tenant', ['tenantId'])
@Index('idx_form_schemas_code', ['tenantId', 'code'])
@Index(['tenantId', 'code'], { unique: true })
export class FormSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  @IsString()
  name: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  @IsString()
  code: string;

  @Column({ type: 'jsonb', name: 'schema_json' })
  @IsNotEmpty()
  @IsObject()
  schemaJson: Record<string, any>;

  @Column({ type: 'jsonb', default: {}, name: 'validation_rules' })
  @IsObject()
  validationRules: Record<string, any>;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  @IsBoolean()
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Tenant, (tenant) => tenant.formSchemas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => FlowStepDefinition, (flowStepDefinition) => flowStepDefinition.formSchema)
  flowStepDefinitions: FlowStepDefinition[];
}
