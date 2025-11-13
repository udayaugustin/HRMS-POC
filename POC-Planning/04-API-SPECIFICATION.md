# WisRight HRMS - POC API Specification

## Document Version: 1.0
**Date:** November 2025  
**Base URL:** `http://localhost:3000/api/v1`  
**Authentication:** JWT Bearer Token

---

## 1. API Design Principles

### 1.1 URL Structure
```
/api/v1/{tenantId}/{resource}
```

Example: `/api/v1/acme/employees`

### 1.2 Authentication
- All endpoints (except `/auth/*`) require JWT token
- Token passed in `Authorization: Bearer {token}` header
- Token contains: `{ user_id, tenant_id, email, roles }`
- Token expiry: 24 hours

### 1.3 Standard Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

### 1.4 HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### 1.5 Pagination
```
GET /resource?page=1&limit=20&sort=created_at&order=DESC
```

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## 2. Authentication APIs

### 2.1 User Login

**Endpoint:** `POST /auth/login`  
**Public:** Yes  
**Description:** Authenticate user and get JWT token

**Request:**
```json
{
  "email": "admin@acme.com",
  "password": "Admin@123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "admin@acme.com",
      "first_name": "Admin",
      "last_name": "User",
      "tenant_id": "tenant-uuid",
      "roles": ["HR_ADMIN"]
    }
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

---

### 2.2 Get Current User

**Endpoint:** `GET /auth/me`  
**Auth Required:** Yes  
**Description:** Get logged-in user details

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@acme.com",
    "first_name": "Admin",
    "last_name": "User",
    "tenant_id": "tenant-uuid",
    "roles": ["HR_ADMIN"],
    "permissions": ["EMPLOYEES.VIEW", "EMPLOYEES.CREATE", ...]
  }
}
```

---

### 2.3 Logout

**Endpoint:** `POST /auth/logout`  
**Auth Required:** Yes  
**Description:** Logout user (token invalidation on client side)

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 3. Employee Management APIs

### 3.1 List Employees

**Endpoint:** `GET /{tenantId}/employees`  
**Auth Required:** Yes  
**Permission:** `EMPLOYEES.VIEW`  
**Description:** Get paginated list of employees

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `search` (search by name/email)
- `department_id` (filter by department)
- `designation_id` (filter by designation)
- `status` (filter by employment_status)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employee_code": "EMP001",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@acme.com",
      "department": {
        "id": "dept-uuid",
        "name": "Engineering"
      },
      "designation": {
        "id": "desig-uuid",
        "title": "Software Engineer"
      },
      "location": {
        "id": "loc-uuid",
        "name": "Headquarters"
      },
      "manager": {
        "id": "mgr-uuid",
        "name": "Jane Smith"
      },
      "joining_date": "2024-01-15",
      "employment_status": "ACTIVE"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

### 3.2 Get Employee Details

**Endpoint:** `GET /{tenantId}/employees/{id}`  
**Auth Required:** Yes  
**Permission:** `EMPLOYEES.VIEW`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "employee_code": "EMP001",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@acme.com",
    "personal_email": "john@gmail.com",
    "phone": "1234567890",
    "date_of_birth": "1990-05-15",
    "gender": "Male",
    "address": "123 Main St, New York",
    "department": { ... },
    "designation": { ... },
    "location": { ... },
    "manager": { ... },
    "joining_date": "2024-01-15",
    "employment_status": "ACTIVE",
    "created_at": "2024-01-10T10:00:00Z"
  }
}
```

---

### 3.3 Create Employee

**Endpoint:** `POST /{tenantId}/employees`  
**Auth Required:** Yes  
**Permission:** `EMPLOYEES.CREATE`

**Request:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@acme.com",
  "employee_code": "EMP001",
  "department_id": "dept-uuid",
  "designation_id": "desig-uuid",
  "location_id": "loc-uuid",
  "manager_id": "mgr-uuid",
  "joining_date": "2024-01-15",
  "phone": "1234567890",
  "date_of_birth": "1990-05-15",
  "gender": "Male"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "employee_code": "EMP001",
    ...
  },
  "message": "Employee created successfully"
}
```

