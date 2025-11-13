# WisRight HRMS - POC Requirements Specification

## Document Version: 1.0
**Date:** November 2025  
**Purpose:** Detailed user stories and acceptance criteria for POC development

---

## 1. Overview

This document contains detailed user stories organized by user role:
- Super Admin
- HR Admin
- Manager
- Employee

Each story includes:
- Story ID
- User role
- Story description
- Acceptance criteria
- Priority (Must Have / Should Have / Nice to Have)
- Story points estimate

---

## 2. Admin User Stories

### 2.1 Tenant Management

#### US-A-001: Create Tenant
**As a** Super Admin  
**I want to** create a new tenant organization  
**So that** new organizations can use the system

**Acceptance Criteria:**
- AC1: Can access "Create Tenant" form
- AC2: Can enter tenant name, subdomain, admin email
- AC3: System validates subdomain uniqueness
- AC4: System creates tenant record in database
- AC5: System creates default admin user for tenant
- AC6: System creates default roles (Admin, Manager, Employee)
- AC7: Success message shown after creation

**Priority:** Must Have  
**Story Points:** 5

---

### 2.2 Authentication & Authorization

#### US-A-002: User Login
**As a** User (any role)  
**I want to** log in to the system  
**So that** I can access my tenant's HRMS

**Acceptance Criteria:**
- AC1: Login page shows email and password fields
- AC2: System validates credentials against database
- AC3: System generates JWT token with user_id, tenant_id, roles
- AC4: Token stored in browser (localStorage or cookie)
- AC5: User redirected to dashboard after successful login
- AC6: Error message shown for invalid credentials
- AC7: Password is encrypted in database

**Priority:** Must Have  
**Story Points:** 3

#### US-A-003: User Logout
**As a** User (any role)  
**I want to** log out of the system  
**So that** my session is securely ended

**Acceptance Criteria:**
- AC1: Logout button visible in header
- AC2: Clicking logout clears JWT token
- AC3: User redirected to login page
- AC4: Cannot access protected pages after logout

**Priority:** Must Have  
**Story Points:** 1

#### US-A-004: Role-Based Access Control
**As a** System  
**I want to** enforce role-based permissions  
**So that** users can only access authorized features

**Acceptance Criteria:**
- AC1: Admin users can access admin portal
- AC2: Employees cannot access admin portal
- AC3: Managers can access approval pages
- AC4: API endpoints check permissions before processing
- AC5: Unauthorized access returns 403 error
- AC6: Frontend hides unauthorized menu items

**Priority:** Must Have  
**Story Points:** 5

---

### 2.3 Employee Management

#### US-A-005: Add Employee
**As an** HR Admin  
**I want to** add a new employee to the system  
**So that** they can access the HRMS

**Acceptance Criteria:**
- AC1: Can access "Add Employee" form
- AC2: Form includes: first name, last name, email, department, designation, location, joining date, manager
- AC3: Email must be unique per tenant
- AC4: System validates all required fields
- AC5: System creates employee record
- AC6: System creates user account with temporary password
- AC7: Employee appears in employee list
- AC8: Success notification shown

**Priority:** Must Have  
**Story Points:** 5

#### US-A-006: View Employee List
**As an** HR Admin  
**I want to** view all employees in my organization  
**So that** I can manage the employee database

**Acceptance Criteria:**
- AC1: Employee list page shows table with: name, email, department, designation, status
- AC2: List is filtered by tenant_id
- AC3: Can search employees by name or email
- AC4: Can filter by department, designation, status
- AC5: Pagination implemented (20 per page)
- AC6: Can click employee to view details

**Priority:** Must Have  
**Story Points:** 3

#### US-A-007: Edit Employee
**As an** HR Admin  
**I want to** edit employee information  
**So that** I can keep records up to date

**Acceptance Criteria:**
- AC1: Can access "Edit Employee" form from employee list
- AC2: Form pre-filled with existing data
- AC3: Can update: department, designation, location, manager, status
- AC4: Cannot change email (or shows warning if changed)
- AC5: System validates changes
- AC6: Changes saved to database
- AC7: Success notification shown

**Priority:** Must Have  
**Story Points:** 3

#### US-A-008: Deactivate Employee
**As an** HR Admin  
**I want to** deactivate an employee  
**So that** they can no longer access the system

**Acceptance Criteria:**
- AC1: Can click "Deactivate" button on employee record
- AC2: Confirmation dialog appears
- AC3: Employee status changed to "Inactive"
- AC4: Deactivated employee cannot log in
- AC5: Deactivated employee still visible in records (soft delete)

