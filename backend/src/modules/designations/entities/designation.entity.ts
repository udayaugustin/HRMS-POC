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
import { IsNotEmpty, IsString, IsBoolean, IsInt, IsOptional } from 'class-validator';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('designations')
@Index('idx_designations_tenant', ['tenantId'])
@Index(['tenantId', 'code'], { unique: true })
export class Designation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  @IsString()
  title: string;

  @Column({ type: 'varchar', length: 50 })
  @IsNotEmpty()
  @IsString()
  code: string;

  @Column({ type: 'integer', nullable: true })
  @IsOptional()
  @IsInt()
  level: number;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
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
  @ManyToOne(() => Tenant, (tenant) => tenant.designations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => Employee, (employee) => employee.designation)
  employees: Employee[];
}