**Error (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Email already exists",
      "employee_code": "Employee code already exists"
    }
  }
}
```

---

### 3.4 Update Employee

**Endpoint:** `PATCH /{tenantId}/employees/{id}`  
**Auth Required:** Yes  
**Permission:** `EMPLOYEES.EDIT`

**Request:**
```json
{
  "department_id": "new-dept-uuid",
  "designation_id": "new-desig-uuid",
  "location_id": "new-loc-uuid",
  "manager_id": "new-mgr-uuid",
  "employment_status": "ACTIVE"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Employee updated successfully"
}
```

---

### 3.5 Deactivate Employee

**Endpoint:** `DELETE /{tenantId}/employees/{id}`  
**Auth Required:** Yes  
**Permission:** `EMPLOYEES.DELETE`

**Response (200):**
```json
{
  "success": true,
  "message": "Employee deactivated successfully"
}
```

---

## 4. Master Data APIs

### 4.1 Departments

#### List Departments
**Endpoint:** `GET /{tenantId}/departments`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Engineering",
      "code": "ENG",
      "manager": { "id": "uuid", "name": "John Doe" },
      "is_active": true
    }
  ]
}
```

#### Create Department
**Endpoint:** `POST /{tenantId}/departments`

**Request:**
```json
{
  "name": "Engineering",
  "code": "ENG",
  "parent_department_id": null,
  "manager_id": "uuid"
}
```

#### Update Department
**Endpoint:** `PATCH /{tenantId}/departments/{id}`

#### Delete Department
**Endpoint:** `DELETE /{tenantId}/departments/{id}`

---

### 4.2 Designations

#### List Designations
**Endpoint:** `GET /{tenantId}/designations`

#### Create Designation
**Endpoint:** `POST /{tenantId}/designations`

**Request:**
```json
{
  "title": "Software Engineer",
  "code": "SE",
  "level": 3,
  "description": "Junior software engineer role"
}
```

#### Update Designation
**Endpoint:** `PATCH /{tenantId}/designations/{id}`

#### Delete Designation
**Endpoint:** `DELETE /{tenantId}/designations/{id}`

---

### 4.3 Locations

#### List Locations
**Endpoint:** `GET /{tenantId}/locations`

#### Create Location
**Endpoint:** `POST /{tenantId}/locations`

**Request:**
```json
{
  "name": "Headquarters",
  "code": "HQ",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "USA"
}
```

#### Update Location
**Endpoint:** `PATCH /{tenantId}/locations/{id}`

#### Delete Location
**Endpoint:** `DELETE /{tenantId}/locations/{id}`

---

## 5. Flow Definition APIs (Admin)

### 5.1 List Flow Definitions

**Endpoint:** `GET /{tenantId}/flows`  
**Auth Required:** Yes  
**Permission:** `FLOWS.VIEW`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "flow_type": "ONBOARDING",
      "name": "Employee Onboarding",
      "description": "New employee onboarding process",
      "is_active": true,
      "active_version": {
        "id": "version-uuid",
        "version_number": 1,
        "status": "ACTIVE"
      },
      "total_versions": 1
    }
  ]
}
```

---

### 5.2 Create Flow Definition

**Endpoint:** `POST /{tenantId}/flows`  
**Auth Required:** Yes  
**Permission:** `FLOWS.CONFIGURE`

**Request:**
```json
{
  "flow_type": "ONBOARDING",
  "name": "Employee Onboarding",
  "description": "New employee onboarding process"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "flow_type": "ONBOARDING",
    "name": "Employee Onboarding",
    "default_version": {
      "id": "version-uuid",
      "version_number": 1,
      "status": "DRAFT"
    }
  },
  "message": "Flow created successfully"
}
```

---

### 5.3 Get Flow Definition Details

**Endpoint:** `GET /{tenantId}/flows/{flowId}`  
**Auth Required:** Yes  
**Permission:** `FLOWS.VIEW`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "flow_type": "ONBOARDING",
    "name": "Employee Onboarding",
    "description": "...",
    "is_active": true,
    "versions": [
      {
        "id": "v1-uuid",
        "version_number": 1,
        "status": "ACTIVE",
        "step_count": 4,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

## 6. Flow Version APIs

### 6.1 Get Flow Version Details

**Endpoint:** `GET /{tenantId}/flows/{flowId}/versions/{versionId}`  
**Auth Required:** Yes  
**Permission:** `FLOWS.VIEW`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "flow_definition_id": "flow-uuid",
    "version_number": 1,
    "status": "ACTIVE",
    "steps": [
      {
        "id": "step1-uuid",
        "step_order": 1,
        "step_type": "FORM",
        "title": "Basic Information",
        "description": "Enter employee basic details",
        "form_schema_id": "schema-uuid",
        "is_mandatory": true
      },
      {
        "id": "step2-uuid",
        "step_order": 2,
        "step_type": "APPROVAL",
        "title": "Manager Approval",
        "approval_role": "MANAGER",
        "is_mandatory": true
      }
    ]
  }
}
```

