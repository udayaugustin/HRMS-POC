# WisRight HRMS - POC Database Schema

## Document Version: 1.0
**Date:** November 2025  
**Database:** PostgreSQL 14+  
**Purpose:** Simplified schema for POC (production-ready structure, reduced complexity)

---

## 1. Schema Overview

### 1.1 Core Entities
- **Tenant & Security:** tenants, users, roles, role_permissions, user_roles
- **HR Master Data:** departments, designations, locations
- **Employee Data:** employees
- **Flow Engine:** flow_definitions, flow_versions, flow_step_definitions, flow_instances, flow_step_instances
- **Form Engine:** form_schema_definitions
- **Policy Engine:** policy_definitions
- **Leave Management:** leave_types, leave_balances, leave_requests
- **Approvals:** approvals
- **Notifications:** notifications

### 1.2 Design Principles
- Every table (except `tenants`) has `tenant_id` for multi-tenancy
- Use UUID for primary keys (better for distributed systems)
- Use timestamps for audit trails
- Use JSONB for flexible configuration
- Use indexes for performance
- Use foreign keys for referential integrity
- Use soft deletes (is_active flag) instead of hard deletes

---

## 2. Tenant & Security Tables

### 2.1 Table: tenants

**Purpose:** Store organization/tenant information

```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_active ON tenants(is_active);
```

**Sample settings JSONB:**
```json
{
  "branding": {
    "logo_url": "https://example.com/logo.png",
    "primary_color": "#1976d2"
  },
  "timezone": "America/New_York",
  "date_format": "MM/DD/YYYY"
}
```

**Sample Data:**
```sql
INSERT INTO tenants (name, subdomain) VALUES
('Acme Corporation', 'acme'),
('TechStart Inc', 'techstart');
```

---

### 2.2 Table: users

**Purpose:** Store all system users (admins, employees, managers)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, email)
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(tenant_id, email);
CREATE INDEX idx_users_active ON users(tenant_id, is_active);
```

**Notes:**
- Password should be hashed using bcrypt (cost factor 10)
- Email unique per tenant (not globally unique)

**Sample Data:**
```sql
-- Password: Admin@123 (hashed with bcrypt)
INSERT INTO users (tenant_id, email, password_hash, first_name, last_name) VALUES
('tenant-uuid', 'admin@acme.com', '$2b$10$...', 'Admin', 'User'),
('tenant-uuid', 'john.doe@acme.com', '$2b$10$...', 'John', 'Doe');
```

---

### 2.3 Table: roles

**Purpose:** Define roles within each tenant

```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

CREATE INDEX idx_roles_tenant ON roles(tenant_id);
CREATE INDEX idx_roles_code ON roles(tenant_id, code);
```

**Notes:**
- `is_system`: True for default roles (cannot be deleted)
- Default roles: SUPER_ADMIN, HR_ADMIN, MANAGER, EMPLOYEE

**Sample Data:**
```sql
INSERT INTO roles (tenant_id, name, code, is_system) VALUES
('tenant-uuid', 'Super Admin', 'SUPER_ADMIN', true),
('tenant-uuid', 'HR Admin', 'HR_ADMIN', true),
('tenant-uuid', 'Manager', 'MANAGER', true),
('tenant-uuid', 'Employee', 'EMPLOYEE', true);
```

---

### 2.4 Table: role_permissions

**Purpose:** Define what each role can do

```sql
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, module, action)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
```

**Modules:** EMPLOYEES, FLOWS, APPROVALS, LEAVE, REPORTS, SETTINGS  
**Actions:** VIEW, CREATE, EDIT, DELETE, APPROVE, CONFIGURE

**Sample Data:**
```sql
-- HR Admin permissions
INSERT INTO role_permissions (role_id, module, action) VALUES
('hr-admin-role-uuid', 'EMPLOYEES', 'VIEW'),
('hr-admin-role-uuid', 'EMPLOYEES', 'CREATE'),
('hr-admin-role-uuid', 'EMPLOYEES', 'EDIT'),
('hr-admin-role-uuid', 'FLOWS', 'CONFIGURE'),
('hr-admin-role-uuid', 'LEAVE', 'VIEW');