**Priority:** Must Have  
**Story Points:** 2

---

### 2.4 Master Data Management

#### US-A-009: Manage Departments
**As an** HR Admin  
**I want to** manage department master data  
**So that** I can organize employees by department

**Acceptance Criteria:**
- AC1: Can view list of departments
- AC2: Can add new department (name, code, parent department, manager)
- AC3: Can edit department details
- AC4: Can deactivate department (if no active employees)
- AC5: Departments are tenant-specific
- AC6: CRUD operations work correctly

**Priority:** Must Have  
**Story Points:** 3

#### US-A-010: Manage Designations
**As an** HR Admin  
**I want to** manage designation master data  
**So that** I can assign job titles to employees

**Acceptance Criteria:**
- AC1: Can view list of designations
- AC2: Can add new designation (title, level, description)
- AC3: Can edit designation details
- AC4: Can deactivate designation
- AC5: Designations are tenant-specific
- AC6: CRUD operations work correctly

**Priority:** Must Have  
**Story Points:** 3

#### US-A-011: Manage Locations
**As an** HR Admin  
**I want to** manage location master data  
**So that** I can track employee work locations

**Acceptance Criteria:**
- AC1: Can view list of locations
- AC2: Can add new location (name, address, city, state, country)
- AC3: Can edit location details
- AC4: Can deactivate location
- AC5: Locations are tenant-specific
- AC6: CRUD operations work correctly

**Priority:** Must Have  
**Story Points:** 3

---

### 2.5 Flow Configuration

#### US-A-012: Create Flow Definition
**As an** HR Admin  
**I want to** create a new flow definition  
**So that** I can configure workflows for my organization

**Acceptance Criteria:**
- AC1: Can access "Create Flow" page
- AC2: Can select flow type (Onboarding, Leave Approval)
- AC3: Can enter flow name and description
- AC4: System creates flow_definition record
- AC5: System creates default version 1 (draft)
- AC6: Flow appears in flow list
- AC7: Success notification shown

**Priority:** Must Have  
**Story Points:** 3

#### US-A-013: Add Steps to Flow
**As an** HR Admin  
**I want to** add steps to a flow version  
**So that** I can define the workflow sequence

**Acceptance Criteria:**
- AC1: Can access "Configure Steps" page for a flow version
- AC2: Can add new step with: order, type (Form/Approval/Automation), title
- AC3: For Form steps: can select or create form schema
- AC4: For Approval steps: can select approver role
- AC5: Can reorder steps (drag-drop or up/down buttons)
- AC6: Can edit step details
- AC7: Can delete step
- AC8: Steps saved to flow_step_definitions table

**Priority:** Must Have  
**Story Points:** 8

#### US-A-014: Configure Form Schema
**As an** HR Admin  
**I want to** create and edit form schemas  
**So that** I can define what data to collect in forms

**Acceptance Criteria:**
- AC1: Can access "Form Schema Editor"
- AC2: Can add fields with: id, label, type, required flag
- AC3: Supported field types: text, email, number, date, dropdown, textarea, checkbox
- AC4: For dropdown: can define options or link to master data
- AC5: Can add validation rules (min/max, regex)
- AC6: Can preview form rendering
- AC7: Schema saved as JSON in form_schema_definitions table
- AC8: Can reuse schemas across flows

**Priority:** Must Have  
**Story Points:** 8

#### US-A-015: Publish Flow Version
**As an** HR Admin  
**I want to** publish a flow version  
**So that** it becomes active for users

**Acceptance Criteria:**
- AC1: Can click "Publish" button on draft flow version
- AC2: System validates flow has at least one step
- AC3: System validates all form schemas are complete
- AC4: Previous active version changed to "Archived"
- AC5: New version status changed to "Active"
- AC6: Users can now start this flow
- AC7: Success notification shown

**Priority:** Must Have  
**Story Points:** 3

---

### 2.6 Policy Configuration

#### US-A-016: Configure Leave Policy
**As an** HR Admin  
**I want to** configure leave policies  
**So that** I can define leave accrual rules

**Acceptance Criteria:**
- AC1: Can access "Leave Policies" page
- AC2: Can create policy with: name, leave type, accrual frequency
- AC3: Can set accrual amount (e.g., 1.5 days per month)
- AC4: Can set max balance limit
- AC5: Can set carry-forward rules
- AC6: Policy saved as JSON in policy_definitions table
- AC7: Policy is tenant-specific
- AC8: Can activate/deactivate policy