---

### 6.2 Get Active Flow Version

**Endpoint:** `GET /{tenantId}/flows/type/{flowType}/active-version`  
**Auth Required:** Yes  
**Description:** Get currently active version for a flow type

**Example:** `GET /acme/flows/type/ONBOARDING/active-version`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "flow_definition": { ... },
    "version": { ... },
    "steps": [ ... ]
  }
}
```

---

### 6.3 Create Flow Version

**Endpoint:** `POST /{tenantId}/flows/{flowId}/versions`  
**Auth Required:** Yes  
**Permission:** `FLOWS.CONFIGURE`

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "new-version-uuid",
    "version_number": 2,
    "status": "DRAFT"
  }
}
```

---

### 6.4 Publish Flow Version

**Endpoint:** `POST /{tenantId}/flows/{flowId}/versions/{versionId}/publish`  
**Auth Required:** Yes  
**Permission:** `FLOWS.CONFIGURE`

**Response (200):**
```json
{
  "success": true,
  "message": "Flow version published successfully"
}
```

---

## 7. Flow Step APIs

### 7.1 Add Step to Flow Version

**Endpoint:** `POST /{tenantId}/flow-versions/{versionId}/steps`  
**Auth Required:** Yes  
**Permission:** `FLOWS.CONFIGURE`

**Request (Form Step):**
```json
{
  "step_order": 1,
  "step_type": "FORM",
  "title": "Basic Information",
  "description": "Enter employee basic details",
  "form_schema_id": "schema-uuid",
  "is_mandatory": true
}
```

**Request (Approval Step):**
```json
{
  "step_order": 2,
  "step_type": "APPROVAL",
  "title": "Manager Approval",
  "approval_role": "MANAGER",
  "is_mandatory": true,
  "config": {
    "auto_approve": false,
    "notify_on_completion": true
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "step-uuid",
    "step_order": 1,
    ...
  }
}
```

---

### 7.2 Update Step

**Endpoint:** `PATCH /{tenantId}/flow-versions/{versionId}/steps/{stepId}`  
**Auth Required:** Yes  
**Permission:** `FLOWS.CONFIGURE`

**Request:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "step_order": 2
}
```

---

### 7.3 Delete Step

**Endpoint:** `DELETE /{tenantId}/flow-versions/{versionId}/steps/{stepId}`  
**Auth Required:** Yes  
**Permission:** `FLOWS.CONFIGURE`

---

### 7.4 Reorder Steps

**Endpoint:** `POST /{tenantId}/flow-versions/{versionId}/steps/reorder`  
**Auth Required:** Yes  
**Permission:** `FLOWS.CONFIGURE`

**Request:**
```json
{
  "step_orders": [
    { "step_id": "step1-uuid", "order": 1 },
    { "step_id": "step2-uuid", "order": 2 },
    { "step_id": "step3-uuid", "order": 3 }
  ]
}
```

---

## 8. Form Schema APIs

### 8.1 List Form Schemas

**Endpoint:** `GET /{tenantId}/form-schemas`  
**Auth Required:** Yes  
**Permission:** `FLOWS.VIEW`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Basic Information Form",
      "code": "BASIC_INFO",
      "is_active": true,
      "field_count": 5
    }
  ]
}
```