-- Manager permissions
INSERT INTO role_permissions (role_id, module, action) VALUES
('manager-role-uuid', 'EMPLOYEES', 'VIEW'),
('manager-role-uuid', 'APPROVALS', 'APPROVE'),
('manager-role-uuid', 'LEAVE', 'VIEW');

-- Employee permissions
INSERT INTO role_permissions (role_id, module, action) VALUES
('employee-role-uuid', 'LEAVE', 'VIEW'),
('employee-role-uuid', 'LEAVE', 'CREATE');
```

---

### 2.5 Table: user_roles

**Purpose:** Assign roles to users (many-to-many)

```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
```

**Sample Data:**
```sql
INSERT INTO user_roles (user_id, role_id) VALUES
('admin-user-uuid', 'hr-admin-role-uuid'),
('john-uuid', 'employee-role-uuid'),
('jane-uuid', 'manager-role-uuid');
```

---

## 3. HR Master Data Tables

### 3.1 Table: departments

**Purpose:** Organizational departments

```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    parent_department_id UUID REFERENCES departments(id),
    manager_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

CREATE INDEX idx_departments_tenant ON departments(tenant_id);
CREATE INDEX idx_departments_parent ON departments(parent_department_id);
```

**Sample Data:**
```sql
INSERT INTO departments (tenant_id, name, code) VALUES
('tenant-uuid', 'Engineering', 'ENG'),
('tenant-uuid', 'Human Resources', 'HR'),
('tenant-uuid', 'Finance', 'FIN'),
('tenant-uuid', 'Sales', 'SALES'),
('tenant-uuid', 'Operations', 'OPS');
```

---

### 3.2 Table: designations

**Purpose:** Job titles/positions

```sql
CREATE TABLE designations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    title VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    level INTEGER,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

CREATE INDEX idx_designations_tenant ON designations(tenant_id);
```

**Sample Data:**
```sql
INSERT INTO designations (tenant_id, title, code, level) VALUES
('tenant-uuid', 'Software Engineer', 'SE', 3),
('tenant-uuid', 'Senior Software Engineer', 'SSE', 4),
('tenant-uuid', 'Engineering Manager', 'EM', 5),
('tenant-uuid', 'HR Manager', 'HRM', 5),
('tenant-uuid', 'HR Executive', 'HRE', 3),
('tenant-uuid', 'Finance Manager', 'FM', 5),
('tenant-uuid', 'Sales Executive', 'SX', 3);
```

---

### 3.3 Table: locations

**Purpose:** Office locations

```sql
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

CREATE INDEX idx_locations_tenant ON locations(tenant_id);
```

**Sample Data:**
```sql
INSERT INTO locations (tenant_id, name, code, city, state, country) VALUES
('tenant-uuid', 'Headquarters', 'HQ', 'New York', 'NY', 'USA'),
('tenant-uuid', 'Branch Office', 'BR1', 'San Francisco', 'CA', 'USA'),
('tenant-uuid', 'Remote', 'REMOTE', NULL, NULL, 'USA');
```

---

## 4. Employee Data Table

### 4.1 Table: employees

**Purpose:** Employee master records

```sql
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID UNIQUE REFERENCES users(id),
    employee_code VARCHAR(50),
    department_id UUID REFERENCES departments(id),
    designation_id UUID REFERENCES designations(id),
    location_id UUID REFERENCES locations(id),
    manager_id UUID REFERENCES employees(id),
    joining_date DATE,
    exit_date DATE,
    employment_status VARCHAR(50) DEFAULT 'ACTIVE',
    personal_email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, employee_code)
);

CREATE INDEX idx_employees_tenant ON employees(tenant_id);
CREATE INDEX idx_employees_user ON employees(user_id);
CREATE INDEX idx_employees_manager ON employees(manager_id);
CREATE INDEX idx_employees_status ON employees(tenant_id, employment_status);
```

**Employment Status:** ACTIVE, ON_LEAVE, TERMINATED, RESIGNED

**Sample Data:**
```sql
INSERT INTO employees (tenant_id, user_id, employee_code, department_id, designation_id, location_id, joining_date, employment_status) VALUES
('tenant-uuid', 'john-user-uuid', 'EMP001', 'eng-dept-uuid', 'se-desig-uuid', 'hq-loc-uuid', '2024-01-15', 'ACTIVE'),
('tenant-uuid', 'jane-user-uuid', 'EMP002', 'eng-dept-uuid', 'sse-desig-uuid', 'hq-loc-uuid', '2023-06-01', 'ACTIVE');
```

---

## 5. Flow Engine Tables

### 5.1 Table: flow_definitions

**Purpose:** Define flow types available in the system

```sql
CREATE TABLE flow_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    flow_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, flow_type)
);

