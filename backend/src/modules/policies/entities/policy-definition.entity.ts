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
import { IsNotEmpty, IsString, IsBoolean, IsObject, IsDate, IsOptional } from 'class-validator';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('policy_definitions')
@Index('idx_policy_definitions_tenant', ['tenantId'])
@Index('idx_policy_definitions_type', ['tenantId', 'policyType'])
@Index(['tenantId', 'code'], { unique: true })
export class PolicyDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'varchar', length: 50, name: 'policy_type' })
  @IsNotEmpty()
  @IsString()
  policyType: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  @IsString()
  name: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  @IsString()
  code: string;

  @Column({ type: 'jsonb', name: 'config_json' })
  @IsNotEmpty()
  @IsObject()
  configJson: Record<string, any>;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  @IsBoolean()
  isActive: boolean;

  @Column({ type: 'date', nullable: true, name: 'effective_from' })
  @IsOptional()
  @IsDate()
  effectiveFrom: Date;

  @Column({ type: 'date', nullable: true, name: 'effective_to' })
  @IsOptional()
  @IsDate()
  effectiveTo: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Tenant, (tenant) => tenant.policyDefinitions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}