---

### 8.2 Get Form Schema

**Endpoint:** `GET /{tenantId}/form-schemas/{schemaId}`  
**Auth Required:** Yes  
**Permission:** `FLOWS.VIEW`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Basic Information Form",
    "code": "BASIC_INFO",
    "schema_json": {
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
        }
      ]
    },
    "validation_rules": { ... }
  }
}
```

---

### 8.3 Create Form Schema

**Endpoint:** `POST /{tenantId}/form-schemas`  
**Auth Required:** Yes  
**Permission:** `FLOWS.CONFIGURE`

**Request:**
```json
{
  "name": "Basic Information Form",
  "code": "BASIC_INFO",
  "schema_json": {
    "fields": [ ... ]
  },
  "validation_rules": { ... }
}
```

---

### 8.4 Update Form Schema

**Endpoint:** `PATCH /{tenantId}/form-schemas/{schemaId}`  
**Auth Required:** Yes  
**Permission:** `FLOWS.CONFIGURE`

---

## 9. Policy APIs

### 9.1 List Policies

**Endpoint:** `GET /{tenantId}/policies?type=LEAVE`  
**Auth Required:** Yes  
**Permission:** `FLOWS.VIEW`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "policy_type": "LEAVE",
      "name": "Casual Leave Policy",
      "code": "CL_POLICY",
      "is_active": true
    }
  ]
}
```

---

### 9.2 Get Policy

**Endpoint:** `GET /{tenantId}/policies/{policyId}`  
**Auth Required:** Yes  
**Permission:** `FLOWS.VIEW`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "policy_type": "LEAVE",
    "name": "Casual Leave Policy",
    "code": "CL_POLICY",
    "config_json": {
      "accrual": {
        "frequency": "MONTHLY",
        "amount": 1.5
      },
      "limits": {
        "max_balance": 30
      }
    },
    "is_active": true
  }
}
```

---

### 9.3 Create Policy

**Endpoint:** `POST /{tenantId}/policies`  
**Auth Required:** Yes  
**Permission:** `FLOWS.CONFIGURE`

**Request:**
```json
{
  "policy_type": "LEAVE",
  "name": "Casual Leave Policy",
  "code": "CL_POLICY",
  "config_json": { ... }
}
```

---

### 9.4 Update Policy

**Endpoint:** `PATCH /{tenantId}/policies/{policyId}`  
**Auth Required:** Yes  
**Permission:** `FLOWS.CONFIGURE`

---

## 10. Flow Instance APIs (User Execution)

### 10.1 Start Flow Instance

**Endpoint:** `POST /{tenantId}/flow-instances/start`  
**Auth Required:** Yes  
**Description:** Start a new flow execution

**Request:**
```json
{
  "flow_type": "ONBOARDING",
  "entity_id": "employee-uuid",
  "entity_type": "EMPLOYEE"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "flow_instance_id": "instance-uuid",
    "flow_type": "ONBOARDING",
    "status": "IN_PROGRESS",
    "current_step": {
      "step_instance_id": "step-instance-uuid",
      "step_order": 1,
      "step_type": "FORM",
      "title": "Basic Information",
      "form_schema": { ... }
    }
  }
}
```

---

### 10.2 Get Flow Instance

**Endpoint:** `GET /{tenantId}/flow-instances/{instanceId}`  
**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "instance-uuid",
    "flow_type": "ONBOARDING",
    "status": "IN_PROGRESS",
    "current_step_order": 2,
    "initiated_by": {
      "id": "user-uuid",
      "name": "John Doe"
    },
    "started_at": "2024-01-15T10:00:00Z",
    "steps": [
      {
        "step_instance_id": "step1-uuid",
        "step_order": 1,
        "step_type": "FORM",
        "title": "Basic Information",
        "status": "COMPLETED",
        "completed_at": "2024-01-15T10:15:00Z",
        "data": { ... }
      },
      {
        "step_instance_id": "step2-uuid",
        "step_order": 2,
        "step_type": "APPROVAL",
        "title": "Manager Approval",
        "status": "PENDING",
        "assigned_to": {
          "id": "manager-uuid",
          "name": "Jane Smith"
        }
      }
    ]
  }
}
```