CREATE INDEX idx_flow_definitions_tenant ON flow_definitions(tenant_id);
CREATE INDEX idx_flow_definitions_type ON flow_definitions(tenant_id, flow_type);
```

**Flow Types:** ONBOARDING, LEAVE_APPROVAL, EXIT, REIMBURSEMENT, PAYROLL_RUN

**Sample Data:**
```sql
INSERT INTO flow_definitions (tenant_id, flow_type, name, description) VALUES
('tenant-uuid', 'ONBOARDING', 'Employee Onboarding', 'New employee onboarding process'),
('tenant-uuid', 'LEAVE_APPROVAL', 'Leave Approval', 'Employee leave request and approval');
```

---

### 5.2 Table: flow_versions

**Purpose:** Version control for flows

```sql
CREATE TABLE flow_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_definition_id UUID NOT NULL REFERENCES flow_definitions(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_by UUID REFERENCES users(id),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(flow_definition_id, version_number)
);

CREATE INDEX idx_flow_versions_flow ON flow_versions(flow_definition_id);
CREATE INDEX idx_flow_versions_status ON flow_versions(flow_definition_id, status);
```

**Status:** DRAFT, ACTIVE, ARCHIVED

**Sample Data:**
```sql
INSERT INTO flow_versions (flow_definition_id, version_number, status) VALUES
('onboarding-flow-uuid', 1, 'ACTIVE'),
('leave-flow-uuid', 1, 'ACTIVE');
```

---

### 5.3 Table: flow_step_definitions

**Purpose:** Define steps in a flow version

```sql
CREATE TABLE flow_step_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_version_id UUID NOT NULL REFERENCES flow_versions(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    form_schema_id UUID REFERENCES form_schema_definitions(id),
    approval_role VARCHAR(50),
    config JSONB DEFAULT '{}',
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(flow_version_id, step_order)
);

CREATE INDEX idx_flow_step_definitions_version ON flow_step_definitions(flow_version_id);
CREATE INDEX idx_flow_step_definitions_order ON flow_step_definitions(flow_version_id, step_order);
```

**Step Types:** FORM, APPROVAL, AUTOMATION, REVIEW, NOTIFICATION

**Sample config JSONB:**
```json
{
  "auto_approve": false,
  "notify_on_completion": true,
  "allow_edit": false
}
```

**Sample Data (Onboarding Flow):**
```sql
INSERT INTO flow_step_definitions (flow_version_id, step_order, step_type, title, form_schema_id) VALUES
('onboarding-v1-uuid', 1, 'FORM', 'Basic Information', 'basic-info-schema-uuid'),
('onboarding-v1-uuid', 2, 'FORM', 'Job Details', 'job-details-schema-uuid'),
('onboarding-v1-uuid', 3, 'APPROVAL', 'Manager Approval', NULL),
('onboarding-v1-uuid', 4, 'APPROVAL', 'HR Approval', NULL);

-- Update approval roles
UPDATE flow_step_definitions SET approval_role = 'MANAGER' WHERE step_order = 3;
UPDATE flow_step_definitions SET approval_role = 'HR_ADMIN' WHERE step_order = 4;
```

**Sample Data (Leave Approval Flow):**
```sql
INSERT INTO flow_step_definitions (flow_version_id, step_order, step_type, title, form_schema_id) VALUES
('leave-v1-uuid', 1, 'FORM', 'Leave Application', 'leave-form-schema-uuid'),
('leave-v1-uuid', 2, 'APPROVAL', 'Manager Approval', NULL),
('leave-v1-uuid', 3, 'APPROVAL', 'HR Approval', NULL);