**Priority:** Must Have  
**Story Points:** 5

#### US-A-017: Assign Leave Balance
**As an** HR Admin  
**I want to** assign initial leave balance to employees  
**So that** they can start applying for leave

**Acceptance Criteria:**
- AC1: Can view employee leave balances
- AC2: Can manually adjust balance (add/deduct)
- AC3: Can set balance for multiple leave types
- AC4: Balance changes are logged
- AC5: Employees can see updated balance

**Priority:** Must Have  
**Story Points:** 3

---

### 2.7 Admin Dashboard

#### US-A-018: View Admin Dashboard
**As an** HR Admin  
**I want to** view a dashboard with key metrics  
**So that** I can monitor system usage

**Acceptance Criteria:**
- AC1: Dashboard shows: Total Employees count
- AC2: Dashboard shows: Active Flows count
- AC3: Dashboard shows: Pending Approvals count
- AC4: Dashboard shows: Recent Activities list (last 10)
- AC5: All metrics are tenant-specific
- AC6: Can click metrics to drill down

**Priority:** Should Have  
**Story Points:** 3

---

## 3. Employee User Stories

### 3.1 Profile & Dashboard

#### US-E-001: View My Profile
**As an** Employee  
**I want to** view my profile information  
**So that** I can verify my details

**Acceptance Criteria:**
- AC1: Can access "My Profile" page
- AC2: Shows: name, email, employee code, department, designation, location, manager, joining date
- AC3: Shows employment status
- AC4: All information is read-only (cannot edit in POC)
- AC5: Only shows data for logged-in user

**Priority:** Must Have  
**Story Points:** 2

#### US-E-002: View Dashboard
**As an** Employee  
**I want to** view my dashboard  
**So that** I can see important information at a glance

**Acceptance Criteria:**
- AC1: Dashboard shows welcome message with name
- AC2: Shows "My Tasks" widget with pending items
- AC3: Shows "Leave Balance" widget
- AC4: Shows "Recent Activities" list
- AC5: All data is user-specific and tenant-specific

**Priority:** Must Have  
**Story Points:** 3

---

### 3.2 Leave Management

#### US-E-003: View Leave Balance
**As an** Employee  
**I want to** view my leave balances  
**So that** I know how much leave I have

**Acceptance Criteria:**
- AC1: Can access "Leave Balance" page or widget
- AC2: Shows balance for each leave type (Casual, Sick, Earned)
- AC3: Shows available, used, and pending balances
- AC4: Balance calculated by policy engine
- AC5: Updates in real-time after approvals

**Priority:** Must Have  
**Story Points:** 3

#### US-E-004: Apply for Leave
**As an** Employee  
**I want to** apply for leave  
**So that** I can take time off

**Acceptance Criteria:**
- AC1: Can access "Apply Leave" page
- AC2: Form shows: leave type, from date, to date, number of days, reason
- AC3: System calculates number of days automatically
- AC4: System checks if sufficient balance available
- AC5: Submitting form starts "Leave Approval" flow
- AC6: Flow instance created in database
- AC7: Employee sees "Pending Approval" status
- AC8: Manager receives notification

**Priority:** Must Have  
**Story Points:** 5

#### US-E-005: View Leave History
**As an** Employee  
**I want to** view my leave application history  
**So that** I can track my leave requests

**Acceptance Criteria:**
- AC1: Can access "Leave History" page
- AC2: Shows list of all leave applications
- AC3: Shows: dates, type, days, status, applied on
- AC4: Can filter by status (Pending, Approved, Rejected)
- AC5: Can view details of each application

**Priority:** Must Have  
**Story Points:** 2

---

### 3.3 Flow Execution

#### US-E-006: Start Onboarding Flow
**As a** New Employee  
**I want to** complete my onboarding  
**So that** I can provide all required information

**Acceptance Criteria:**
- AC1: Can access "Onboarding" from dashboard
- AC2: System fetches active onboarding flow version
- AC3: System fetches first step and form schema
- AC4: Form rendered dynamically from schema
- AC5: Can fill and submit form
- AC6: System validates form against schema
- AC7: Flow instance created on first submit
- AC8: Step instance marked as completed
- AC9: Can proceed to next step

**Priority:** Must Have  
**Story Points:** 8

#### US-E-007: Navigate Multi-Step Flow
**As an** Employee  
**I want to** navigate through flow steps  
**So that** I can complete the workflow

