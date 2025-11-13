# WisRight HRMS - Detailed User Stories with Complete Scenarios

## Document Version: 1.0
**Date:** November 13, 2025
**Purpose:** Extremely detailed user stories with step-by-step scenarios, mockups, edge cases, and technical notes

---

## How to Use This Document

This document provides **comprehensive detail** for each user story including:
- **Full User Scenario** - Step-by-step walkthrough
- **UI Mockup Description** - What the user sees
- **Happy Path** - Normal flow
- **Error Scenarios** - What can go wrong
- **Edge Cases** - Unusual situations
- **Technical Notes** - Implementation guidance
- **API Calls** - Exact endpoints to use
- **Database Changes** - What data is created/updated

---

## Table of Contents

1. [Admin Stories - Tenant & Auth](#1-admin-stories---tenant--auth)
2. [Admin Stories - Master Data](#2-admin-stories---master-data)
3. [Admin Stories - Flow Configuration](#3-admin-stories---flow-configuration)
4. [Admin Stories - Employee Management](#4-admin-stories---employee-management)
5. [User Stories - Onboarding Flow](#5-user-stories---onboarding-flow)
6. [User Stories - Leave Management](#6-user-stories---leave-management)
7. [Manager Stories - Approvals](#7-manager-stories---approvals)

---

## 1. Admin Stories - Tenant & Auth

### Story #1: Super Admin Creates New Tenant

**Story ID:** US-DETAIL-001
**User Role:** Super Admin
**Epic:** Multi-Tenant Setup

#### Story Description
As a Super Admin, I want to create a new tenant organization so that a new company can start using the HRMS system with complete data isolation.

---

#### Full User Scenario (Happy Path)

**Setup:**
- Super Admin is already logged in
- Super Admin has "SUPER_ADMIN" role
- Database is ready

**Step-by-Step Flow:**

1. **Navigate to Tenant Management**
   - Super Admin clicks "Tenants" in left sidebar
   - System loads tenant list page
   - Page shows: Table of existing tenants with columns (Name, Subdomain, Admin Email, Created Date, Status)
   - "Create New Tenant" button visible at top right

2. **Open Create Tenant Form**
   - Super Admin clicks "Create New Tenant" button
   - System opens a modal dialog OR navigates to new page
   - Form appears with empty fields

3. **Fill Tenant Details**
   - Super Admin enters:
     - **Tenant Name:** "Acme Corporation"
     - **Subdomain:** "acme" (will be acme.wisright-hrms.com)
     - **Admin Email:** "admin@acmecorp.com"
     - **Admin Name:** "John Smith"
     - **Industry:** Select from dropdown (IT, Healthcare, Manufacturing, etc.)
     - **Employee Count:** Select range (1-50, 51-200, 201-500, 500+)

4. **Validation**
   - System validates in real-time:
     - Tenant Name: Required, min 3 chars
     - Subdomain: Required, lowercase, alphanumeric, unique
     - Admin Email: Valid email format, unique
     - Admin Name: Required
   - Show green checkmarks next to valid fields
   - Show red error messages next to invalid fields

5. **Submit Form**
   - Super Admin clicks "Create Tenant" button
   - Button shows loading spinner
   - System disables form during processing

6. **Backend Processing**
   - API call: `POST /api/v1/super-admin/tenants`
   - Backend creates:
     - New record in `tenants` table
     - New admin user in `users` table
     - Default roles in `roles` table (Admin, Manager, Employee)
     - Default permissions in `role_permissions` table
     - Associates admin user with Admin role
     - Generates temporary password
     - Sends welcome email to admin

7. **Success Confirmation**
   - Modal closes OR navigates back to list
   - Success toast notification appears: "Tenant created successfully! Welcome email sent to admin@acmecorp.com"
   - New tenant appears in the tenant list
   - Tenant status shows as "Active"

---

#### UI Mockup Description

**Tenant List Page:**
```
┌──────────────────────────────────────────────────────────────┐
│  [☰] WisRight HRMS - Super Admin         [John] [Logout]    │
├──────────────────────────────────────────────────────────────┤
│  Tenants                                                      │
│                                   [+ Create New Tenant] [↻]  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Name         Subdomain   Admin Email        Created    │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ Acme Corp    acme        admin@acme.com    2025-11-01  │ │
│  │ TechStart    techstart   hr@techstart.io   2025-11-05  │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Create Tenant Modal:**
```
┌─────────────── Create New Tenant ───────────────┐
│                                                  │
│  Tenant Name *                                   │
│  [Acme Corporation                            ]  │
│                                                  │
│  Subdomain *                                     │
│  [acme          ] .wisright-hrms.com             │
│  ✓ Available                                     │
│                                                  │
│  Admin Email *                                   │
│  [admin@acmecorp.com                          ]  │
│  ✓ Valid email                                   │
│                                                  │
│  Admin Name *                                    │
│  [John Smith                                  ]  │
│                                                  │
│  Industry *                                      │
│  [IT & Software                    ▼]            │
│                                                  │
│  Employee Count Range                            │
│  [51-200                           ▼]            │
│                                                  │
│  [ Cancel ]              [ Create Tenant ]       │
└──────────────────────────────────────────────────┘
```

---

#### Error Scenarios

**Error #1: Duplicate Subdomain**
- **Trigger:** User enters subdomain "acme" which already exists
- **Validation:** Frontend shows error after blur OR backend rejects
- **Error Message:** "Subdomain 'acme' is already taken. Please choose another."
- **UI State:** Submit button disabled until corrected
- **API Response:** 400 Bad Request
  ```json
  {
    "error": true,
    "message": "Subdomain already exists",
    "code": "SUBDOMAIN_DUPLICATE",
    "field": "subdomain"
  }
  ```

**Error #2: Invalid Email Format**
- **Trigger:** User enters "admin@acme" (no TLD)
- **Validation:** Frontend regex validation
- **Error Message:** "Please enter a valid email address"
- **UI State:** Show error below field, red border

**Error #3: Network Error**
- **Trigger:** API call fails due to network issue
- **Error Message:** "Failed to create tenant. Please check your connection and try again."
- **UI State:** Re-enable form, allow retry
- **User Action:** Can click "Create Tenant" again

**Error #4: Backend Database Error**
- **Trigger:** Database connection fails
- **Error Message:** "System error. Please try again later."
- **UI State:** Close modal, show error toast
- **Logging:** Backend logs full error for debugging
- **API Response:** 500 Internal Server Error

---

#### Edge Cases

**Edge #1: Very Long Tenant Name**
- **Input:** Name with 200 characters
- **Validation:** Max length 100 characters
- **Behavior:** Frontend prevents typing beyond 100 chars
- **Error Message:** "Tenant name must be less than 100 characters"

**Edge #2: Special Characters in Subdomain**
- **Input:** "acme-corp!" or "acme corp"
- **Validation:** Only alphanumeric and hyphens allowed
- **Error Message:** "Subdomain can only contain lowercase letters, numbers, and hyphens"

**Edge #3: Email Already Exists as User**
- **Input:** admin@acme.com already exists in another tenant
- **Behavior:** Allow (users can be admin of multiple tenants)
- **Backend:** Check if user exists, add new tenant association

**Edge #4: Subdomain Reserved Words**
- **Input:** "admin", "api", "www", "app"
- **Validation:** Check against reserved words list
- **Error Message:** "This subdomain is reserved. Please choose another."

---

#### Technical Notes for Developers

**Frontend Implementation:**
- **Component:** `TenantCreateModal.tsx` or `TenantCreatePage.tsx`
- **Form Library:** React Hook Form
- **Validation:** Yup schema or Zod
- **State Management:** Local state (useState) or React Query mutation
- **API Call:** Axios POST to `/api/v1/super-admin/tenants`

**Form Validation Schema (Example - Yup):**
```typescript
const tenantSchema = yup.object({
  name: yup.string()
    .required('Tenant name is required')
    .min(3, 'Must be at least 3 characters')
    .max(100, 'Must be less than 100 characters'),

  subdomain: yup.string()
    .required('Subdomain is required')
    .matches(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens')
    .min(3, 'Must be at least 3 characters')
    .max(50, 'Must be less than 50 characters'),

  adminEmail: yup.string()
    .required('Admin email is required')
    .email('Must be a valid email'),

  adminName: yup.string()
    .required('Admin name is required')
    .min(2, 'Must be at least 2 characters'),

  industry: yup.string().required('Please select an industry'),

  employeeCountRange: yup.string().optional()
});
```

**Backend Implementation:**
- **Controller:** `TenantController.ts`
- **Service:** `TenantService.ts`
- **Validation:** class-validator DTOs
- **Transaction:** Use database transaction to ensure atomicity

**Backend DTO (Example - NestJS):**
```typescript
export class CreateTenantDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  @MinLength(3)
  @MaxLength(50)
  subdomain: string;

  @IsEmail()
  adminEmail: string;

  @IsString()
  @MinLength(2)
  adminName: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  employeeCountRange?: string;
}
```

---

#### API Endpoint Specification

**Endpoint:** `POST /api/v1/super-admin/tenants`

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "subdomain": "acme",
  "adminEmail": "admin@acmecorp.com",
  "adminName": "John Smith",
  "industry": "IT",
  "employeeCountRange": "51-200"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Tenant created successfully",
  "data": {
    "tenant": {
      "id": "uuid-here",
      "name": "Acme Corporation",
      "subdomain": "acme",
      "status": "ACTIVE",
      "createdAt": "2025-11-13T10:30:00Z"
    },
    "adminUser": {
      "id": "user-uuid",
      "email": "admin@acmecorp.com",
      "name": "John Smith",
      "temporaryPassword": "TempPass123!" // Only returned on creation
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": true,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "subdomain",
      "message": "Subdomain already exists"
    }
  ]
}
```

---

#### Database Changes

**Tables Affected:**

1. **tenants**
   ```sql
   INSERT INTO tenants (id, name, subdomain, status, settings_json, created_at)
   VALUES (
     'uuid-generated',
     'Acme Corporation',
     'acme',
     'ACTIVE',
     '{"industry": "IT", "employeeCountRange": "51-200"}',
     NOW()
   );
   ```

2. **users**
   ```sql
   INSERT INTO users (id, tenant_id, email, password_hash, full_name, status, created_at)
   VALUES (
     'user-uuid',
     'tenant-uuid',
     'admin@acmecorp.com',
     '$2b$10$...',  -- bcrypt hash of temporary password
     'John Smith',
     'ACTIVE',
     NOW()
   );
   ```

3. **roles** (3 default roles created)
   ```sql
   INSERT INTO roles (id, tenant_id, name, description)
   VALUES
     ('role-1-uuid', 'tenant-uuid', 'Admin', 'Full system access'),
     ('role-2-uuid', 'tenant-uuid', 'Manager', 'Team management and approvals'),
     ('role-3-uuid', 'tenant-uuid', 'Employee', 'Basic employee access');
   ```

4. **user_roles**
   ```sql
   INSERT INTO user_roles (id, user_id, role_id)
   VALUES ('ur-uuid', 'user-uuid', 'role-1-uuid'); -- Assign Admin role
   ```

5. **role_permissions** (Seed default permissions for each role)
   - Admin: All permissions
   - Manager: Approvals, team view
   - Employee: Profile, leave application

---

#### Acceptance Criteria (Detailed)

- [ ] **AC1:** Super Admin can navigate to "Tenants" page
- [ ] **AC2:** "Create New Tenant" button is visible and clickable
- [ ] **AC3:** Form opens in modal OR new page
- [ ] **AC4:** All required fields marked with asterisk (*)
- [ ] **AC5:** Subdomain field shows ".wisright-hrms.com" suffix
- [ ] **AC6:** Real-time validation on blur shows checkmarks/errors
- [ ] **AC7:** Submit button disabled if form invalid
- [ ] **AC8:** Subdomain uniqueness checked against database
- [ ] **AC9:** Email format validated with regex
- [ ] **AC10:** On submit, button shows loading spinner
- [ ] **AC11:** Form disabled during API call
- [ ] **AC12:** Backend creates tenant record with UUID
- [ ] **AC13:** Backend creates admin user with encrypted password
- [ ] **AC14:** Backend creates 3 default roles (Admin, Manager, Employee)
- [ ] **AC15:** Backend assigns Admin role to admin user
- [ ] **AC16:** Backend sends welcome email with temporary password
- [ ] **AC17:** Success toast notification shown
- [ ] **AC18:** New tenant appears in tenant list
- [ ] **AC19:** Tenant status is "ACTIVE"
- [ ] **AC20:** On error, form re-enabled for retry
- [ ] **AC21:** Duplicate subdomain shows clear error message
- [ ] **AC22:** Network errors handled gracefully
- [ ] **AC23:** All database operations wrapped in transaction
- [ ] **AC24:** Transaction rolled back on any error
- [ ] **AC25:** API returns 201 on success, 400 on validation error, 500 on server error

---

#### Testing Checklist

**Unit Tests:**
- [ ] Form validation works for all fields
- [ ] Subdomain regex validation correct
- [ ] Email validation correct
- [ ] API service calls correct endpoint
- [ ] Success handler updates UI correctly
- [ ] Error handler shows error messages

**Integration Tests:**
- [ ] API endpoint creates tenant in database
- [ ] Transaction rolls back on error
- [ ] Duplicate subdomain rejected
- [ ] Email sent successfully
- [ ] Default roles created
- [ ] Admin user created and role assigned

**E2E Tests:**
- [ ] Complete flow from button click to success
- [ ] Error scenarios display correctly
- [ ] Navigation works
- [ ] Form validation prevents invalid submission

---

## 2. Admin Stories - Master Data

### Story #2: HR Admin Creates Department

**Story ID:** US-DETAIL-002
**User Role:** HR Admin
**Epic:** Master Data Management

#### Story Description
As an HR Admin, I want to create departments in my organization so that employees can be organized into departments and reports can be generated by department.

---

#### Full User Scenario (Happy Path)

**Setup:**
- HR Admin is logged in
- Tenant: "Acme Corporation" (tenant_id: acme-uuid)
- HR Admin has "Admin" role with CONFIGURE permission on "Master Data" module

**Step-by-Step Flow:**

1. **Navigate to Master Data**
   - HR Admin clicks "Master Data" in left sidebar
   - Submenu expands showing: Departments, Designations, Locations, Shifts
   - HR Admin clicks "Departments"
   - System loads department list page

2. **View Existing Departments**
   - Page shows table with columns: Department Name, Code, Head of Department, Employee Count, Status
   - Example existing departments:
     - Engineering (ENG) - Head: Sarah Johnson - 45 employees - Active
     - Sales (SAL) - Head: Not Assigned - 12 employees - Active
   - "Add Department" button visible at top right

3. **Open Create Department Form**
   - HR Admin clicks "Add Department" button
   - Form appears (inline OR modal OR new page)
   - Form has fields:
     - Department Name *
     - Department Code *
     - Head of Department (dropdown)
     - Parent Department (dropdown, optional)
     - Description
     - Status (Active/Inactive toggle, default: Active)

4. **Fill Department Details**
   - HR Admin enters:
     - **Department Name:** "Human Resources"
     - **Department Code:** "HR" (auto-suggest based on name)
     - **Head of Department:** Select "John Smith" from employee dropdown
     - **Parent Department:** None (top-level department)
     - **Description:** "Handles recruitment, payroll, and employee relations"
     - **Status:** Active (toggle ON)

5. **Validation**
   - Department Name: Required, 2-100 chars, unique within tenant
   - Department Code: Required, 2-10 chars, uppercase, alphanumeric, unique within tenant
   - Head of Department: Optional, must be valid employee ID
   - Parent Department: Optional, cannot be self
   - Description: Optional, max 500 chars
   - Status: Required, boolean

6. **Submit Form**
   - HR Admin clicks "Save Department" button
   - Button shows loading state
   - Form disabled during processing

7. **Backend Processing**
   - API call: `POST /api/v1/{tenantId}/departments`
   - JWT token includes tenant_id: "acme-uuid"
   - Middleware validates tenant_id matches token
   - Backend creates:
     - New record in `departments` table with tenant_id = "acme-uuid"
     - Sets created_by = current user ID
     - Sets created_at = current timestamp

8. **Success Confirmation**
   - Form closes OR clears
   - Success toast: "Department 'Human Resources' created successfully"
   - Department list refreshes automatically
   - New department appears in the table
   - HR Admin sees: Human Resources (HR) - Head: John Smith - 0 employees - Active

---

#### UI Mockup Description

**Departments List Page:**
```
┌──────────────────────────────────────────────────────────────────────┐
│  [☰] WisRight HRMS - Acme Corp          [HR Admin] [Notifications]  │
├──────────────────────────────────────────────────────────────────────┤
│  ← Master Data > Departments                                         │
│                                                                       │
│  Departments                               [+ Add Department] [↻]    │
│                                                                       │
│  [Search departments...                                        ] [🔍] │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Name              Code  Head           Employees  Status    ⚙  │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │ Engineering       ENG   Sarah Johnson  45         ● Active  ⋮  │ │
│  │ Sales             SAL   -              12         ● Active  ⋮  │ │
│  │ Human Resources   HR    John Smith     0          ● Active  ⋮  │ │
│  │ Finance           FIN   Mary Brown     8          ● Active  ⋮  │ │
│  │                                                                 │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                     1-4 of 4 total   │
└──────────────────────────────────────────────────────────────────────┘
```

**Add Department Form (Modal):**
```
┌───────────────── Add Department ─────────────────┐
│                                                   │
│  Department Name *                                │
│  [Human Resources                              ]  │
│                                                   │
│  Department Code *                                │
│  [HR            ]  (Auto-suggested from name)     │
│  ✓ Available                                      │
│                                                   │
│  Head of Department                               │
│  [John Smith                            ▼]        │
│  (Select from employees)                          │
│                                                   │
│  Parent Department                                │
│  [None - Top Level Department           ▼]        │
│  (Optional: Create sub-department)                │
│                                                   │
│  Description                                      │
│  [Handles recruitment, payroll, and          ]    │
│  [employee relations                         ]    │
│  [                                           ]    │
│  0/500 characters                                 │
│                                                   │
│  Status                                           │
│  Active [●────────○] Inactive                     │
│                                                   │
│  [ Cancel ]                 [ Save Department ]   │
└───────────────────────────────────────────────────┘
```

---

#### Error Scenarios

**Error #1: Duplicate Department Code**
- **Trigger:** User enters code "ENG" which already exists in tenant
- **Validation:** Backend checks uniqueness within tenant
- **Error Message:** "Department code 'ENG' already exists. Please use a different code."
- **API Response:** 400 Bad Request
  ```json
  {
    "error": true,
    "message": "Department code already exists in this organization",
    "code": "DEPARTMENT_CODE_DUPLICATE",
    "field": "code"
  }
  ```

**Error #2: Duplicate Department Name**
- **Trigger:** User enters "Engineering" which exists
- **Validation:** Backend checks name uniqueness (case-insensitive)
- **Error Message:** "Department 'Engineering' already exists"
- **Behavior:** Suggest using different name OR editing existing department

**Error #3: Invalid Head of Department**
- **Trigger:** Selected employee ID doesn't exist OR belongs to different tenant
- **Validation:** Backend validates employee exists and tenant_id matches
- **Error Message:** "Selected employee is not valid"
- **API Response:** 400 Bad Request

**Error #4: Circular Parent Relationship**
- **Trigger:** Later when editing, user tries to set parent to a child department
- **Validation:** Backend checks for circular references
- **Error Message:** "Cannot set parent department: circular relationship detected"

---

#### Edge Cases

**Edge #1: Department Code Auto-Suggestion**
- **Input:** Department Name = "Human Resources"
- **Behavior:** Auto-suggest code = "HR" (first letters of each word)
- **Input:** "Information Technology"
- **Auto-suggest:** "IT"
- **User can override:** Yes, editable field

**Edge #2: No Employees Available for Head**
- **Scenario:** No employees exist in the system yet
- **Behavior:** Dropdown shows "No employees available"
- **Allow creation:** Yes, Head is optional
- **Later assignment:** Can edit department to assign head

**Edge #3: Deleting Department with Employees**
- **Scenario:** User tries to delete department with 45 employees
- **Behavior:** Show warning "Cannot delete department with employees. Please reassign employees first."
- **Action required:** Move employees to different department before deletion

**Edge #4: Hierarchical Departments**
- **Input:** Parent = "Engineering"
- **Behavior:** Creates sub-department under Engineering
- **Display:** Show indented in list (e.g., "  └─ Backend Engineering")
- **Reports:** Can roll up to parent department

---

#### Technical Notes for Developers

**Frontend Implementation:**
- **Component:** `DepartmentCreateForm.tsx`
- **Parent:** `DepartmentsPage.tsx`
- **Form Library:** React Hook Form
- **Auto-suggestion Logic:** Calculate code from name on blur
- **Employee Dropdown:** Async search with typeahead
- **API Call:** POST `/api/v1/{tenantId}/departments`

**Code Auto-Suggestion Algorithm:**
```typescript
function suggestDepartmentCode(name: string): string {
  // Take first letter of each word
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 3).toUpperCase();
  }
  const code = words.map(w => w[0]).join('').toUpperCase();
  return code.substring(0, 10); // Max 10 chars
}

// Examples:
// "Human Resources" → "HR"
// "Information Technology" → "IT"
// "Research and Development" → "RAD"
// "Marketing" → "MAR"
```

**Backend Implementation:**
- **Controller:** `DepartmentsController.ts`
- **Method:** `createDepartment()`
- **Service:** `DepartmentsService.ts`
- **Middleware:** `TenantScopingMiddleware` (automatically adds tenant_id filter)
- **Validation:** DTO with decorators

**Tenant Isolation (CRITICAL):**
```typescript
// Backend Service
async createDepartment(tenantId: string, createDto: CreateDepartmentDto) {
  // ALWAYS scope by tenant
  const existingDept = await this.departmentRepo.findOne({
    where: {
      tenant_id: tenantId,  // ← CRITICAL: Include tenant_id
      code: createDto.code
    }
  });

  if (existingDept) {
    throw new BadRequestException('Department code already exists');
  }

  const department = this.departmentRepo.create({
    ...createDto,
    tenant_id: tenantId,  // ← CRITICAL: Set tenant_id
    created_by: currentUserId
  });

  return await this.departmentRepo.save(department);
}
```

---

#### API Endpoint Specification

**Endpoint:** `POST /api/v1/{tenantId}/departments`

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
X-Tenant-ID: acme-uuid  (optional, can come from JWT)
```

**Request Body:**
```json
{
  "name": "Human Resources",
  "code": "HR",
  "headOfDepartmentId": "employee-uuid-123",
  "parentDepartmentId": null,
  "description": "Handles recruitment, payroll, and employee relations",
  "status": "ACTIVE"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "id": "dept-uuid-456",
    "tenantId": "acme-uuid",
    "name": "Human Resources",
    "code": "HR",
    "headOfDepartmentId": "employee-uuid-123",
    "headOfDepartmentName": "John Smith",
    "parentDepartmentId": null,
    "description": "Handles recruitment, payroll, and employee relations",
    "status": "ACTIVE",
    "employeeCount": 0,
    "createdBy": "user-uuid-789",
    "createdAt": "2025-11-13T11:00:00Z",
    "updatedAt": "2025-11-13T11:00:00Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": true,
  "message": "Department code already exists in this organization",
  "code": "DEPARTMENT_CODE_DUPLICATE",
  "field": "code"
}
```

---

#### Database Changes

**Table:** departments

```sql
INSERT INTO departments (
  id,
  tenant_id,
  name,
  code,
  head_of_department_id,
  parent_department_id,
  description,
  status,
  created_by,
  created_at,
  updated_at
)
VALUES (
  'dept-uuid-456',
  'acme-uuid',  -- ← CRITICAL: Tenant isolation
  'Human Resources',
  'HR',
  'employee-uuid-123',
  NULL,
  'Handles recruitment, payroll, and employee relations',
  'ACTIVE',
  'user-uuid-789',
  NOW(),
  NOW()
);
```

**Query to Verify Uniqueness:**
```sql
SELECT COUNT(*) FROM departments
WHERE tenant_id = 'acme-uuid'  -- ← CRITICAL: Scoped to tenant
  AND code = 'HR';
-- Should return 0 before insert
```

---

#### Acceptance Criteria (Detailed)

- [ ] **AC1:** HR Admin can navigate to Master Data > Departments
- [ ] **AC2:** Department list loads showing only current tenant's departments
- [ ] **AC3:** "Add Department" button visible and clickable
- [ ] **AC4:** Form opens with all required fields marked (*)
- [ ] **AC5:** Department Code auto-suggests based on name
- [ ] **AC6:** Auto-suggestion can be overridden by user
- [ ] **AC7:** Head of Department dropdown loads employees from current tenant only
- [ ] **AC8:** Parent Department dropdown shows departments from current tenant only
- [ ] **AC9:** Parent Department excludes self (when editing)
- [ ] **AC10:** Form validates all required fields before submit
- [ ] **AC11:** Backend validates department code uniqueness within tenant
- [ ] **AC12:** Backend validates department name uniqueness within tenant
- [ ] **AC13:** Backend validates employee ID belongs to tenant
- [ ] **AC14:** Backend sets tenant_id from JWT token
- [ ] **AC15:** Backend sets created_by from JWT token
- [ ] **AC16:** Success toast shows department name
- [ ] **AC17:** Department list refreshes after creation
- [ ] **AC18:** New department appears with 0 employees
- [ ] **AC19:** Status defaults to Active
- [ ] **AC20:** Duplicate code shows clear error message
- [ ] **AC21:** Error doesn't close form (allows correction)
- [ ] **AC22:** All database operations scoped by tenant_id
- [ ] **AC23:** No data leakage between tenants
- [ ] **AC24:** Audit trail captures created_by and created_at
- [ ] **AC25:** Can cancel form without saving

---

## 3. Admin Stories - Flow Configuration

### Story #3: HR Admin Configures Employee Onboarding Flow

**Story ID:** US-DETAIL-003
**User Role:** HR Admin
**Epic:** Flow Engine Configuration

#### Story Description
As an HR Admin, I want to configure a multi-step employee onboarding workflow so that new hires can complete onboarding through a structured process with approvals and automated actions.

---

#### Full User Scenario (Happy Path)

**Setup:**
- HR Admin is logged in to Acme Corporation tenant
- Tenant already has departments, designations set up
- HR Admin has "Admin" role with CONFIGURE permission on "Flow Engine"

**Goal:**
Create a 4-step onboarding flow:
1. Step 1 (FORM): Basic Information
2. Step 2 (FORM): Job Details
3. Step 3 (APPROVAL): Manager Approval
4. Step 4 (APPROVAL): HR Final Approval

**Step-by-Step Flow:**

1. **Navigate to Flow Configuration**
   - HR Admin clicks "Configuration" in left sidebar
   - Submenu shows: Flows, Form Schemas, Policies
   - HR Admin clicks "Flows"
   - System loads flow list page

2. **View Existing Flows**
   - Page shows cards/table with existing flows:
     - Leave Approval Flow (3 steps) - Active - Version 1
     - Exit Process Flow (5 steps) - Draft - Version 2
   - "Create New Flow" button visible at top

3. **Start Creating New Flow**
   - HR Admin clicks "Create New Flow"
   - System shows flow type selection screen:
     - Radio options: ONBOARDING, LEAVE_APPROVAL, EXIT, PAYROLL_RUN, CUSTOM
   - HR Admin selects: ONBOARDING
   - Clicks "Next"

4. **Enter Flow Basic Info**
   - Form appears with fields:
     - **Flow Name:** "Employee Onboarding Flow"
     - **Description:** "Complete onboarding process for new hires"
     - **Flow Type:** ONBOARDING (auto-filled, read-only)
     - **Version Notes:** "Initial version"
   - HR Admin fills and clicks "Create Flow"

5. **Enter Flow Designer**
   - System creates draft flow and opens flow designer
   - Flow designer shows:
     - Left panel: Step types (FORM, APPROVAL, AUTOMATION, REVIEW, NOTIFICATION)
     - Center canvas: Visual flow builder (drag-and-drop)
     - Right panel: Step configuration panel
     - Top: "Save Draft" | "Preview" | "Publish" buttons
   - Canvas shows: START → [Empty] → END

6. **Add Step 1: Basic Information Form**
   - HR Admin drags "FORM" step type from left panel to canvas
   - Step appears between START and END
   - Right panel shows step configuration:
     - **Step Title:** "Basic Information"
     - **Step Description:** "Enter your personal details"
     - **Form Schema:** [Select Existing] OR [Create New]

   - HR Admin selects "Create New" form schema
   - Form Schema Designer opens:
     - **Schema Name:** "Onboarding - Basic Info"
     - **Fields:** [+ Add Field] button

   - HR Admin adds fields:
     1. Field: First Name
        - Type: Text
        - Required: Yes
        - Validation: Min 2 chars

     2. Field: Last Name
        - Type: Text
        - Required: Yes

     3. Field: Email
        - Type: Email
        - Required: Yes
        - Validation: Email format

     4. Field: Phone
        - Type: Text
        - Required: Yes
        - Validation: Phone format

     5. Field: Date of Birth
        - Type: Date
        - Required: Yes
        - Validation: Age > 18

   - HR Admin clicks "Save Schema"
   - Returns to flow designer
   - Step 1 now configured with "Onboarding - Basic Info" schema

7. **Add Step 2: Job Details Form**
   - HR Admin drags another "FORM" step to canvas
   - Step appears after Step 1
   - Configuration:
     - **Step Title:** "Job Details"
     - **Step Description:** "Enter your job information"
     - **Form Schema:** Create new "Onboarding - Job Details"

   - Fields added:
     1. Department (Dropdown - source: departments table)
     2. Designation (Dropdown - source: designations table)
     3. Join Date (Date)
     4. Employment Type (Radio: Full-time, Part-time, Contract)
     5. Reporting Manager (Dropdown - source: employees table)

   - Save schema and return to flow

8. **Add Step 3: Manager Approval**
   - HR Admin drags "APPROVAL" step to canvas
   - Configuration:
     - **Step Title:** "Manager Approval"
     - **Step Description:** "Manager reviews and approves new hire"
     - **Approval Type:** Single Approver
     - **Approver:** Reporting Manager (from Step 2)
     - **Auto-approve if:** None
     - **Rejection Action:** End flow

   - Save step

9. **Add Step 4: HR Final Approval**
   - HR Admin drags another "APPROVAL" step
   - Configuration:
     - **Step Title:** "HR Final Approval"
     - **Step Description:** "HR Admin final review"
     - **Approval Type:** Role-based
     - **Approver Role:** Admin
     - **Auto-approve if:** None

   - Save step

10. **Add Automation: Welcome Email**
    - HR Admin drags "AUTOMATION" step after Step 4
    - Configuration:
      - **Step Title:** "Send Welcome Email"
      - **Action Type:** Email
      - **Email Template:** Select "Welcome to Company"
      - **Recipient:** {{employee.email}} from Step 1
      - **Trigger:** On Step 4 approved

    - Save step

11. **Review Flow Visually**
    - Canvas now shows:
      ```
      START
        → [1. Basic Information - FORM]
        → [2. Job Details - FORM]
        → [3. Manager Approval - APPROVAL]
        → [4. HR Final Approval - APPROVAL]
        → [5. Send Welcome Email - AUTOMATION]
        → END
      ```
    - All steps connected with arrows
    - Each step shows icon and title

12. **Save as Draft**
    - HR Admin clicks "Save Draft" button
    - System saves flow with status: DRAFT, version: 1
    - Success toast: "Flow saved as draft"

13. **Preview Flow**
    - HR Admin clicks "Preview" button
    - System shows step-by-step walkthrough:
      - Step 1 form preview (not functional, just visual)
      - Step 2 form preview
      - Approval screens preview
    - HR Admin reviews and clicks "Close Preview"

14. **Publish Flow**
    - HR Admin clicks "Publish Flow" button
    - Confirmation modal appears:
      - "Are you sure you want to publish this flow?"
      - "This will make it available for users to execute."
      - "You can create a new version to make changes later."
    - HR Admin clicks "Confirm Publish"

    - Backend processing:
      - Changes flow version status from DRAFT to ACTIVE
      - Creates flow instance template
      - Any existing ACTIVE version moved to ARCHIVED

    - Success notification: "Onboarding flow published successfully!"
    - Flow status badge changes to "Active - Version 1"

15. **Flow is Now Live**
    - Flow appears in user portal
    - New employees can now execute this flow
    - HR can start onboarding processes with this flow

---

#### UI Mockup Description

**Flow List Page:**
```
┌──────────────────────────────────────────────────────────────────┐
│  Configuration > Flows                                           │
│                                         [+ Create New Flow] [↻]  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  📋 Employee Onboarding Flow                             │   │
│  │     4 steps  •  Active  •  Version 1                     │   │
│  │     Complete onboarding process for new hires            │   │
│  │     Last updated: 2025-11-13                             │   │
│  │     [Edit] [View] [Create New Version] [Deactivate]     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  🚪 Leave Approval Flow                                  │   │
│  │     3 steps  •  Active  •  Version 1                     │   │
│  │     [View] [Edit]                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

**Flow Designer (Visual Builder):**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Flow Designer: Employee Onboarding Flow (Draft)                        │
│  [💾 Save Draft] [👁 Preview] [✓ Publish Flow]                    [✕]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Step Types      │            Flow Canvas            │  Configuration   │
│  ─────────────   │                                   │  ───────────────│
│                  │   ┌───────────────┐               │                  │
│  [📝 FORM]       │   │    START      │               │  Step 3 Config   │
│                  │   └───────┬───────┘               │  ───────────────│
│  [✓ APPROVAL]    │           │                       │  Title:          │
│                  │   ┌───────▼────────────┐          │  [Manager        │
│  [⚙ AUTOMATION]  │   │  1. Basic Info     │          │   Approval    ]  │
│                  │   │      (FORM)        │          │                  │
│  [👁 REVIEW]     │   └───────┬────────────┘          │  Approver Type:  │
│                  │           │                       │  ● Single        │
│  [🔔 NOTIFICATION]│  ┌───────▼────────────┐          │  ○ Multi-level   │
│                  │   │  2. Job Details    │          │  ○ Role-based    │
│  [Drag steps]    │   │      (FORM)        │          │                  │
│  [to canvas]     │   └───────┬────────────┘          │  Approver:       │
│                  │           │                       │  [Reporting Mgr ▼│
│                  │   ┌───────▼────────────┐          │                  │
│                  │   │  3. Manager        │ ← SELECTED On Rejection:    │
│                  │   │     Approval       │          │  [End Flow    ▼] │
│                  │   └───────┬────────────┘          │                  │
│                  │           │                       │  [Save Step]     │
│                  │   ┌───────▼────────────┐          │                  │
│                  │   │  4. HR Approval    │          │                  │
│                  │   └───────┬────────────┘          │                  │
│                  │           │                       │                  │
│                  │   ┌───────▼────────────┐          │                  │
│                  │   │  5. Welcome Email  │          │                  │
│                  │   │   (AUTOMATION)     │          │                  │
│                  │   └───────┬────────────┘          │                  │
│                  │           │                       │                  │
│                  │   ┌───────▼───────┐               │                  │
│                  │   │     END       │               │                  │
│                  │   └───────────────┘               │                  │
│                  │                                   │                  │
└──────────────────┴───────────────────────────────────┴──────────────────┘
```

**Form Schema Designer (Modal/Page):**
```
┌──────────────────── Form Schema Designer ──────────────────────┐
│                                                                 │
│  Schema Name: [Onboarding - Basic Info                      ]  │
│  Description: [Basic personal information for new hire      ]  │
│                                                                 │
│  Fields:                                    [+ Add Field]       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  1. First Name                           [↑] [↓] [✕]    │   │
│  │     Type: Text        Required: ☑                       │   │
│  │     Validation: Min length 2                            │   │
│  │     [▼ Expand for more options]                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  2. Last Name                            [↑] [↓] [✕]    │   │
│  │     Type: Text        Required: ☑                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  3. Email                                [↑] [↓] [✕]    │   │
│  │     Type: Email       Required: ☑                       │   │
│  │     Validation: Email format                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  4. Phone                                [↑] [↓] [✕]    │   │
│  │     Type: Text        Required: ☑                       │   │
│  │     Validation: Phone format (US)                       │   │
│  │     Placeholder: (555) 555-5555                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  5. Date of Birth                        [↑] [↓] [✕]    │   │
│  │     Type: Date        Required: ☑                       │   │
│  │     Validation: Age must be at least 18 years           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [ Cancel ]  [ Save as Draft ]         [ Save & Close Schema ] │
└─────────────────────────────────────────────────────────────────┘
```

---

#### Error Scenarios

**Error #1: Duplicate Flow Name**
- **Trigger:** Flow name "Employee Onboarding" already exists
- **Validation:** Backend checks within tenant
- **Error Message:** "Flow with this name already exists. Please use a different name."
- **Behavior:** Allow override OR suggest appending version number

**Error #2: Empty Flow (No Steps)**
- **Trigger:** User tries to publish flow without any steps
- **Validation:** Frontend checks before allowing publish
- **Error Message:** "Cannot publish empty flow. Please add at least one step."
- **Behavior:** Disable publish button

**Error #3: Form Schema with No Fields**
- **Trigger:** FORM step has schema with 0 fields
- **Validation:** Frontend warns when saving step
- **Warning Message:** "Form schema has no fields. Users won't be able to input data."
- **Behavior:** Show warning but allow (for templates)

**Error #4: Approval Step with No Approver**
- **Trigger:** APPROVAL step saved without specifying approver
- **Validation:** Frontend required field
- **Error Message:** "Please select an approver for this approval step"
- **Behavior:** Cannot save step until corrected

**Error #5: Circular Approval Chain**
- **Scenario:** Approver A → Approver B → Approver A (in multi-level)
- **Validation:** Backend detects cycle
- **Error Message:** "Circular approval chain detected. Please review approver sequence."

**Error #6: Invalid Form Field Reference**
- **Trigger:** Automation step references field from non-existent form
- **Validation:** Backend validates field paths
- **Error Message:** "Invalid field reference: {{step2.invalidField}}"

---

#### Edge Cases

**Edge #1: Publishing Over Existing Active Version**
- **Scenario:** Version 1 is ACTIVE, admin publishes new Version 2
- **Behavior:**
  - Version 1 moved to ARCHIVED status
  - Version 2 becomes ACTIVE
  - Running instances still use their version snapshot
- **Confirmation:** "This will archive the current active version. Existing in-progress flows will continue on Version 1."

**Edge #2: Deleting Draft Version**
- **Scenario:** Delete flow that was never published
- **Behavior:** Soft delete OR hard delete (since no instances exist)
- **Confirmation:** "This draft flow has not been published. Delete permanently?"

**Edge #3: Conditional Steps (Future Enhancement)**
- **Scenario:** Show Step 3 only if Step 2 field "Employment Type" = "Full-time"
- **Current POC:** Not supported, all steps shown sequentially
- **Future:** Add "Conditions" panel to each step

**Edge #4: Very Long Flow (10+ steps)**
- **UI Concern:** Canvas gets too long
- **Solution:** Scrollable canvas with zoom controls
- **POC Limit:** Recommend max 7 steps for demo

**Edge #5: Concurrent Edits**
- **Scenario:** Two admins edit same flow simultaneously
- **Behavior:** Last save wins (simple approach for POC)
- **Production:** Would need version conflict detection

---

#### Technical Notes for Developers

**Frontend Implementation:**

**Component Structure:**
```
FlowDesigner/
├── FlowListPage.tsx
├── FlowDesignerPage.tsx
├── FlowCanvas.tsx             // Drag-and-drop canvas
├── StepTypePalette.tsx         // Left panel with step types
├── StepConfigPanel.tsx         // Right panel for configuration
├── FormSchemaDesigner.tsx      // Modal for creating form schemas
├── StepComponents/
│   ├── FormStepConfig.tsx
│   ├── ApprovalStepConfig.tsx
│   ├── AutomationStepConfig.tsx
│   └── NotificationStepConfig.tsx
└── FlowPreview.tsx             // Preview mode
```

**Drag-and-Drop Library:**
- **Option 1:** react-beautiful-dnd (simple, vertical lists)
- **Option 2:** react-dnd (more flexible)
- **Option 3:** @dnd-kit (modern, accessible)
- **Recommendation:** @dnd-kit for POC

**State Management:**
- **Flow Definition:** Store in context OR React Query
- **Steps Array:** useState([step1, step2, ...])
- **Current Step:** useState(selectedStep)
- **Form Changes:** Track dirty state for unsaved warning

**Data Structure (Frontend State):**
```typescript
interface FlowDefinition {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  flowType: 'ONBOARDING' | 'LEAVE_APPROVAL' | 'EXIT' | 'PAYROLL_RUN';
  version: number;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  steps: FlowStep[];
  createdAt: string;
  updatedAt: string;
}

interface FlowStep {
  id: string;
  stepOrder: number;
  stepType: 'FORM' | 'APPROVAL' | 'AUTOMATION' | 'REVIEW' | 'NOTIFICATION';
  title: string;
  description: string;
  config: FormStepConfig | ApprovalStepConfig | AutomationStepConfig;
  isMandatory: boolean;
}

interface FormStepConfig {
  formSchemaId: string;
  formSchema?: FormSchema; // Populated for display
}

interface ApprovalStepConfig {
  approvalType: 'SINGLE' | 'MULTI_LEVEL' | 'ROLE_BASED';
  approverId?: string;
  approverRole?: string;
  approverField?: string; // e.g., "step2.reportingManager"
  onRejection: 'END_FLOW' | 'RETURN_TO_STEP';
  returnToStepId?: string;
}

interface FormSchema {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
}

interface FormField {
  id: string;
  label: string;
  type: 'TEXT' | 'EMAIL' | 'DROPDOWN' | 'DATE' | 'NUMBER' | 'RADIO' | 'CHECKBOX';
  required: boolean;
  validation?: ValidationRule[];
  source?: string; // For dropdowns: "departments", "employees"
  placeholder?: string;
  defaultValue?: any;
}
```

**Backend Implementation:**

**Database Tables:**
```
flow_definitions
  ├── id (UUID, PK)
  ├── tenant_id (UUID, FK → tenants)
  ├── name (VARCHAR)
  ├── description (TEXT)
  ├── flow_type (ENUM)
  ├── is_active (BOOLEAN)
  └── created_at, updated_at

flow_versions
  ├── id (UUID, PK)
  ├── flow_definition_id (UUID, FK → flow_definitions)
  ├── version_number (INT)
  ├── status (ENUM: DRAFT, ACTIVE, ARCHIVED)
  ├── created_by (UUID, FK → users)
  └── created_at

flow_step_definitions
  ├── id (UUID, PK)
  ├── flow_version_id (UUID, FK → flow_versions)
  ├── step_order (INT)
  ├── step_type (ENUM)
  ├── title (VARCHAR)
  ├── description (TEXT)
  ├── form_schema_id (UUID, nullable)
  ├── config_json (JSONB)
  ├── is_mandatory (BOOLEAN)
  └── created_at

form_schema_definitions
  ├── id (UUID, PK)
  ├── tenant_id (UUID, FK → tenants)
  ├── name (VARCHAR)
  ├── description (TEXT)
  ├── schema_json (JSONB)  ← All fields stored here
  ├── validation_json (JSONB)
  └── created_at, updated_at
```

**API Endpoints:**

1. **Create Flow:**
   - `POST /api/v1/{tenantId}/flows`
   - Creates flow_definition + initial flow_version (v1, DRAFT)

2. **Update Flow Steps:**
   - `PUT /api/v1/{tenantId}/flows/{flowId}/versions/{versionId}/steps`
   - Bulk update all steps (easier than individual updates)

3. **Create Form Schema:**
   - `POST /api/v1/{tenantId}/form-schemas`
   - Stores fields in schema_json JSONB

4. **Publish Flow:**
   - `POST /api/v1/{tenantId}/flows/{flowId}/versions/{versionId}/publish`
   - Transaction:
     1. Set current version status = ACTIVE
     2. Set other versions status = ARCHIVED
     3. Validate: At least one step exists

---

#### API Endpoint Specification

**1. Create Flow Definition**

**Endpoint:** `POST /api/v1/{tenantId}/flows`

**Request:**
```json
{
  "name": "Employee Onboarding Flow",
  "description": "Complete onboarding process for new hires",
  "flowType": "ONBOARDING",
  "versionNotes": "Initial version"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "flowDefinition": {
      "id": "flow-uuid-123",
      "tenantId": "acme-uuid",
      "name": "Employee Onboarding Flow",
      "flowType": "ONBOARDING",
      "isActive": false
    },
    "flowVersion": {
      "id": "version-uuid-456",
      "flowDefinitionId": "flow-uuid-123",
      "versionNumber": 1,
      "status": "DRAFT",
      "createdBy": "user-uuid-789"
    }
  }
}
```

---

**2. Update Flow Steps (Bulk)**

**Endpoint:** `PUT /api/v1/{tenantId}/flows/{flowId}/versions/{versionId}/steps`

**Request:**
```json
{
  "steps": [
    {
      "stepOrder": 1,
      "stepType": "FORM",
      "title": "Basic Information",
      "description": "Enter your personal details",
      "formSchemaId": "schema-uuid-001",
      "isMandatory": true
    },
    {
      "stepOrder": 2,
      "stepType": "FORM",
      "title": "Job Details",
      "description": "Enter your job information",
      "formSchemaId": "schema-uuid-002",
      "isMandatory": true
    },
    {
      "stepOrder": 3,
      "stepType": "APPROVAL",
      "title": "Manager Approval",
      "description": "Manager reviews and approves new hire",
      "configJson": {
        "approvalType": "SINGLE",
        "approverField": "step2.reportingManager",
        "onRejection": "END_FLOW"
      },
      "isMandatory": true
    },
    {
      "stepOrder": 4,
      "stepType": "APPROVAL",
      "title": "HR Final Approval",
      "description": "HR Admin final review",
      "configJson": {
        "approvalType": "ROLE_BASED",
        "approverRole": "Admin",
        "onRejection": "END_FLOW"
      },
      "isMandatory": true
    },
    {
      "stepOrder": 5,
      "stepType": "AUTOMATION",
      "title": "Send Welcome Email",
      "description": "Automated welcome email to new employee",
      "configJson": {
        "actionType": "EMAIL",
        "emailTemplate": "WELCOME_EMPLOYEE",
        "recipientField": "step1.email"
      },
      "isMandatory": false
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Flow steps updated successfully",
  "data": {
    "flowVersionId": "version-uuid-456",
    "stepsCount": 5,
    "steps": [
      {
        "id": "step-uuid-001",
        "stepOrder": 1,
        "stepType": "FORM",
        "title": "Basic Information"
      }
      // ... other steps
    ]
  }
}
```

---

**3. Create Form Schema**

**Endpoint:** `POST /api/v1/{tenantId}/form-schemas`

**Request:**
```json
{
  "name": "Onboarding - Basic Info",
  "description": "Basic personal information for new hire",
  "schema": {
    "fields": [
      {
        "id": "firstName",
        "label": "First Name",
        "type": "TEXT",
        "required": true,
        "validation": {
          "minLength": 2,
          "maxLength": 50
        }
      },
      {
        "id": "lastName",
        "label": "Last Name",
        "type": "TEXT",
        "required": true
      },
      {
        "id": "email",
        "label": "Email",
        "type": "EMAIL",
        "required": true,
        "validation": {
          "pattern": "email"
        }
      },
      {
        "id": "phone",
        "label": "Phone",
        "type": "TEXT",
        "required": true,
        "validation": {
          "pattern": "^\\(\\d{3}\\) \\d{3}-\\d{4}$"
        },
        "placeholder": "(555) 555-5555"
      },
      {
        "id": "dateOfBirth",
        "label": "Date of Birth",
        "type": "DATE",
        "required": true,
        "validation": {
          "minAge": 18
        }
      }
    ]
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "schema-uuid-001",
    "tenantId": "acme-uuid",
    "name": "Onboarding - Basic Info",
    "schema": {
      "fields": [ /* ... */ ]
    },
    "createdAt": "2025-11-13T12:00:00Z"
  }
}
```

---

**4. Publish Flow Version**

**Endpoint:** `POST /api/v1/{tenantId}/flows/{flowId}/versions/{versionId}/publish`

**Request:**
```json
{
  "confirmArchivePrevious": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Flow version published successfully",
  "data": {
    "flowVersionId": "version-uuid-456",
    "versionNumber": 1,
    "status": "ACTIVE",
    "archivedVersions": ["version-uuid-000"], // Previous ACTIVE version
    "publishedAt": "2025-11-13T12:30:00Z"
  }
}
```

**Backend Logic:**
```typescript
async publishFlowVersion(tenantId: string, flowId: string, versionId: string) {
  return await this.db.transaction(async (trx) => {
    // 1. Validate version belongs to flow and tenant
    const version = await trx('flow_versions')
      .where({ id: versionId, flow_definition_id: flowId })
      .first();

    if (!version) throw new NotFoundException();

    // 2. Validate flow has at least one step
    const stepsCount = await trx('flow_step_definitions')
      .where({ flow_version_id: versionId })
      .count();

    if (stepsCount === 0) {
      throw new BadRequestException('Cannot publish flow without steps');
    }

    // 3. Archive all current ACTIVE versions
    await trx('flow_versions')
      .where({ flow_definition_id: flowId, status: 'ACTIVE' })
      .update({ status: 'ARCHIVED', archived_at: new Date() });

    // 4. Activate this version
    await trx('flow_versions')
      .where({ id: versionId })
      .update({ status: 'ACTIVE', published_at: new Date() });

    // 5. Mark flow definition as active
    await trx('flow_definitions')
      .where({ id: flowId })
      .update({ is_active: true });

    return version;
  });
}
```

---

#### Acceptance Criteria (Detailed)

- [ ] **AC1:** HR Admin can navigate to Configuration > Flows
- [ ] **AC2:** "Create New Flow" button visible
- [ ] **AC3:** Flow type selection shows all types (ONBOARDING, LEAVE_APPROVAL, etc.)
- [ ] **AC4:** Can enter flow name and description
- [ ] **AC5:** Flow designer loads with empty canvas
- [ ] **AC6:** Left panel shows all step types (FORM, APPROVAL, AUTOMATION, etc.)
- [ ] **AC7:** Can drag step types to canvas
- [ ] **AC8:** Steps appear in order on canvas
- [ ] **AC9:** Can click step to configure in right panel
- [ ] **AC10:** FORM step shows "Select Schema" OR "Create New Schema"
- [ ] **AC11:** Form Schema Designer allows adding fields
- [ ] **AC12:** Fields can be reordered (up/down arrows)
- [ ] **AC13:** Fields can be deleted
- [ ] **AC14:** Each field has type, required, validation options
- [ ] **AC15:** Dropdown fields can specify source (departments, employees, etc.)
- [ ] **AC16:** Can save form schema
- [ ] **AC17:** Saved schema appears in schema selection dropdown
- [ ] **AC18:** APPROVAL step requires approver specification
- [ ] **AC19:** Can select "Single Approver", "Multi-level", or "Role-based"
- [ ] **AC20:** Can reference field from previous step (e.g., reporting manager)
- [ ] **AC21:** AUTOMATION step shows action types
- [ ] **AC22:** Email automation allows template selection
- [ ] **AC23:** Email recipient can be field reference
- [ ] **AC24:** Can save individual steps
- [ ] **AC25:** "Save Draft" saves entire flow with status DRAFT
- [ ] **AC26:** "Preview" shows step-by-step walkthrough
- [ ] **AC27:** "Publish" button disabled if flow invalid
- [ ] **AC28:** Publish shows confirmation modal
- [ ] **AC29:** Publishing sets status to ACTIVE
- [ ] **AC30:** Previous ACTIVE version moved to ARCHIVED
- [ ] **AC31:** Success notification shown
- [ ] **AC32:** Published flow appears in flow list as Active
- [ ] **AC33:** All operations scoped to tenant (no cross-tenant data)
- [ ] **AC34:** Flow version number auto-increments
- [ ] **AC35:** Can edit DRAFT version
- [ ] **AC36:** Cannot edit ACTIVE version (must create new version)
- [ ] **AC37:** Visual canvas shows flow from START to END
- [ ] **AC38:** Steps connected with arrows/lines
- [ ] **AC39:** Step icons differentiate types (form, approval, etc.)
- [ ] **AC40:** Can delete steps from canvas

---

## Continue with More Stories?

This document is getting quite long! I've created **3 extremely detailed user stories** with:
- ✅ Complete step-by-step scenarios
- ✅ UI mockup descriptions
- ✅ Error scenarios
- ✅ Edge cases
- ✅ Technical implementation notes
- ✅ API specifications
- ✅ Database changes
- ✅ Detailed acceptance criteria
- ✅ Testing checklist

**Would you like me to continue with:**
4. Admin Stories - Employee Management
5. User Stories - Onboarding Flow Execution
6. User Stories - Leave Management
7. Manager Stories - Approvals

**OR** would you like me to:
- Create additional supporting documents (e.g., Testing Strategy, Deployment Guide)?
- Focus on a specific area in more detail?
- Create visual diagrams/charts?

Let me know how you'd like to proceed!