UPDATE flow_step_definitions SET approval_role = 'MANAGER' WHERE flow_version_id = 'leave-v1-uuid' AND step_order = 2;
UPDATE flow_step_definitions SET approval_role = 'HR_ADMIN' WHERE flow_version_id = 'leave-v1-uuid' AND step_order = 3;
```

---

### 5.4 Table: flow_instances

**Purpose:** Runtime instances of flows being executed

```sql
CREATE TABLE flow_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    flow_version_id UUID NOT NULL REFERENCES flow_versions(id),
    flow_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    entity_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'IN_PROGRESS',
    initiated_by UUID NOT NULL REFERENCES users(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    current_step_order INTEGER DEFAULT 1
);

CREATE INDEX idx_flow_instances_tenant ON flow_instances(tenant_id);
CREATE INDEX idx_flow_instances_flow_version ON flow_instances(flow_version_id);
CREATE INDEX idx_flow_instances_initiator ON flow_instances(initiated_by);
CREATE INDEX idx_flow_instances_status ON flow_instances(tenant_id, status);
CREATE INDEX idx_flow_instances_entity ON flow_instances(entity_type, entity_id);
```

**Status:** IN_PROGRESS, COMPLETED, CANCELLED, REJECTED

**Sample Data:**
```sql
INSERT INTO flow_instances (tenant_id, flow_version_id, flow_type, entity_id, entity_type, initiated_by, status) VALUES
('tenant-uuid', 'onboarding-v1-uuid', 'ONBOARDING', 'emp-uuid', 'EMPLOYEE', 'emp-uuid', 'IN_PROGRESS'),
('tenant-uuid', 'leave-v1-uuid', 'LEAVE_APPROVAL', 'leave-req-uuid', 'LEAVE_REQUEST', 'emp-uuid', 'COMPLETED');
```

---

### 5.5 Table: flow_step_instances

**Purpose:** Track execution of individual steps

```sql
CREATE TABLE flow_step_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_instance_id UUID NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
    step_definition_id UUID NOT NULL REFERENCES flow_step_definitions(id),
    step_order INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    data JSONB DEFAULT '{}',
    assigned_to UUID REFERENCES users(id),
    completed_by UUID REFERENCES users(id),
    comments TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_flow_step_instances_flow ON flow_step_instances(flow_instance_id);
CREATE INDEX idx_flow_step_instances_assigned ON flow_step_instances(assigned_to);
CREATE INDEX idx_flow_step_instances_status ON flow_step_instances(flow_instance_id, status);
```

**Status:** PENDING, IN_PROGRESS, COMPLETED, APPROVED, REJECTED, SKIPPED

**Sample data JSONB:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@acme.com",
  "department_id": "dept-uuid",
  "joining_date": "2024-01-15"
}
```

---

## 6. Form Schema Table

### 6.1 Table: form_schema_definitions

**Purpose:** Store dynamic form schemas (JSON-based)

```sql
CREATE TABLE form_schema_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    schema_json JSONB NOT NULL,
    validation_rules JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

CREATE INDEX idx_form_schemas_tenant ON form_schema_definitions(tenant_id);
CREATE INDEX idx_form_schemas_code ON form_schema_definitions(tenant_id, code);
```

**Sample schema_json for Basic Info:**
```json
{
  "fields": [
    {
      "id": "first_name",
      "label": "First Name",
      "type": "text",
      "required": true,
      "validation": {
        "minLength": 2,
        "maxLength": 50
      }
    },
    {
      "id": "last_name",
      "label": "Last Name",
      "type": "text",
      "required": true
    },
    {
      "id": "email",
      "label": "Email",
      "type": "email",
      "required": true
    },
    {
      "id": "phone",
      "label": "Phone",
      "type": "text",
      "required": false,
      "validation": {
        "pattern": "^[0-9]{10}$"
      }
    },
    {
      "id": "date_of_birth",
      "label": "Date of Birth",
      "type": "date",
      "required": true
    }
  ]
}
```

