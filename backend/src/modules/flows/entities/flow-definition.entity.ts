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
import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { FlowVersion } from './flow-version.entity';

@Entity('flow_definitions')
@Index('idx_flow_definitions_tenant', ['tenantId'])
@Index('idx_flow_definitions_type', ['tenantId', 'flowType'])
@Index(['tenantId', 'flowType'], { unique: true })
export class FlowDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'varchar', length: 50, name: 'flow_type' })
  @IsNotEmpty()
  @IsString()
  flowType: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  @IsString()
  name: string;

  @Column({ type: 'text', nullable: true })
  @IsString()
  description: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  @IsBoolean()
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Tenant, (tenant) => tenant.flowDefinitions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => FlowVersion, (flowVersion) => flowVersion.flowDefinition)
  flowVersions: FlowVersion[];
}