---

### 10.3 Submit Step

**Endpoint:** `POST /{tenantId}/flow-instances/{instanceId}/steps/{stepId}/submit`  
**Auth Required:** Yes  
**Description:** Submit data for a form step

**Request:**
```json
{
  "data": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@acme.com",
    "phone": "1234567890",
    "date_of_birth": "1990-05-15"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "step_instance_id": "step-uuid",
    "status": "COMPLETED",
    "next_step": {
      "step_instance_id": "next-step-uuid",
      "step_order": 2,
      "step_type": "APPROVAL",
      "title": "Manager Approval"
    }
  },
  "message": "Step submitted successfully"
}
```

---

### 10.4 List My Flow Instances

**Endpoint:** `GET /{tenantId}/flow-instances/my-flows`  
**Auth Required:** Yes  
**Description:** Get all flow instances initiated by logged-in user

**Query Parameters:**
- `status` (IN_PROGRESS, COMPLETED, CANCELLED)
- `flow_type`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "instance-uuid",
      "flow_type": "ONBOARDING",
      "flow_name": "Employee Onboarding",
      "status": "IN_PROGRESS",
      "current_step": "Manager Approval",
      "started_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

## 11. Approval APIs

### 11.1 List Pending Approvals

**Endpoint:** `GET /{tenantId}/approvals/pending`  
**Auth Required:** Yes  
**Permission:** `APPROVALS.VIEW`  
**Description:** Get all pending approvals for logged-in user

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "approval_id": "approval-uuid",
      "flow_instance_id": "instance-uuid",
      "flow_type": "LEAVE_APPROVAL",
      "entity_type": "LEAVE_REQUEST",
      "entity_id": "leave-req-uuid",
      "requester": {
        "id": "emp-uuid",
        "name": "John Doe",
        "employee_code": "EMP001"
      },
      "step_title": "Manager Approval",
      "submitted_at": "2024-01-15T10:00:00Z",
      "data": {
        "leave_type": "Casual Leave",
        "from_date": "2024-01-20",
        "to_date": "2024-01-22",
        "number_of_days": 3,
        "reason": "Family function"
      }
    }
  ]
}
```

---

### 11.2 Get Approval Details

**Endpoint:** `GET /{tenantId}/approvals/{approvalId}`  
**Auth Required:** Yes  
**Permission:** `APPROVALS.VIEW`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "approval_id": "approval-uuid",
    "flow_instance": { ... },
    "step_details": { ... },
    "submitted_data": { ... },
    "requester_profile": { ... },
    "previous_approvals": [
      {
        "approver": "Manager Name",
        "status": "APPROVED",
        "comments": "Approved",
        "approved_at": "2024-01-15T11:00:00Z"
      }
    ]
  }
}
```

---

### 11.3 Approve

**Endpoint:** `POST /{tenantId}/approvals/{approvalId}/approve`  
**Auth Required:** Yes  
**Permission:** `APPROVALS.APPROVE`

**Request:**
```json
{
  "comments": "Approved. All details look good."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Approval submitted successfully",
  "data": {
    "flow_status": "IN_PROGRESS",
    "next_approver": {
      "id": "hr-uuid",
      "name": "HR Admin"
    }
  }
}
```

**Response (when flow completes):**
```json
{
  "success": true,
  "message": "Approval submitted successfully",
  "data": {
    "flow_status": "COMPLETED"
  }
}
```

---

### 11.4 Reject

**Endpoint:** `POST /{tenantId}/approvals/{approvalId}/reject`  
**Auth Required:** Yes  
**Permission:** `APPROVALS.APPROVE`

**Request:**
```json
{
  "comments": "Insufficient information provided"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Request rejected",
  "data": {
    "flow_status": "CANCELLED"
  }
}
```

---

## 12. Leave Management APIs

### 12.1 Get Leave Balance