**Sample schema_json for Job Details:**
```json
{
  "fields": [
    {
      "id": "employee_code",
      "label": "Employee Code",
      "type": "text",
      "required": true,
      "readonly": true
    },
    {
      "id": "department_id",
      "label": "Department",
      "type": "dropdown",
      "required": true,
      "dataSource": {
        "type": "api",
        "endpoint": "/api/v1/departments",
        "valueField": "id",
        "labelField": "name"
      }
    },
    {
      "id": "designation_id",
      "label": "Designation",
      "type": "dropdown",
      "required": true,
      "dataSource": {
        "type": "api",
        "endpoint": "/api/v1/designations",
        "valueField": "id",
        "labelField": "title"
      }
    },
    {
      "id": "location_id",
      "label": "Location",
      "type": "dropdown",
      "required": true,
      "dataSource": {
        "type": "api",
        "endpoint": "/api/v1/locations",
        "valueField": "id",
        "labelField": "name"
      }
    },
    {
      "id": "joining_date",
      "label": "Joining Date",
      "type": "date",
      "required": true
    },
    {
      "id": "manager_id",
      "label": "Reporting Manager",
      "type": "dropdown",
      "required": true,
      "dataSource": {
        "type": "api",
        "endpoint": "/api/v1/employees?role=manager",
        "valueField": "id",
        "labelField": "full_name"
      }
    }
  ]
}
```

**Sample schema_json for Leave Application:**
```json
{
  "fields": [
    {
      "id": "leave_type_id",
      "label": "Leave Type",
      "type": "dropdown",
      "required": true,
      "dataSource": {
        "type": "api",
        "endpoint": "/api/v1/leave-types",
        "valueField": "id",
        "labelField": "name"
      }
    },
    {
      "id": "from_date",
      "label": "From Date",
      "type": "date",
      "required": true
    },
    {
      "id": "to_date",
      "label": "To Date",
      "type": "date",
      "required": true
    },
    {
      "id": "number_of_days",
      "label": "Number of Days",
      "type": "number",
      "required": true,
      "readonly": true,
      "computed": true
    },
    {
      "id": "reason",
      "label": "Reason",
      "type": "textarea",
      "required": true,
      "validation": {
        "minLength": 10,
        "maxLength": 500
      }
    }
  ]
}
```

**Sample Data:**
```sql
INSERT INTO form_schema_definitions (tenant_id, name, code, schema_json) VALUES
('tenant-uuid', 'Basic Information Form', 'BASIC_INFO', '{"fields": [...]}'),
('tenant-uuid', 'Job Details Form', 'JOB_DETAILS', '{"fields": [...]}'),
('tenant-uuid', 'Leave Application Form', 'LEAVE_APPLICATION', '{"fields": [...]}');
```

---

## 7. Policy Engine Tables

### 7.1 Table: policy_definitions

**Purpose:** Store business rule policies

```sql
CREATE TABLE policy_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    policy_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    config_json JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    effective_from DATE,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

CREATE INDEX idx_policy_definitions_tenant ON policy_definitions(tenant_id);
CREATE INDEX idx_policy_definitions_type ON policy_definitions(tenant_id, policy_type);
```

**Policy Types:** LEAVE, PAYROLL, ATTENDANCE

**Sample config_json for Leave Policy:**
```json
{
  "leave_type_id": "casual-leave-uuid",
  "accrual": {
    "frequency": "MONTHLY",
    "amount": 1.5,
    "start_month": 1
  },
  "limits": {
    "max_balance": 30,
    "max_per_request": 10,
    "min_gap_days": 15
  },
  "carry_forward": {
    "enabled": true,
    "max_days": 15,
    "expiry_month": 3
  },
  "encashment": {
    "enabled": false
  }
}
```

**Sample Data:**
```sql
INSERT INTO policy_definitions (tenant_id, policy_type, name, code, config_json) VALUES
('tenant-uuid', 'LEAVE', 'Casual Leave Policy', 'CL_POLICY', '{"accrual": {...}}'),
('tenant-uuid', 'LEAVE', 'Sick Leave Policy', 'SL_POLICY', '{"accrual": {...}}');
```

---

## 8. Leave Management Tables

### 8.1 Table: leave_types

**Purpose:** Define types of leaves

```sql
CREATE TABLE leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    is_paid BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

CREATE INDEX idx_leave_types_tenant ON leave_types(tenant_id);
```