**Acceptance Criteria:**
- AC1: UI shows step progress indicator (e.g., Step 2 of 5)
- AC2: Can view previous step data (read-only)
- AC3: Current step form is editable
- AC4: Cannot skip steps
- AC5: "Next" button submits current step
- AC6: "Previous" button shows previous step (if allowed)
- AC7: Can save draft (optional for POC)

**Priority:** Must Have  
**Story Points:** 5

#### US-E-008: Submit Flow for Approval
**As an** Employee  
**I want to** submit my flow for approval  
**So that** my request can be reviewed

**Acceptance Criteria:**
- AC1: After completing all form steps, see "Submit for Approval" button
- AC2: Clicking submit creates approval step instance
- AC3: System identifies approver based on flow configuration
- AC4: Approver receives notification
- AC5: Employee sees "Pending Approval" status
- AC6: Employee cannot edit submitted data

**Priority:** Must Have  
**Story Points:** 5

#### US-E-009: View Flow Status
**As an** Employee  
**I want to** view the status of my flows  
**So that** I can track progress

**Acceptance Criteria:**
- AC1: Can access "My Workflows" page
- AC2: Shows list of all flow instances for user
- AC3: Shows: flow name, started date, status, current step
- AC4: Can click to view details
- AC5: Shows approval history if applicable

**Priority:** Must Have  
**Story Points:** 3

---

## 4. Manager User Stories

### 4.1 Approvals

#### US-M-001: View Pending Approvals
**As a** Manager  
**I want to** view all pending approvals  
**So that** I can review and approve requests

**Acceptance Criteria:**
- AC1: Can access "Pending Approvals" page
- AC2: Shows list of all approval tasks assigned to user
- AC3: Shows: employee name, flow type, request date, details
- AC4: Can filter by flow type
- AC5: Can search by employee name
- AC6: Shows count of pending approvals in dashboard

**Priority:** Must Have  
**Story Points:** 3

#### US-M-002: View Approval Details
**As a** Manager  
**I want to** view approval details  
**So that** I can make an informed decision

**Acceptance Criteria:**
- AC1: Can click on approval task to view details
- AC2: Shows all data submitted in flow steps
- AC3: For leave: shows leave dates, type, reason, balance
- AC4: For onboarding: shows employee information
- AC5: Shows employee profile summary
- AC6: Shows previous approvals (if multi-level)

**Priority:** Must Have  
**Story Points:** 3

#### US-M-003: Approve Request
**As a** Manager  
**I want to** approve a request  
**So that** the workflow can proceed

**Acceptance Criteria:**
- AC1: Can click "Approve" button
- AC2: Can add approval comments (optional)
- AC3: Confirmation dialog appears
- AC4: System updates step_instance status to "Approved"
- AC5: System checks if more approvals needed
- AC6: If no more approvals: flow instance marked as "Completed"
- AC7: If more approvals: next approver notified
- AC8: Employee notified of approval status
- AC9: For leave: policy engine deducts balance
- AC10: Success notification shown to manager

**Priority:** Must Have  
**Story Points:** 5

#### US-M-004: Reject Request
**As a** Manager  
**I want to** reject a request  
**So that** I can deny inappropriate requests

**Acceptance Criteria:**
- AC1: Can click "Reject" button
- AC2: Must add rejection reason (mandatory)
- AC3: Confirmation dialog appears
- AC4: System updates step_instance status to "Rejected"
- AC5: System marks flow_instance as "Cancelled"
- AC6: Employee notified of rejection with reason
- AC7: For leave: no balance deduction occurs
- AC8: Success notification shown to manager

**Priority:** Must Have  
**Story Points:** 3

---

## 5. System Stories (Non-User)

### 5.1 Multi-Tenancy

#### US-S-001: Tenant Isolation
**As a** System  
**I want to** ensure complete tenant data isolation  
**So that** tenants cannot see each other's data

**Acceptance Criteria:**
- AC1: Every database table (except tenants) has tenant_id column
- AC2: Every query includes tenant_id filter
- AC3: JWT token contains tenant_id
- AC4: Middleware validates tenant_id from token matches request
- AC5: Test: User from Tenant A cannot access Tenant B data
- AC6: Test: Direct API calls with wrong tenant_id return 403

**Priority:** Must Have (Critical)  
**Story Points:** 5

---

### 5.2 Notifications

#### US-S-002: In-App Notifications
**As a** System  
**I want to** send in-app notifications  
**So that** users are informed of important events

**Acceptance Criteria:**
- AC1: Notification table exists
- AC2: Notifications created for: approval pending, approval status, flow completion
- AC3: Users can view notifications in UI
- AC4: Unread count shown in header
- AC5: Can mark notification as read
- AC6: Notifications are tenant-specific and user-specific

