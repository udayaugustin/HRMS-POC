import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { IsNotEmpty, IsString, IsBoolean, IsEmail, IsDate, IsOptional } from 'class-validator';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';
import { Department } from '../../departments/entities/department.entity';
import { Designation } from '../../designations/entities/designation.entity';
import { Location } from '../../locations/entities/location.entity';
import { LeaveBalance } from '../../leave/entities/leave-balance.entity';
import { LeaveRequest } from '../../leave/entities/leave-request.entity';

@Entity('employees')
@Index('idx_employees_tenant', ['tenantId'])
@Index('idx_employees_user', ['userId'])
@Index('idx_employees_manager', ['managerId'])
@Index('idx_employees_status', ['tenantId', 'employmentStatus'])
@Index(['tenantId', 'employeeCode'], { unique: true })
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'uuid', unique: true, nullable: true, name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'employee_code' })
  @IsOptional()
  @IsString()
  employeeCode: string;

  @Column({ type: 'uuid', nullable: true, name: 'department_id' })
  departmentId: string;

  @Column({ type: 'uuid', nullable: true, name: 'designation_id' })
  designationId: string;

  @Column({ type: 'uuid', nullable: true, name: 'location_id' })
  locationId: string;

  @Column({ type: 'uuid', nullable: true, name: 'manager_id' })
  managerId: string;

  @Column({ type: 'date', nullable: true, name: 'joining_date' })
  @IsOptional()
  @IsDate()
  joiningDate: Date;

  @Column({ type: 'date', nullable: true, name: 'exit_date' })
  @IsOptional()
  @IsDate()
  exitDate: Date;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVE', name: 'employment_status' })
  @IsString()
  employmentStatus: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'personal_email' })
  @IsOptional()
  @IsEmail()
  personalEmail: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  phone: string;

  @Column({ type: 'date', nullable: true, name: 'date_of_birth' })
  @IsOptional()
  @IsDate()
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  gender: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  address: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  @IsBoolean()
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Tenant, (tenant) => tenant.employees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToOne(() => User, (user) => user.employee, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Department, (department) => department.employees, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Designation, (designation) => designation.employees, { nullable: true })
  @JoinColumn({ name: 'designation_id' })
  designation: Designation;

  @ManyToOne(() => Location, (location) => location.employees, { nullable: true })
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @ManyToOne(() => Employee, (employee) => employee.subordinates, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: Employee;

  @OneToMany(() => Employee, (employee) => employee.manager)
  subordinates: Employee[];

  @OneToMany(() => LeaveBalance, (leaveBalance) => leaveBalance.employee)
  leaveBalances: LeaveBalance[];

  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.employee)
  leaveRequests: LeaveRequest[];
}