**Sample Data:**
```sql
INSERT INTO leave_types (tenant_id, name, code, is_paid) VALUES
('tenant-uuid', 'Casual Leave', 'CL', true),
('tenant-uuid', 'Sick Leave', 'SL', true),
('tenant-uuid', 'Earned Leave', 'EL', true),
('tenant-uuid', 'Loss of Pay', 'LOP', false);
```

---

### 8.2 Table: leave_balances

**Purpose:** Track leave balances for employees

```sql
CREATE TABLE leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    employee_id UUID NOT NULL REFERENCES employees(id),
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    year INTEGER NOT NULL,
    opening_balance DECIMAL(5,2) DEFAULT 0,
    accrued DECIMAL(5,2) DEFAULT 0,
    used DECIMAL(5,2) DEFAULT 0,
    pending DECIMAL(5,2) DEFAULT 0,
    available DECIMAL(5,2) GENERATED ALWAYS AS (opening_balance + accrued - used - pending) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, employee_id, leave_type_id, year)
);

CREATE INDEX idx_leave_balances_employee ON leave_balances(tenant_id, employee_id);
CREATE INDEX idx_leave_balances_year ON leave_balances(tenant_id, year);
```

**Sample Data:**
```sql
INSERT INTO leave_balances (tenant_id, employee_id, leave_type_id, year, opening_balance, accrued) VALUES
('tenant-uuid', 'emp1-uuid', 'cl-uuid', 2025, 0, 18),
('tenant-uuid', 'emp1-uuid', 'sl-uuid', 2025, 0, 12),
('tenant-uuid', 'emp1-uuid', 'el-uuid', 2025, 0, 15);
```

---

### 8.3 Table: leave_requests

**Purpose:** Track leave applications

```sql
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    employee_id UUID NOT NULL REFERENCES employees(id),
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    flow_instance_id UUID REFERENCES flow_instances(id),
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    number_of_days DECIMAL(4,2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leave_requests_tenant ON leave_requests(tenant_id);
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(tenant_id, status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(tenant_id, from_date, to_date);
```

**Status:** PENDING, APPROVED, REJECTED, CANCELLED

---

## 9. Approvals Table

### 9.1 Table: approvals

**Purpose:** Generic approval records (can be used across modules)

```sql
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    flow_step_instance_id UUID REFERENCES flow_step_instances(id),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    approver_id UUID NOT NULL REFERENCES users(id),
    approver_role VARCHAR(50),
    status VARCHAR(50) DEFAULT 'PENDING',
    comments TEXT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_approvals_tenant ON approvals(tenant_id);
CREATE INDEX idx_approvals_approver ON approvals(approver_id, status);
CREATE INDEX idx_approvals_entity ON approvals(entity_type, entity_id);
```

**Status:** PENDING, APPROVED, REJECTED

**Entity Types:** LEAVE_REQUEST, ONBOARDING, REIMBURSEMENT, etc.

---

## 10. Notifications Table

### 10.1 Table: notifications

**Purpose:** In-app notifications

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50),
    entity_type VARCHAR(50),
    entity_id UUID,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(user_id, created_at DESC);
