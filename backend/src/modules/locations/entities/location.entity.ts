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
import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('locations')
@Index('idx_locations_tenant', ['tenantId'])
@Index(['tenantId', 'code'], { unique: true })
export class Location {
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
  @IsOptional()
  @IsString()
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  state: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  country: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  @IsBoolean()
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Tenant, (tenant) => tenant.locations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => Employee, (employee) => employee.location)
  employees: Employee[];
}
