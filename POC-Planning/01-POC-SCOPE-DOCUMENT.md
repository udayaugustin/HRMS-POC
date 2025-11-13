# WisRight HRMS - POC Scope Document

## Document Version: 1.0
**Date:** November 2025  
**Purpose:** Define the scope, boundaries, and technical approach for the WisRight HRMS Proof of Concept

---

## 1. Executive Summary

This POC demonstrates the **core architectural concepts** of the WisRight HRMS platform:
- Multi-tenant architecture with complete data isolation
- Configuration-driven Flow Engine for dynamic workflows
- Dynamic form rendering from JSON schemas
- Policy engine for business rules
- Admin portal for system configuration
- User portal for workflow execution
- Role-Based Access Control (RBAC)

**Duration:** 8 weeks  
**Team Size:** 3-4 developers (2 backend, 1-2 frontend)  
**Goal:** Validate architectural feasibility and demonstrate to stakeholders

---

## 2. Functional Scope - IN SCOPE

### 2.1 Core Features to Implement

#### A. Multi-Tenant Foundation
- **Tenant Management**
  - Create tenant (organization)
  - Tenant settings (name, subdomain, branding basics)
  - Tenant isolation at database level (tenant_id in all queries)
  
#### B. Authentication & Authorization
- **Auth System**
  - User registration and login
  - JWT-based authentication
  - Token includes: user_id, tenant_id, roles
  - Password encryption
  
- **RBAC (Role-Based Access Control)**
  - Predefined roles: Super Admin, HR Admin, Manager, Employee
  - Role-permission mapping
  - User-role assignment
  - Permission checks on API routes

#### C. Dynamic Flow Engine (Core Feature)
- **Flow Configuration (Admin)**
  - Create flow definition (Onboarding, Leave Approval)
  - Create flow version
  - Add steps to flow (Form, Approval, Automation)
  - Publish flow version
  - Set active version
  
- **Flow Execution (User)**
  - Start flow instance
  - Submit form steps
  - View flow progress
  - Complete flow
  
- **Approval Workflow**
  - Multi-step approval chain
  - Manager approval
  - HR approval (optional second level)
  - Approve/Reject actions
  - Approval notifications

#### D. Form Schema Engine
- **Dynamic Form Configuration**
  - JSON-based form schema definition
  - Field types: text, email, number, dropdown, date, textarea, checkbox
  - Field validation rules (required, min/max, regex)
  - Dropdown data sources (departments, designations, locations)
  
- **Dynamic Form Rendering**
  - Frontend reads JSON schema
  - Dynamically generates form UI
  - Client-side validation
  - Form submission to Flow Engine

#### E. Policy Engine (Basic)
- **Leave Policy Configuration**
  - Define leave types (Casual, Sick, Earned)
  - Configure accrual rules (monthly, yearly)
  - Set leave balance limits
  - Carry-forward rules
  
- **Leave Balance Calculation**
  - Policy engine computes balance
  - Deduct on leave approval
  - Display balance to users

#### F. Admin Portal Features
- **Dashboard**
  - Total employees count
  - Active flows count
  - Pending approvals count
  - Recent activity log
  
- **Employee Management**
  - Add employee manually
  - View employee list
  - Edit employee profile
  - Deactivate employee
  
- **Master Data Management**
  - Departments (CRUD)
  - Designations (CRUD)
  - Locations (CRUD)
  
- **Flow Configuration UI**
  - Visual flow builder (simplified)
  - Step configuration forms
  - Form schema editor (JSON or UI-based)
  - Policy configuration forms

#### G. User Portal Features
- **Dashboard**
  - Welcome widget
  - Pending tasks (approvals, forms)
  - Leave balance widget
  - Recent activities
  
- **My Profile**
  - View profile information
  - View job details
  
- **Leave Management**
  - View leave balance
  - Apply leave (starts Leave Approval flow)
  - View leave history
  - View leave status
  
- **Approvals (Manager Role)**
  - List pending approvals
  - View approval details
  - Approve/Reject with comments
  
- **Flow Execution**
  - Start onboarding flow
  - Fill multi-step forms
  - View flow progress
  - Submit for approval

#### H. Notifications (Basic)
- **In-App Notifications**
  - Approval pending notification
  - Approval status notification
  - Flow completion notification
  
- **Email Notifications (Optional)**
  - Welcome email on employee creation
  - Leave approval request email
  - Leave status email

---

## 3. Functional Scope - OUT OF SCOPE

### 3.1 Features NOT in POC

#### Advanced HRMS Modules
- Attendance management (clock in/out, GPS tracking, biometric)
- Attendance regularization flows
- Shift management
- Payroll processing
- Salary structures and components
- Tax calculations
- Reimbursements
- Loans and advances
- Performance management
- Appraisals and reviews
- Training management
- Asset management
- Document management system
- Advanced reporting and analytics
- Compliance reports

