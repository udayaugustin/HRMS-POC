# WisRight HRMS - POC Developer Task Breakdown

## Task Categories
- Backend API Development
- Frontend Admin Portal
- Frontend User Portal
- Integration & Testing
- Documentation

**Estimation Unit:** Story Points (1 point = ~4 hours)

---

## Backend Tasks

### Module 1: Authentication & Authorization (8 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| BE-001 | Setup NestJS project structure | 0.5 | Must | None |
| BE-002 | Configure TypeORM with PostgreSQL | 1 | Must | BE-001 |
| BE-003 | Create User entity and repository | 1 | Must | BE-002 |
| BE-004 | Implement JWT authentication strategy | 2 | Must | BE-003 |
| BE-005 | Create login endpoint | 1 | Must | BE-004 |
| BE-006 | Create JWT auth guard | 1 | Must | BE-004 |
| BE-007 | Implement password hashing with bcrypt | 0.5 | Must | BE-003 |
| BE-008 | Create get current user endpoint | 1 | Must | BE-006 |

**Total: 8 points (32 hours)**

---

### Module 2: Tenant Management (4 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| BE-011 | Create Tenant entity and repository | 1 | Must | BE-002 |
| BE-012 | Create tenant middleware for isolation | 1.5 | Must | BE-011 |
| BE-013 | Add tenant_id to all queries globally | 1 | Must | BE-012 |
| BE-014 | Create tenant CRUD endpoints | 0.5 | Must | BE-011 |

**Total: 4 points (16 hours)**

---

### Module 3: RBAC (6 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| BE-021 | Create Role entity | 0.5 | Must | BE-002 |
| BE-022 | Create RolePermission entity | 0.5 | Must | BE-021 |
| BE-023 | Create UserRole entity | 0.5 | Must | BE-021 |
| BE-024 | Create role CRUD endpoints | 1 | Must | BE-021 |
| BE-025 | Create permission guard | 2 | Must | BE-024 |
| BE-026 | Create permission decorator | 0.5 | Must | BE-025 |
| BE-027 | Seed default roles and permissions | 1 | Must | BE-024 |

**Total: 6 points (24 hours)**

---

### Module 4: Master Data (6 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| BE-031 | Create Department entity and CRUD | 2 | Must | BE-012 |
| BE-032 | Create Designation entity and CRUD | 2 | Must | BE-012 |
| BE-033 | Create Location entity and CRUD | 2 | Must | BE-012 |

**Total: 6 points (24 hours)**

---

### Module 5: Employee Management (8 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| BE-041 | Create Employee entity | 1 | Must | BE-031,32,33 |
| BE-042 | Create employee list endpoint with pagination | 2 | Must | BE-041 |
| BE-043 | Create employee details endpoint | 1 | Must | BE-041 |
| BE-044 | Create add employee endpoint | 2 | Must | BE-041 |
| BE-045 | Create update employee endpoint | 1 | Must | BE-041 |
| BE-046 | Create deactivate employee endpoint | 0.5 | Must | BE-041 |
| BE-047 | Add search and filter logic | 0.5 | Must | BE-042 |

**Total: 8 points (32 hours)**

---

### Module 6: Flow Engine (15 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| BE-051 | Create FlowDefinition entity and CRUD | 2 | Must | BE-012 |
| BE-052 | Create FlowVersion entity and CRUD | 2 | Must | BE-051 |
| BE-053 | Create FlowStepDefinition entity and CRUD | 3 | Must | BE-052 |
| BE-054 | Create FlowInstance entity | 1 | Must | BE-053 |
| BE-055 | Create FlowStepInstance entity | 1 | Must | BE-054 |
| BE-056 | Implement start flow instance logic | 2 | Must | BE-054 |
| BE-057 | Implement submit step logic | 2 | Must | BE-056 |
| BE-058 | Implement get active flow version logic | 1 | Must | BE-052 |
| BE-059 | Implement flow completion logic | 1 | Must | BE-057 |