**Endpoint:** `GET /{tenantId}/leave/balance`  
**Auth Required:** Yes  
**Permission:** `LEAVE.VIEW`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "leave_type_id": "cl-uuid",
      "leave_type_name": "Casual Leave",
      "leave_type_code": "CL",
      "year": 2025,
      "opening_balance": 0,
      "accrued": 18,
      "used": 3,
      "pending": 0,
      "available": 15
    },
    {
      "leave_type_id": "sl-uuid",
      "leave_type_name": "Sick Leave",
      "leave_type_code": "SL",
      "year": 2025,
      "opening_balance": 0,
      "accrued": 12,
      "used": 0,
      "pending": 0,
      "available": 12
    }
  ]
}
```

---

### 12.2 Apply Leave

**Endpoint:** `POST /{tenantId}/leave/apply`  
**Auth Required:** Yes  
**Permission:** `LEAVE.CREATE`  
**Description:** Apply for leave (starts leave approval flow)

**Request:**
```json
{
  "leave_type_id": "cl-uuid",
  "from_date": "2024-01-20",
  "to_date": "2024-01-22",
  "reason": "Family function"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "leave_request_id": "leave-req-uuid",
    "flow_instance_id": "flow-instance-uuid",
    "leave_type": "Casual Leave",
    "from_date": "2024-01-20",
    "to_date": "2024-01-22",
    "number_of_days": 3,
    "status": "PENDING",
    "current_approver": {
      "id": "manager-uuid",
      "name": "Jane Smith"
    }
  },
  "message": "Leave application submitted successfully"
}
```

**Error (400):**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient leave balance",
    "details": {
      "available": 2,
      "requested": 3
    }
  }
}
```

---

### 12.3 Get Leave History

**Endpoint:** `GET /{tenantId}/leave/history`  
**Auth Required:** Yes  
**Permission:** `LEAVE.VIEW`

**Query Parameters:**
- `status` (PENDING, APPROVED, REJECTED)
- `year` (2025)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "leave-req-uuid",
      "leave_type": "Casual Leave",
      "from_date": "2024-01-20",
      "to_date": "2024-01-22",
      "number_of_days": 3,
      "reason": "Family function",
      "status": "APPROVED",
      "applied_at": "2024-01-15T10:00:00Z",
      "approved_at": "2024-01-15T11:00:00Z",
      "approved_by": "Jane Smith"
    }
  ]
}
```

---

### 12.4 List Leave Types

**Endpoint:** `GET /{tenantId}/leave/types`  
**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cl-uuid",
      "name": "Casual Leave",
      "code": "CL",
      "is_paid": true
    },
    {
      "id": "sl-uuid",
      "name": "Sick Leave",
      "code": "SL",
      "is_paid": true
    }
  ]
}
```

---

## 13. Notification APIs

### 13.1 Get Notifications

**Endpoint:** `GET /{tenantId}/notifications`  
**Auth Required:** Yes

**Query Parameters:**
- `is_read` (true/false)
- `page`, `limit`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "notif-uuid",
      "title": "New Approval Request",
      "message": "John Doe has applied for leave",
      "notification_type": "APPROVAL_PENDING",
      "entity_type": "LEAVE_REQUEST",
      "entity_id": "leave-req-uuid",
      "is_read": false,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "unread_count": 5
}
```

---

### 13.2 Mark as Read

**Endpoint:** `POST /{tenantId}/notifications/{notifId}/read`  
**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### 13.3 Mark All as Read

**Endpoint:** `POST /{tenantId}/notifications/read-all`  
**Auth Required:** Yes

---

## 14. Dashboard APIs

### 14.1 Admin Dashboard

**Endpoint:** `GET /{tenantId}/dashboard/admin`  
**Auth Required:** Yes  
**Permission:** `DASHBOARD.VIEW`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "total_employees": 15,
      "active_employees": 14,
      "inactive_employees": 1,
      "total_flows": 2,
      "pending_approvals": 5,
      "active_flow_instances": 8
    },
    "recent_activities": [
      {
        "type": "EMPLOYEE_CREATED",
        "description": "John Doe was added",
        "timestamp": "2024-01-15T10:00:00Z"
      },
      {
        "type": "LEAVE_APPROVED",
        "description": "Jane Smith approved leave for John Doe",
        "timestamp": "2024-01-15T09:30:00Z"
      }
    ]
  }
}
```