#### Advanced Flow Engine Features
- Conditional branching in flows
- Parallel approval paths
- Dynamic approver assignment based on rules
- Flow versioning with rollback
- Flow analytics and metrics
- Flow testing/simulation mode
- Bulk flow execution

#### Advanced Policy Engine Features
- Complex rule engine (if-then-else conditions)
- Multi-level policy inheritance
- Policy versioning and history
- Policy simulation/testing

#### Advanced UI/UX Features
- Mobile apps (iOS/Android)
- Offline mode
- Advanced charts and visualizations
- Drag-and-drop flow builder
- White-labeling and deep customization
- Multi-language support
- Dark mode

#### Integration & Advanced Features
- SSO/OAuth integration
- Third-party integrations (Slack, Teams, etc.)
- Webhook support
- API rate limiting and throttling
- Advanced audit logs
- Data export/import tools
- Advanced search with Elasticsearch
- Real-time updates with WebSockets
- File upload and storage (S3)
- Advanced email templating engine

#### DevOps & Production Features
- CI/CD pipeline
- Kubernetes deployment
- Auto-scaling
- Database sharding
- Load balancing
- Monitoring and alerting
- Log aggregation
- Backup and disaster recovery

---

## 4. Technical Scope

### 4.1 Technology Stack

#### Backend
- **Language:** Node.js (v18+)
- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL 14+
- **ORM:** TypeORM or Prisma
- **Cache:** Redis (optional for POC)
- **Authentication:** JWT (jsonwebtoken library)
- **Validation:** class-validator, class-transformer
- **API Docs:** Swagger/OpenAPI (optional)

**Justification:**
- NestJS provides excellent structure, DI, and scalability
- TypeScript ensures type safety
- PostgreSQL handles complex queries and JSONB for flexible schemas
- TypeORM/Prisma simplifies database operations

#### Frontend
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **UI Library:** Material-UI (MUI) or Ant Design
- **State Management:** React Context API + React Query
- **Routing:** React Router v6
- **Forms:** React Hook Form
- **HTTP Client:** Axios
- **Styling:** CSS Modules or Styled Components

**Justification:**
- React is industry-standard and has rich ecosystem
- MUI/Ant Design provides ready components
- React Query handles server state elegantly
- React Hook Form is performant for dynamic forms

#### Development Tools
- **Version Control:** Git + GitHub
- **Code Quality:** ESLint, Prettier
- **API Testing:** Postman or Thunder Client
- **Database Client:** DBeaver or pgAdmin
- **Environment:** Docker for PostgreSQL (optional)

### 4.2 Architecture Approach

#### Backend Architecture
- **Layered Architecture**
  - Controllers (API endpoints)
  - Services (business logic)
  - Repositories (data access)
  - DTOs (data transfer objects)
  - Guards (authentication/authorization)
  - Middleware (tenant validation)

#### Frontend Architecture
- **Component-Based Architecture**
  - Pages (route components)
  - Components (reusable UI)
  - Hooks (custom logic)
  - Services (API calls)
  - Contexts (global state)
  - Utils (helpers)

#### Database Design
- **Multi-Tenant Single Database**
  - Every table has `tenant_id` column
  - Composite indexes on (tenant_id, id)
  - Row-level security policies (optional)

#### API Design
- **RESTful APIs**
  - Pattern: `/api/v1/{tenantId}/resource`
  - JWT in Authorization header
  - Tenant validation middleware
  - Standard error responses

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
- **API Response Time:** < 500ms for 95% of requests
- **Page Load Time:** < 2 seconds for initial load
- **Database Queries:** Optimized with proper indexes
- **Concurrent Users:** Support 20-50 concurrent users (POC scale)

### 5.2 Security Requirements
- **Authentication:** JWT with 24-hour expiry
- **Password Security:** bcrypt hashing with salt
- **Tenant Isolation:** Strict tenant_id filtering in all queries
- **SQL Injection Prevention:** Use ORM parameterized queries
- **XSS Prevention:** Input sanitization and output encoding
- **CORS:** Configured for frontend domain only

### 5.3 Code Quality Requirements
- **Type Safety:** 100% TypeScript (no `any` types)
- **Code Coverage:** Not required for POC, but write testable code
- **Documentation:** API documentation via Swagger
- **Code Style:** ESLint + Prettier enforced
- **Git Practices:** Feature branches, meaningful commits

### 5.4 Usability Requirements
- **Responsive Design:** Desktop and tablet support (mobile optional)
- **Browser Support:** Latest Chrome, Firefox, Safari, Edge
- **Error Messages:** User-friendly error messages
- **Loading States:** Show spinners during async operations
- **Form Validation:** Real-time validation feedback

---

## 6. Data Requirements

### 6.1 Sample Data Needed

#### Master Data
- **Tenants:** 2 demo tenants
- **Departments:** 5-6 per tenant (Engineering, HR, Finance, Sales, Operations, Admin)
- **Designations:** 8-10 per tenant (Software Engineer, Senior Engineer, Manager, HR Manager, etc.)
- **Locations:** 3-4 per tenant (Head Office, Branch 1, Branch 2, Remote)