**Total: 15 points (60 hours)**

---

### Module 7: Form Schema Engine (8 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| BE-061 | Create FormSchema entity and CRUD | 2 | Must | BE-012 |
| BE-062 | Create form validation service | 3 | Must | BE-061 |
| BE-063 | Integrate form schema with flow steps | 2 | Must | BE-053,61 |
| BE-064 | Create form schema validation endpoint | 1 | Must | BE-062 |

**Total: 8 points (32 hours)**

---

### Module 8: Policy Engine (8 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| BE-071 | Create PolicyDefinition entity and CRUD | 2 | Must | BE-012 |
| BE-072 | Create policy engine service | 3 | Must | BE-071 |
| BE-073 | Implement leave balance calculation logic | 2 | Must | BE-072 |
| BE-074 | Implement balance deduction on approval | 1 | Must | BE-073 |

**Total: 8 points (32 hours)**

---

### Module 9: Leave Management (10 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| BE-081 | Create LeaveType entity and CRUD | 1 | Must | BE-012 |
| BE-082 | Create LeaveBalance entity and logic | 2 | Must | BE-081 |
| BE-083 | Create LeaveRequest entity | 1 | Must | BE-081 |
| BE-084 | Create get leave balance endpoint | 1 | Must | BE-082 |
| BE-085 | Create apply leave endpoint | 2 | Must | BE-083,056 |
| BE-086 | Integrate leave with flow engine | 2 | Must | BE-085 |
| BE-087 | Create leave history endpoint | 1 | Must | BE-083 |

**Total: 10 points (40 hours)**

---

### Module 10: Approvals (8 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| BE-091 | Create Approval entity | 1 | Must | BE-055 |
| BE-092 | Create get pending approvals endpoint | 2 | Must | BE-091 |
| BE-093 | Create approve endpoint | 2 | Must | BE-091 |
| BE-094 | Create reject endpoint | 2 | Must | BE-091 |
| BE-095 | Implement approval workflow logic | 1 | Must | BE-093,94 |

**Total: 8 points (32 hours)**

---

### Module 11: Notifications (5 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| BE-101 | Create Notification entity and CRUD | 1 | Must | BE-012 |
| BE-102 | Create notification service | 2 | Should | BE-101 |
| BE-103 | Integrate notifications with approvals | 1 | Should | BE-095,102 |
| BE-104 | Create mark as read endpoint | 1 | Should | BE-101 |

**Total: 5 points (20 hours)**

---

### Module 12: Dashboard (4 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| BE-111 | Create admin dashboard metrics endpoint | 2 | Must | All modules |
| BE-112 | Create employee dashboard endpoint | 2 | Must | All modules |

**Total: 4 points (16 hours)**

---

### Module 13: Database & Seeds (5 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| BE-121 | Create all database migrations | 2 | Must | All entities |
| BE-122 | Create seed script for tenants | 0.5 | Must | BE-011 |
| BE-123 | Create seed script for users and roles | 1 | Must | BE-003,021 |
| BE-124 | Create seed script for master data | 0.5 | Must | BE-031,32,33 |
| BE-125 | Create seed script for demo flows | 1 | Must | BE-051,061,071 |

**Total: 5 points (20 hours)**

---

## Backend Summary
**Total Backend Story Points: 95**  
**Total Backend Hours: 380 hours**  
**With 2 Backend Developers: ~190 hours each (~5 weeks)**

---

## Frontend Tasks

### Module 1: Project Setup & Auth (6 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| FE-001 | Setup React + Vite + TypeScript project | 0.5 | Must | None |
| FE-002 | Configure React Router | 1 | Must | FE-001 |
| FE-003 | Setup Material-UI theme | 1 | Must | FE-001 |
| FE-004 | Configure Axios with interceptors | 1 | Must | FE-001 |
| FE-005 | Create auth context and hooks | 1 | Must | FE-004 |
| FE-006 | Create login page | 1 | Must | FE-005 |
| FE-007 | Create protected route component | 0.5 | Must | FE-005 |

