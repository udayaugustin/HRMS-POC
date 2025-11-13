# WisRight HRMS - POC Project Timeline & Milestones

## Project Duration: 8 Weeks
**Team Size:** 3-4 developers (2 backend, 1-2 frontend)  
**Start Date:** TBD  
**Target Completion:** 8 weeks from start

---

## Week-by-Week Breakdown

### Week 1: Foundation & Setup

#### Milestones
- Development environment setup complete
- Database schema implemented
- Basic project structure in place
- Authentication working

#### Deliverables
- Backend project initialized with NestJS
- Frontend project initialized with React + Vite
- PostgreSQL database created
- All tables created with migrations
- Seed data script created
- User authentication (login/logout) working
- JWT token generation and validation

#### Tasks
**Backend (2 developers)**
- Day 1-2: Project setup, database schema implementation
- Day 3-4: Auth module (login, JWT, guards)
- Day 5: Tenant module, user module, roles module

**Frontend (1-2 developers)**
- Day 1-2: Project setup, routing, layouts
- Day 3-4: Login page, protected routes
- Day 5: Admin and user portal layouts

**Critical Path:** Database schema and auth system

---

### Week 2: Master Data & Employee Management

#### Milestones
- All master data CRUD operations complete
- Employee management working
- RBAC implemented

#### Deliverables
- Departments, Designations, Locations CRUD APIs
- Employee CRUD APIs
- Role-permission system working
- Admin portal master data screens
- Admin portal employee management screens

#### Tasks
**Backend**
- Departments, Designations, Locations modules
- Employee module with full CRUD
- RBAC guard implementation
- Tenant isolation middleware

**Frontend**
- Master data list and form screens
- Employee list with search and filters
- Add/Edit employee forms
- Data table component

**Dependencies:** Week 1 auth system

---

### Week 3: Flow Engine Foundation

#### Milestones
- Flow definition system complete
- Flow version management working
- Form schema engine implemented

#### Deliverables
- Flow definitions API
- Flow versions API
- Flow step definitions API
- Form schema definitions API
- Admin flow configuration screens
- Form schema editor

#### Tasks
**Backend**
- Flow definitions, versions, steps modules
- Form schema module
- Flow CRUD operations

**Frontend**
- Flow list screen
- Flow step configuration screen
- Form schema editor (JSON or UI-based)

**Dependencies:** Week 2 master data

---

### Week 4: Dynamic Form Rendering & Policy Engine

#### Milestones
- Dynamic form renderer working
- Policy engine implemented
- Leave policies configured

#### Deliverables
- Dynamic form rendering from JSON schema
- Policy definitions API
- Leave types and balances APIs
- Leave policy configuration screens
- Dynamic form preview

#### Tasks
**Backend**
- Policy module
- Leave types and balances modules
- Policy engine service (leave balance calculation)

**Frontend**
- DynamicForm component
- FormField renderers for all field types
- Policy configuration screens

**Dependencies:** Week 3 form schemas

---

### Week 5: Flow Execution & Leave Application

#### Milestones
- Flow instance execution working
- Leave application flow complete
- Flow stepper UI implemented

#### Deliverables
- Flow instance start API
- Flow step submission API
- Leave application API
- Flow execution screens
- Leave application screens
- Flow stepper component

#### Tasks
**Backend**
- Flow instance and step instance modules
- Flow execution service
- Leave request creation integrated with flow

**Frontend**
- Flow execution stepper UI
- Form submission logic
- Leave balance display
- Apply leave modal

**Dependencies:** Week 4 dynamic forms

**Critical Path:** Flow execution engine

---

### Week 6: Approval Workflow

#### Milestones
- Approval system fully functional
- Manager and HR approvals working
- Notifications implemented

#### Deliverables
- Approval APIs (list, approve, reject)
- Notification APIs
- Manager approval screens
- Employee approval status views
- In-app notifications

#### Tasks
**Backend**
- Approvals module
- Notifications module
- Approval workflow logic
- Leave balance deduction on approval

**Frontend**
- Pending approvals list
- Approval details and actions
- Notification dropdown
- Approval status in flow views

**Dependencies:** Week 5 flow execution

---

### Week 7: Dashboards & Polish

#### Milestones
- Admin dashboard complete
- Employee dashboard complete
- All user stories tested

#### Deliverables
- Admin dashboard with metrics
- Employee dashboard with widgets
- Leave history screens
- My workflows screens
- Error handling and validation

#### Tasks
**Backend**
- Dashboard APIs
- Error handling improvements
- API response standardization

**Frontend**
- Admin dashboard widgets
- Employee dashboard widgets
- Leave history table
- My workflows list
- Toast notifications
- Loading states
- Empty states

**Dependencies:** Week 6 approvals

---

### Week 8: Testing, Demo Prep & Documentation

#### Milestones
- All acceptance criteria met
- Demo scenarios working
- Documentation complete

#### Deliverables
- Comprehensive testing completed
- Demo data fully seeded
- Bugs fixed
- README files updated
- API documentation (Postman collection)
- Demo presentation ready

#### Tasks
**All Team**
- End-to-end testing all user stories
- Bug fixes
- Performance optimization
- Seed data refinement
- Demo scenario walkthroughs
- Documentation
- Deployment (if needed)

**Focus:** Quality assurance and stakeholder readiness

---

## Detailed Task Breakdown by Module

### Phase 1: Foundation (Weeks 1-2)
**Story Points:** 40  
**Duration:** 10 days

