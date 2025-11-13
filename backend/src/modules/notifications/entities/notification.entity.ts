import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { IsNotEmpty, IsString, IsBoolean, IsDate, IsOptional } from 'class-validator';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
@Index('idx_notifications_user', ['userId', 'isRead'])
@Index('idx_notifications_created', ['userId', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  @IsString()
  title: string;

  @Column({ type: 'text' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'notification_type' })
  @IsOptional()
  @IsString()
  notificationType: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'entity_type' })
  @IsOptional()
  @IsString()
  entityType: string;

  @Column({ type: 'uuid', nullable: true, name: 'entity_id' })
  @IsOptional()
  entityId: string;

  @Column({ type: 'boolean', default: false, name: 'is_read' })
  @IsBoolean()
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'read_at' })
  @IsOptional()
  @IsDate()
  readAt: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => Tenant, (tenant) => tenant.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