**Total: 6 points (24 hours)**

---

### Module 2: Common Components (8 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| FE-011 | Create DataTable component | 2 | Must | FE-003 |
| FE-012 | Create Modal component | 1 | Must | FE-003 |
| FE-013 | Create Toast notification component | 1 | Must | FE-003 |
| FE-014 | Create Loader component | 0.5 | Must | FE-003 |
| FE-015 | Create EmptyState component | 0.5 | Must | FE-003 |
| FE-016 | Create Pagination component | 1 | Must | FE-011 |
| FE-017 | Create form input components | 2 | Must | FE-003 |

**Total: 8 points (32 hours)**

---

### Module 3: Layouts (4 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| FE-021 | Create AdminLayout with sidebar | 2 | Must | FE-003 |
| FE-022 | Create UserLayout with header nav | 1.5 | Must | FE-003 |
| FE-023 | Create Header component | 0.5 | Must | FE-021,22 |

**Total: 4 points (16 hours)**

---

### Module 4: Admin - Master Data (6 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| FE-031 | Create Department list and form | 2 | Must | FE-011,21 |
| FE-032 | Create Designation list and form | 2 | Must | FE-011,21 |
| FE-033 | Create Location list and form | 2 | Must | FE-011,21 |

**Total: 6 points (24 hours)**

---

### Module 5: Admin - Employee Management (8 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| FE-041 | Create employee list page with filters | 3 | Must | FE-011,31,32,33 |
| FE-042 | Create add employee form | 3 | Must | FE-041 |
| FE-043 | Create edit employee form | 1 | Must | FE-042 |
| FE-044 | Create employee details page | 1 | Must | FE-041 |

**Total: 8 points (32 hours)**

---

### Module 6: Admin - Flow Configuration (12 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| FE-051 | Create flow definitions list page | 2 | Must | FE-011,21 |
| FE-052 | Create flow step configuration page | 4 | Must | FE-051 |
| FE-053 | Create add/edit step modal | 2 | Must | FE-052 |
| FE-054 | Create form schema list and editor | 3 | Must | FE-051 |
| FE-055 | Create policy configuration page | 1 | Must | FE-051 |

**Total: 12 points (48 hours)**

---

### Module 7: Dynamic Form Renderer (10 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| FE-061 | Create DynamicForm component | 3 | Must | FE-017 |
| FE-062 | Create field renderers (text, email, number) | 2 | Must | FE-061 |
| FE-063 | Create dropdown field with API data source | 2 | Must | FE-061 |
| FE-064 | Create date picker field | 1 | Must | FE-061 |
| FE-065 | Implement dynamic validation | 2 | Must | FE-061 |

**Total: 10 points (40 hours)**

---

### Module 8: User - Dashboard & Profile (5 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| FE-071 | Create employee dashboard | 3 | Must | FE-022 |
| FE-072 | Create my profile page | 2 | Must | FE-022 |

**Total: 5 points (20 hours)**

---

### Module 9: User - Leave Management (8 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| FE-081 | Create leave balance display | 1 | Must | FE-022 |
| FE-082 | Create apply leave modal | 3 | Must | FE-081 |
| FE-083 | Create leave history page | 2 | Must | FE-081 |
| FE-084 | Integrate leave with flow execution | 2 | Must | FE-082,091 |

**Total: 8 points (32 hours)**

---

### Module 10: User - Flow Execution (10 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| FE-091 | Create flow stepper component | 3 | Must | FE-003 |
| FE-092 | Create flow execution page | 4 | Must | FE-091,061 |
| FE-093 | Create my workflows list page | 2 | Must | FE-022 |
| FE-094 | Integrate form submission with API | 1 | Must | FE-092 |

**Total: 10 points (40 hours)**

---