---

### 14.2 Employee Dashboard

**Endpoint:** `GET /{tenantId}/dashboard/employee`  
**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "name": "John Doe",
      "employee_code": "EMP001",
      "department": "Engineering",
      "designation": "Software Engineer"
    },
    "leave_balance": [ ... ],
    "pending_tasks": [
      {
        "type": "FLOW_STEP",
        "title": "Complete Onboarding - Step 2",
        "flow_instance_id": "instance-uuid"
      }
    ],
    "recent_activities": [ ... ]
  }
}
```

---

## 15. Middleware & Error Handling

### 15.1 Authentication Middleware

**Checks:**
1. Authorization header present
2. Token format valid
3. Token signature valid
4. Token not expired
5. User exists and is active

**Error Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

---

### 15.2 Tenant Validation Middleware

**Checks:**
1. tenant_id from JWT matches {tenantId} in URL
2. Tenant exists and is active

**Error Response (403):**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied to this tenant"
  }
}
```

---

### 15.3 Permission Middleware

**Checks:**
1. User has required role
2. Role has required permission

**Error Response (403):**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "You don't have permission to perform this action",
    "details": {
      "required_permission": "EMPLOYEES.CREATE"
    }
  }
}
```

---

## 16. API Summary Table

| Category | Endpoints | Auth | Permission |
|----------|-----------|------|------------|
| Auth | 3 | Partial | - |
| Employees | 5 | Yes | EMPLOYEES.* |
| Departments | 4 | Yes | EMPLOYEES.* |
| Designations | 4 | Yes | EMPLOYEES.* |
| Locations | 4 | Yes | EMPLOYEES.* |
| Flow Definitions | 3 | Yes | FLOWS.* |
| Flow Versions | 4 | Yes | FLOWS.* |
| Flow Steps | 4 | Yes | FLOWS.CONFIGURE |
| Form Schemas | 4 | Yes | FLOWS.* |
| Policies | 4 | Yes | FLOWS.* |
| Flow Instances | 4 | Yes | - |
| Approvals | 4 | Yes | APPROVALS.* |
| Leave | 4 | Yes | LEAVE.* |
| Notifications | 3 | Yes | - |
| Dashboard | 2 | Yes | - |
| **Total** | **52** | | |

---

## 17. Testing Checklist

### 17.1 Postman Collection Structure
```
HRMS POC APIs
├── Auth
│   ├── Login
│   ├── Get Me
│   └── Logout
├── Employees
│   ├── List Employees
│   ├── Get Employee
│   ├── Create Employee
│   ├── Update Employee
│   └── Delete Employee
├── Master Data
│   ├── Departments (CRUD)
│   ├── Designations (CRUD)
│   └── Locations (CRUD)
├── Flows (Admin)
│   ├── Flow Definitions
│   ├── Flow Versions
│   ├── Flow Steps
│   ├── Form Schemas
│   └── Policies
├── Flows (User)
│   ├── Start Flow
│   ├── Get Flow Instance
│   ├── Submit Step
│   └── My Flows
├── Approvals
│   ├── Pending Approvals
│   ├── Get Approval
│   ├── Approve
│   └── Reject
├── Leave
│   ├── Balance
│   ├── Apply
│   ├── History
│   └── Types
├── Notifications
│   ├── Get Notifications
│   ├── Mark Read
│   └── Mark All Read
└── Dashboard
    ├── Admin Dashboard
    └── Employee Dashboard
```

### 17.2 Environment Variables
```
{{base_url}} = http://localhost:3000/api/v1
{{tenant_id}} = acme
{{admin_token}} = Bearer eyJ...
{{employee_token}} = Bearer eyJ...
{{manager_token}} = Bearer eyJ...
```

---

**Document Status:** Ready for Implementation  
**Next Document:** UI/UX Design Specification

