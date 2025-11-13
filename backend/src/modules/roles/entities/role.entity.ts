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
import { RolePermission } from './role-permission.entity';
import { UserRole } from './user-role.entity';

@Entity('roles')
@Index('idx_roles_tenant', ['tenantId'])
@Index('idx_roles_code', ['tenantId', 'code'])
@Index(['tenantId', 'code'], { unique: true })
export class Role {
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
  @IsString()
  description: string;

  @Column({ type: 'boolean', default: false, name: 'is_system' })
  @IsBoolean()
  isSystem: boolean;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  @IsBoolean()
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Tenant, (tenant) => tenant.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[];

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];
}