```

**Notification Types:** APPROVAL_PENDING, APPROVAL_APPROVED, APPROVAL_REJECTED, FLOW_COMPLETED, SYSTEM

**Sample Data:**
```sql
INSERT INTO notifications (tenant_id, user_id, title, message, notification_type, entity_type, entity_id) VALUES
('tenant-uuid', 'manager-uuid', 'New Approval Request', 'John Doe has applied for leave', 'APPROVAL_PENDING', 'LEAVE_REQUEST', 'leave-req-uuid'),
('tenant-uuid', 'emp-uuid', 'Leave Approved', 'Your leave request has been approved', 'APPROVAL_APPROVED', 'LEAVE_REQUEST', 'leave-req-uuid');
```

---

## 11. Database Initialization Script

### 11.1 Complete Schema Creation

```sql
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create all tables in order (following foreign key dependencies)
-- 1. Tenants (no dependencies)
-- 2. Users (depends on tenants)
-- 3. Roles (depends on tenants)
-- 4. Role Permissions (depends on roles)
-- 5. User Roles (depends on users, roles)
-- 6. Departments, Designations, Locations (depend on tenants)
-- 7. Employees (depends on users, departments, designations, locations)
-- 8. Flow Definitions (depends on tenants)
-- 9. Flow Versions (depends on flow_definitions)
-- 10. Form Schemas (depends on tenants)
-- 11. Flow Step Definitions (depends on flow_versions, form_schemas)
-- 12. Flow Instances (depends on flow_versions, users)
-- 13. Flow Step Instances (depends on flow_instances, flow_step_definitions, users)
-- 14. Policy Definitions (depends on tenants)
-- 15. Leave Types (depends on tenants)
-- 16. Leave Balances (depends on employees, leave_types)
-- 17. Leave Requests (depends on employees, leave_types, flow_instances)
-- 18. Approvals (depends on flow_step_instances, users)
-- 19. Notifications (depends on users)
```

### 11.2 Seed Data Script Order

```sql
-- 1. Create 2 tenants
-- 2. Create users for each tenant
-- 3. Create default roles
-- 4. Assign permissions to roles
-- 5. Assign roles to users
-- 6. Create departments
-- 7. Create designations
-- 8. Create locations
-- 9. Create employees
-- 10. Create leave types
-- 11. Create leave balances
-- 12. Create flow definitions
-- 13. Create flow versions
-- 14. Create form schemas
-- 15. Create flow step definitions
-- 16. Create policy definitions
```

---

## 12. Index Strategy

### 12.1 Essential Indexes

All tables with `tenant_id` must have:
```sql
CREATE INDEX idx_{table}_tenant ON {table}(tenant_id);
```

All tables with foreign keys should have indexes on FK columns.

All tables with status columns should have composite indexes:
```sql
CREATE INDEX idx_{table}_status ON {table}(tenant_id, status);
```

Date range queries need indexes:
```sql
CREATE INDEX idx_leave_requests_dates ON leave_requests(tenant_id, from_date, to_date);
```

---

## 13. Performance Optimization

### 13.1 Computed Columns

Use GENERATED ALWAYS AS for computed fields:
```sql
available DECIMAL(5,2) GENERATED ALWAYS AS (opening_balance + accrued - used - pending) STORED
```

### 13.2 JSONB Indexing (Optional for POC)

For frequent JSONB queries:
```sql
CREATE INDEX idx_form_schemas_json ON form_schema_definitions USING gin(schema_json);
```

---

## 14. Data Volume Estimates (POC)

- **Tenants:** 2
- **Users per tenant:** ~20 (Total: 40)
- **Employees per tenant:** ~15 (Total: 30)
- **Departments per tenant:** ~5 (Total: 10)
- **Designations per tenant:** ~8 (Total: 16)
- **Locations per tenant:** ~3 (Total: 6)
- **Flow Definitions per tenant:** ~2 (Total: 4)
- **Flow Versions per flow:** ~1 (Total: 4)
- **Form Schemas per tenant:** ~3 (Total: 6)
- **Flow Instances per tenant:** ~10-20 (Total: 20-40)
- **Leave Requests per tenant:** ~20 (Total: 40)

**Total Estimated Rows:** ~300-500 rows across all tables

---

## 15. Backup & Restore (POC)

### 15.1 Backup Command
```bash
pg_dump -h localhost -U postgres -d wisright_hrms > backup.sql
```

### 15.2 Restore Command
```bash
psql -h localhost -U postgres -d wisright_hrms < backup.sql
```

### 15.3 Reset Database
```bash
# Drop and recreate
dropdb wisright_hrms
createdb wisright_hrms
psql -h localhost -U postgres -d wisright_hrms < schema.sql
psql -h localhost -U postgres -d wisright_hrms < seed.sql
```

---

## 16. Next Steps

1. Create SQL script files:
   - `schema.sql` - All CREATE TABLE statements
   - `indexes.sql` - All CREATE INDEX statements
   - `seed.sql` - Sample data for demo
   - `reset.sql` - Drop and recreate everything

2. Use migration tool (optional):
   - TypeORM migrations
   - Prisma migrations
   - Or raw SQL scripts

3. Test multi-tenancy:
   - Verify tenant isolation
   - Test all queries with tenant_id filter
   - Verify foreign key constraints

---

**Document Status:** Ready for Implementation  
**Next Document:** API Specification