### Module 11: User - Approvals (8 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| FE-101 | Create pending approvals list | 3 | Must | FE-011,22 |
| FE-102 | Create approval details modal | 2 | Must | FE-101 |
| FE-103 | Implement approve/reject actions | 2 | Must | FE-102 |
| FE-104 | Show approval status in flow views | 1 | Must | FE-093 |

**Total: 8 points (32 hours)**

---

### Module 12: Admin - Dashboard (3 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| FE-111 | Create admin dashboard with metrics | 3 | Must | FE-021 |

**Total: 3 points (12 hours)**

---

### Module 13: Notifications (3 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| FE-121 | Create notification dropdown | 2 | Should | FE-023 |
| FE-122 | Create mark as read functionality | 1 | Should | FE-121 |

**Total: 3 points (12 hours)**

---

## Frontend Summary
**Total Frontend Story Points: 91**  
**Total Frontend Hours: 364 hours**  
**With 2 Frontend Developers: ~182 hours each (~4.5 weeks)**

---

## Integration & Testing Tasks (8 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| INT-001 | End-to-end test: Login to dashboard | 1 | Must | All |
| INT-002 | End-to-end test: Create employee | 1 | Must | All |
| INT-003 | End-to-end test: Configure flow | 1 | Must | All |
| INT-004 | End-to-end test: Onboarding flow | 2 | Must | All |
| INT-005 | End-to-end test: Leave approval flow | 2 | Must | All |
| INT-006 | Bug fixing and polish | 1 | Must | All |

**Total: 8 points (32 hours) - All team**

---

## Documentation Tasks (4 points)

| Task ID | Task Description | Effort | Priority | Dependencies |
|---------|------------------|--------|----------|--------------|
| DOC-001 | Write backend README with setup steps | 1 | Must | BE-121 |
| DOC-002 | Write frontend README with setup steps | 1 | Must | FE-001 |
| DOC-003 | Create Postman collection | 1 | Must | All BE |
| DOC-004 | Create demo walkthrough guide | 1 | Must | All |

**Total: 4 points (16 hours) - All team**

---

## Grand Total Summary

| Category | Story Points | Hours | Resources |
|----------|--------------|-------|-----------|
| Backend | 95 | 380 | 2 developers |
| Frontend | 91 | 364 | 2 developers |
| Integration | 8 | 32 | All team |
| Documentation | 4 | 16 | All team |
| **Total** | **198** | **792** | **3-4 developers** |

**Timeline:** 8 weeks with 3-4 developers working full-time

---

## Task Assignment Recommendation

### Backend Developer 1 (Lead)
- Authentication & Authorization (8 pts)
- Tenant Management (4 pts)
- Flow Engine (15 pts)
- Policy Engine (8 pts)
- Approvals (8 pts)
- Dashboard (4 pts)
- **Total: 47 points**

### Backend Developer 2
- RBAC (6 pts)
- Master Data (6 pts)
- Employee Management (8 pts)
- Form Schema Engine (8 pts)
- Leave Management (10 pts)
- Notifications (5 pts)
- Database & Seeds (5 pts)
- **Total: 48 points**

### Frontend Developer 1
- Project Setup & Auth (6 pts)
- Common Components (8 pts)
- Layouts (4 pts)
- Admin - Flow Configuration (12 pts)
- Dynamic Form Renderer (10 pts)
- User - Flow Execution (10 pts)
- **Total: 50 points**

### Frontend Developer 2
- Admin - Master Data (6 pts)
- Admin - Employee Management (8 pts)
- User - Dashboard & Profile (5 pts)
- User - Leave Management (8 pts)
- User - Approvals (8 pts)
- Admin - Dashboard (3 pts)
- Notifications (3 pts)
- **Total: 41 points**

**All Team:** Integration (8 pts) + Documentation (4 pts)

---

**Document Status:** Ready for Task Assignment  
**Next Document:** Demo Scenarios