#### Users
- **Per Tenant:**
  - 1 Super Admin
  - 1 HR Admin
  - 2-3 Managers
  - 10-15 Employees

#### Flows
- **Onboarding Flow:**
  - Version 1 with 4-5 steps
  - Form steps: Basic Info, Job Details, Documents
  - Approval steps: Manager Approval, HR Approval
  
- **Leave Approval Flow:**
  - Version 1 with 3 steps
  - Form step: Leave Application
  - Approval steps: Manager Approval, HR Approval (conditional)

#### Leave Policies
- **Leave Types:** Casual Leave, Sick Leave, Earned Leave
- **Accrual Rules:** Monthly accrual per type
- **Balances:** Pre-populated for demo users

### 6.2 Seed Scripts
- Database seed scripts to populate master data
- SQL scripts or ORM seeders
- Reset script to clean and reseed database

---

## 7. Deployment Scope

### 7.1 Development Environment
- **Local Development:**
  - Backend: `localhost:3000`
  - Frontend: `localhost:5173`
  - Database: `localhost:5432`
  - Redis (optional): `localhost:6379`

### 7.2 POC Deployment (Optional)
- **Simple Cloud Deployment:**
  - Backend: Heroku, Railway, or Render
  - Frontend: Vercel or Netlify
  - Database: Supabase, Railway, or RDS
  
- **Alternative: Docker Compose**
  - All services in containers
  - Single `docker-compose up` command

### 7.3 Out of Scope for POC
- Production-grade deployment
- Load balancers
- Auto-scaling
- Multiple environments (dev/staging/prod)
- SSL certificates (can use platform defaults)

---

## 8. Success Criteria

### 8.1 Must-Have Deliverables
1. Working backend API with all endpoints
2. Working admin portal with flow configuration
3. Working user portal with flow execution
4. Multi-tenant demo with 2 tenants
5. Complete Onboarding flow demonstration
6. Complete Leave Approval flow demonstration
7. RBAC working across all modules
8. Code repository with README
9. API documentation (Postman collection or Swagger)
10. Demo data seeded and ready

### 8.2 Success Metrics
- All user stories completed (see requirements doc)
- All acceptance criteria met
- Demo flows execute end-to-end without errors
- Admin can configure new flow without code changes
- Code is clean, documented, and deployable
- Stakeholders can understand and validate architecture

### 8.3 Demo Scenarios Must Work
1. **Tenant Isolation Demo:**
   - Login as Tenant A user, see only Tenant A data
   - Login as Tenant B user, see only Tenant B data
   
2. **Onboarding Flow Demo:**
   - HR Admin configures onboarding flow
   - New employee starts onboarding
   - Employee fills forms across multiple steps
   - Manager approves
   - HR Admin approves
   - Flow completes, employee is fully onboarded
   
3. **Leave Approval Demo:**
   - Employee checks leave balance
   - Employee applies leave
   - Manager receives approval task
   - Manager approves
   - Leave balance deducts
   - Employee sees approved status
   
4. **Configuration Flexibility Demo:**
   - Admin adds new step to flow
   - Admin changes form schema
   - Admin changes approval role
   - Changes reflect immediately in user portal

---

## 9. Assumptions & Constraints

### 9.1 Assumptions
- Stakeholders understand this is a POC, not production-ready
- No real employee data will be used
- Email notifications can be mocked or use a test SMTP
- Single timezone support is acceptable
- English language only

### 9.2 Constraints
- **Time:** 8 weeks maximum
- **Budget:** No budget for paid tools/services
- **Team:** Small team, limited hours
- **Infrastructure:** Use free tiers of cloud services

### 9.3 Dependencies
- Stakeholder availability for reviews
- Access to design mockups (if any)
- Timely feedback on demos

---

## 10. Risks & Mitigation

### 10.1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex flow engine logic | High | Start with simple linear flows, avoid branching |
| Dynamic form rendering issues | Medium | Use proven library like React Hook Form, test thoroughly |
| Multi-tenant bugs (data leakage) | Critical | Write middleware early, test with 2 tenants from day 1 |
| Performance with JSONB queries | Medium | Use proper indexes, limit JSON depth |
| Scope creep | High | Strict adherence to IN SCOPE list, defer all extras |

### 10.2 Project Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Timeline slippage | High | Weekly milestones, early warning system |
| Unclear requirements | Medium | Review this document with stakeholders |
| Developer availability | Medium | Cross-train team members |
| Technology learning curve | Medium | Allocate 1 week for setup and learning |

---

## 11. Approval & Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Technical Lead | | | |
| Project Manager | | | |

---

## 12. Document Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 2025 | POC Team | Initial scope document |

---

**Next Steps:**
1. Review and approve this scope document
2. Proceed to Requirements Specification
3. Begin technical design and planning
4. Kick off development