**Priority:** Should Have  
**Story Points:** 5

#### US-S-003: Email Notifications (Optional)
**As a** System  
**I want to** send email notifications  
**So that** users are notified outside the system

**Acceptance Criteria:**
- AC1: Email service configured
- AC2: Welcome email sent on employee creation
- AC3: Approval request email sent to approver
- AC4: Approval status email sent to requester
- AC5: Emails use simple templates
- AC6: Can use mock email service for POC

**Priority:** Nice to Have  
**Story Points:** 5

---

## 6. Priority Summary

### Must Have (MVP - 44 stories)
- All authentication and authorization stories
- All employee management stories
- All master data management stories
- All flow configuration stories
- All leave policy stories
- All employee leave stories
- All manager approval stories
- All flow execution stories
- Tenant isolation story

### Should Have (7 stories)
- Admin dashboard
- In-app notifications

### Nice to Have (1 story)
- Email notifications

---

## 7. Story Point Estimation

**Total Story Points:** ~150 points

**Velocity Assumption:** 20 points per week (for 3 developers)

**Timeline:** ~8 weeks

---

## 8. Story Dependencies

### Phase 1: Foundation (Weeks 1-2)
- Tenant Management
- Authentication & Authorization
- Database setup
- Multi-tenancy middleware

### Phase 2: Admin Features (Weeks 3-4)
- Employee Management
- Master Data Management
- Admin Dashboard

### Phase 3: Flow Engine (Weeks 5-6)
- Flow Configuration
- Form Schema Configuration
- Policy Configuration
- Dynamic Form Rendering

### Phase 4: User Features (Weeks 7-8)
- Employee Dashboard
- Leave Management
- Flow Execution
- Approval Workflow

### Phase 5: Testing & Demo (Week 8)
- End-to-end testing
- Demo data setup
- Bug fixes
- Documentation

---

## 9. Acceptance Testing Checklist

### Pre-Demo Checklist
- [ ] Two tenants created with sample data
- [ ] Users can log in to both tenants
- [ ] Tenant isolation verified (cannot see other tenant's data)
- [ ] Master data populated (departments, designations, locations)
- [ ] Onboarding flow configured and published
- [ ] Leave approval flow configured and published
- [ ] Leave policies configured
- [ ] Leave balances assigned to employees
- [ ] All CRUD operations working
- [ ] RBAC enforced on all pages
- [ ] No critical bugs

### Onboarding Flow Test
- [ ] New employee can start onboarding
- [ ] Forms render correctly from schema
- [ ] Validation works
- [ ] Can navigate through steps
- [ ] Manager receives approval notification
- [ ] Manager can approve
- [ ] HR receives next approval
- [ ] HR can approve
- [ ] Flow completes successfully
- [ ] Employee data saved correctly

### Leave Approval Flow Test
- [ ] Employee can view leave balance
- [ ] Employee can apply leave
- [ ] Balance validation works
- [ ] Manager receives approval notification
- [ ] Manager can view leave details
- [ ] Manager can approve/reject
- [ ] Leave balance deducts on approval
- [ ] Employee notified of status
- [ ] Leave appears in history

### Configuration Flexibility Test
- [ ] Admin can add new step to flow
- [ ] Admin can modify form schema
- [ ] Admin can change approval role
- [ ] Changes reflect without code deployment
- [ ] Old flow instances not affected
- [ ] New flow instances use new configuration

---

## 10. Non-Functional Requirements Testing

### Performance
- [ ] Page load time < 2 seconds
- [ ] API response time < 500ms
- [ ] No N+1 query issues
- [ ] Proper database indexes in place

### Security
- [ ] Passwords encrypted with bcrypt
- [ ] JWT tokens expire correctly
- [ ] Unauthorized access returns 403
- [ ] SQL injection prevented (using ORM)
- [ ] XSS prevention implemented

### Usability
- [ ] Forms have validation messages
- [ ] Loading states shown during async operations
- [ ] Error messages are user-friendly
- [ ] Navigation is intuitive
- [ ] Responsive on desktop and tablet

---

## Appendix: User Story Template

```
#### US-XXX-000: Story Title
**As a** [Role]  
**I want to** [Action]  
**So that** [Benefit]

**Acceptance Criteria:**
- AC1: [Criteria]
- AC2: [Criteria]
- ...

**Priority:** Must Have / Should Have / Nice to Have  
**Story Points:** X
```

---

**Document Status:** Ready for Development  
**Next Document:** Database Schema Design

