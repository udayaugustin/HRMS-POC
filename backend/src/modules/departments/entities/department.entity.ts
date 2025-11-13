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
import { User } from '../../users/entities/user.entity';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('departments')
@Index('idx_departments_tenant', ['tenantId'])
@Index('idx_departments_parent', ['parentDepartmentId'])
@Index(['tenantId', 'code'], { unique: true })
export class Department {
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

  @Column({ type: 'uuid', nullable: true, name: 'parent_department_id' })
  parentDepartmentId: string;

  @Column({ type: 'uuid', nullable: true, name: 'manager_id' })
  managerId: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  @IsBoolean()
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Tenant, (tenant) => tenant.departments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Department, (department) => department.childDepartments, { nullable: true })
  @JoinColumn({ name: 'parent_department_id' })
  parentDepartment: Department;

  @OneToMany(() => Department, (department) => department.parentDepartment)
  childDepartments: Department[];

  @ManyToOne(() => User, (user) => user.managedDepartments, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @OneToMany(() => Employee, (employee) => employee.department)
  employees: Employee[];
}
