// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode?: number;
}

// User & Auth Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  isActive: boolean;
  roles: Role[];
  employee?: Employee;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Role & Permission Types
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  module: string;
  action: string;
  description: string;
}

// Tenant Types
export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Employee Types
export interface Employee {
  id: string;
  tenantId: string;
  userId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  dateOfJoining: string;
  departmentId: string;
  designationId: string;
  locationId: string;
  reportingManagerId?: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  isActive: boolean;
  department?: Department;
  designation?: Designation;
  location?: Location;
  reportingManager?: Employee;
  createdAt: string;
  updatedAt: string;
}

// Master Data Types
export interface Department {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Designation {
  id: string;
  tenantId: string;
  title: string;
  code: string;
  level: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Flow Engine Types
export interface FlowDefinition {
  id: string;
  tenantId: string;
  name: string;
  flowType: string;
  description?: string;
  isActive: boolean;
  activeVersionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlowVersion {
  id: string;
  tenantId: string;
  flowDefinitionId: string;
  versionNumber: number;
  isActive: boolean;
  steps: FlowStepDefinition[];
  createdAt: string;
  updatedAt: string;
}

export interface FlowStepDefinition {
  id: string;
  tenantId: string;
  flowVersionId: string;
  stepOrder: number;
  stepName: string;
  stepType: 'FORM' | 'APPROVAL' | 'NOTIFICATION' | 'CONDITION' | 'ACTION';
  formSchemaId?: string;
  approverRule?: string;
  config: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  formSchema?: FormSchema;
}

export interface FlowInstance {
  id: string;
  tenantId: string;
  flowDefinitionId: string;
  flowVersionId: string;
  initiatedBy: string;
  entityId?: string;
  entityType?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  currentStepOrder: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlowStepInstance {
  id: string;
  tenantId: string;
  flowInstanceId: string;
  flowStepDefinitionId: string;
  stepOrder: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  assignedTo?: string;
  data?: Record<string, any>;
  completedBy?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Form Schema Types
export interface FormSchema {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  formType: string;
  schema: FormSchemaDefinition;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FormSchemaDefinition {
  fields: FormField[];
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'multiselect' | 'textarea' | 'checkbox' | 'radio' | 'file';
  required: boolean;
  options?: { label: string; value: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  defaultValue?: any;
  placeholder?: string;
  helpText?: string;
}

// Policy Types
export interface PolicyDefinition {
  id: string;
  tenantId: string;
  name: string;
  policyType: string;
  description?: string;
  rules: PolicyRule;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyRule {
  conditions: PolicyCondition[];
  actions: PolicyAction[];
}

export interface PolicyCondition {
  field: string;
  operator: string;
  value: any;
}

export interface PolicyAction {
  type: string;
  config: Record<string, any>;
}

// Leave Management Types
export interface LeaveType {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  defaultDays: number;
  carryForward: boolean;
  maxCarryForwardDays: number;
  encashable: boolean;
  requiresApproval: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  id: string;
  tenantId: string;
  employeeId: string;
  leaveTypeId: string;
  year: number;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  availableDays: number;
  carryForwardDays: number;
  createdAt: string;
  updatedAt: string;
  leaveType?: LeaveType;
}

export interface LeaveRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  flowInstanceId?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
  leaveType?: LeaveType;
}

// Approval Types
export interface PendingApproval {
  id: string;
  flowInstanceId: string;
  flowStepInstanceId: string;
  flowName: string;
  stepName: string;
  entityType?: string;
  entityId?: string;
  initiatorName: string;
  assignedAt: string;
  entity?: LeaveRequest | Employee;
}

// Dashboard Types
export interface AdminDashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingApprovals: number;
  pendingLeaveRequests: number;
  departmentDistribution: { department: string; count: number }[];
  recentLeaveRequests: LeaveRequest[];
  leaveRequestsStats: { status: string; count: number }[];
}

export interface UserDashboardStats {
  leaveBalances: LeaveBalance[];
  recentLeaveRequests: LeaveRequest[];
  pendingApprovals: PendingApproval[];
  upcomingLeaves: LeaveRequest[];
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
