import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { Role } from './role.entity';

@Entity('role_permissions')
@Index('idx_role_permissions_role', ['roleId'])
@Index(['roleId', 'module', 'action'], { unique: true })
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'role_id' })
  roleId: string;

  @Column({ type: 'varchar', length: 50 })
  @IsNotEmpty()
  @IsString()
  module: string;

  @Column({ type: 'varchar', length: 50 })
  @IsNotEmpty()
  @IsString()
  action: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => Role, (role) => role.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