| Module | Tasks | Effort | Owner |
|--------|-------|--------|-------|
| Setup | Project init, DB setup | 2 days | BE Lead |
| Auth | Login, JWT, guards | 3 days | BE Dev 1 |
| Users | User CRUD, roles | 2 days | BE Dev 2 |
| Master Data | Dept, Desig, Loc CRUD | 3 days | BE Dev 2 |
| Employees | Employee CRUD | 3 days | BE Dev 1 |
| Admin UI | Layouts, master data screens | 5 days | FE Dev 1 |
| User UI | Layouts, dashboard | 3 days | FE Dev 2 |

---

### Phase 2: Flow Engine (Weeks 3-4)
**Story Points:** 45  
**Duration:** 10 days

| Module | Tasks | Effort | Owner |
|--------|-------|--------|-------|
| Flow Definitions | CRUD APIs | 2 days | BE Dev 1 |
| Flow Versions | Version management | 2 days | BE Dev 1 |
| Flow Steps | Step CRUD | 2 days | BE Dev 2 |
| Form Schemas | Schema CRUD | 2 days | BE Dev 2 |
| Policies | Policy engine | 3 days | BE Dev 1 |
| Flow Config UI | Admin flow screens | 5 days | FE Dev 1 |
| Form Renderer | Dynamic form component | 4 days | FE Dev 2 |

---

### Phase 3: Execution (Weeks 5-6)
**Story Points:** 40  
**Duration:** 10 days

| Module | Tasks | Effort | Owner |
|--------|-------|--------|-------|
| Flow Instances | Start flow, submit steps | 3 days | BE Dev 1 |
| Leave Application | Leave request flow | 2 days | BE Dev 2 |
| Approvals | Approval CRUD, logic | 4 days | BE Dev 1 |
| Notifications | Notification system | 2 days | BE Dev 2 |
| Flow Execution UI | Stepper, forms | 5 days | FE Dev 1 |
| Leave UI | Balance, apply, history | 4 days | FE Dev 2 |
| Approval UI | Pending, approve/reject | 4 days | FE Dev 1 |

---

### Phase 4: Polish & Demo (Weeks 7-8)
**Story Points:** 25  
**Duration:** 10 days

| Module | Tasks | Effort | Owner |
|--------|-------|--------|-------|
| Dashboards | Admin & user dashboards | 3 days | All FE |
| Testing | E2E testing, bug fixes | 4 days | All |
| Demo Prep | Seed data, walkthroughs | 2 days | All |
| Documentation | README, API docs | 2 days | BE Lead |
| Polish | UI improvements, UX | 3 days | All FE |

---

## Dependencies Graph

```
Week 1: Setup & Auth
  └─> Week 2: Master Data & Employees
      └─> Week 3: Flow Engine
          └─> Week 4: Dynamic Forms & Policies
              └─> Week 5: Flow Execution
                  └─> Week 6: Approvals
                      └─> Week 7: Dashboards
                          └─> Week 8: Testing & Demo
```

**Critical Path:** Setup -> Auth -> Flow Engine -> Dynamic Forms -> Flow Execution -> Approvals

---

## Risk Mitigation Timeline

| Risk | Week | Mitigation |
|------|------|------------|
| Complex flow engine | Week 3 | Start with simple linear flows, avoid branching |
| Dynamic form rendering | Week 4 | Use proven library, limit field types |
| Tenant isolation bugs | Week 2 | Implement middleware early, test continuously |
| Timeline slippage | Ongoing | Weekly check-ins, adjust scope if needed |

---

## Weekly Check-in Schedule

**Every Monday:**
- Review previous week deliverables
- Demo completed features
- Identify blockers
- Adjust plan if needed

**Every Friday:**
- Code review
- Test completed features
- Update progress tracker

---

## Demo Schedule

| Demo | Week | Audience | Content |
|------|------|----------|---------|
| Demo 1 | Week 2 | Team | Auth, master data, employees |
| Demo 2 | Week 4 | Team | Flow configuration, form schemas |
| Demo 3 | Week 6 | Stakeholders | End-to-end onboarding flow |
| Demo 4 | Week 6 | Stakeholders | Leave approval flow |
| Final Demo | Week 8 | All Stakeholders | Complete system walkthrough |

---

## Success Criteria Checklist

### By Week 4 (Midpoint)
- [ ] Authentication working
- [ ] Master data CRUD complete
- [ ] Employee management working
- [ ] Flow configuration UI working
- [ ] Form schemas can be created
- [ ] Dynamic forms render correctly

### By Week 8 (Completion)
- [ ] Onboarding flow works end-to-end
- [ ] Leave approval flow works end-to-end
- [ ] Tenant isolation verified
- [ ] RBAC enforced everywhere
- [ ] Admin can configure flows without code
- [ ] All user stories completed
- [ ] Demo data seeded
- [ ] Documentation complete

---

## Contingency Plans

### If Behind Schedule (Week 4 Check)
**Options:**
1. Reduce form field types supported
2. Simplify policy engine (manual balance entry)
3. Defer notifications to post-POC
4. Use JSON editor instead of visual form builder

### If Ahead of Schedule (Week 6 Check)
**Nice to Haves:**
1. Email notifications
2. Richer dashboards
3. More demo scenarios
4. Better UI polish

---

**Document Status:** Ready for Execution  
**Next Document:** Developer Task Breakdown

