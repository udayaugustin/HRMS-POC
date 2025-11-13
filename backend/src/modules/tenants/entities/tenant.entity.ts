import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { IsNotEmpty, IsString, IsBoolean, IsObject } from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Department } from '../../departments/entities/department.entity';
import { Designation } from '../../designations/entities/designation.entity';
import { Location } from '../../locations/entities/location.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { FlowDefinition } from '../../flows/entities/flow-definition.entity';
import { FlowInstance } from '../../flows/entities/flow-instance.entity';
import { FormSchema } from '../../form-schemas/entities/form-schema.entity';
import { PolicyDefinition } from '../../policies/entities/policy-definition.entity';
import { LeaveType } from '../../leave/entities/leave-type.entity';
import { LeaveBalance } from '../../leave/entities/leave-balance.entity';
import { LeaveRequest } from '../../leave/entities/leave-request.entity';
import { Approval } from '../../approvals/entities/approval.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('tenants')
@Index('idx_tenants_subdomain', ['subdomain'])
@Index('idx_tenants_active', ['isActive'])
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  @IsString()
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @IsNotEmpty()
  @IsString()
  subdomain: string;

  @Column({ type: 'jsonb', default: {} })
  @IsObject()
  settings: Record<string, any>;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  @IsBoolean()
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => Role, (role) => role.tenant)
  roles: Role[];

  @OneToMany(() => Department, (department) => department.tenant)
  departments: Department[];

  @OneToMany(() => Designation, (designation) => designation.tenant)
  designations: Designation[];

  @OneToMany(() => Location, (location) => location.tenant)
  locations: Location[];

  @OneToMany(() => Employee, (employee) => employee.tenant)
  employees: Employee[];

  @OneToMany(() => FlowDefinition, (flowDefinition) => flowDefinition.tenant)
  flowDefinitions: FlowDefinition[];

  @OneToMany(() => FlowInstance, (flowInstance) => flowInstance.tenant)
  flowInstances: FlowInstance[];

  @OneToMany(() => FormSchema, (formSchema) => formSchema.tenant)
  formSchemas: FormSchema[];

  @OneToMany(() => PolicyDefinition, (policyDefinition) => policyDefinition.tenant)
  policyDefinitions: PolicyDefinition[];

  @OneToMany(() => LeaveType, (leaveType) => leaveType.tenant)
  leaveTypes: LeaveType[];

  @OneToMany(() => LeaveBalance, (leaveBalance) => leaveBalance.tenant)
  leaveBalances: LeaveBalance[];

  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.tenant)
  leaveRequests: LeaveRequest[];

  @OneToMany(() => Approval, (approval) => approval.tenant)
  approvals: Approval[];

  @OneToMany(() => Notification, (notification) => notification.tenant)
  notifications: Notification[];
}
