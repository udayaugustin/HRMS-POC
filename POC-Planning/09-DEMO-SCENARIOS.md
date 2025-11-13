# WisRight HRMS - POC Demo Scenarios

## Demo Overview

This document contains detailed step-by-step walkthroughs for demonstrating the WisRight HRMS POC to stakeholders.

**Demo Duration:** 30-45 minutes  
**Audience:** Stakeholders, Product Owners, Technical Leads  
**Goal:** Validate core architectural concepts

---

## Pre-Demo Setup Checklist

- [ ] Database seeded with 2 tenants (Acme Corp, TechStart Inc)
- [ ] Each tenant has:
  - [ ] 1 HR Admin user
  - [ ] 2 Managers
  - [ ] 10 Employees
  - [ ] Master data (departments, designations, locations)
  - [ ] Onboarding flow configured and published
  - [ ] Leave approval flow configured and published
  - [ ] Leave policies configured
  - [ ] Leave balances assigned
- [ ] Backend server running on localhost:3000
- [ ] Frontend running on localhost:5173
- [ ] Postman collection ready (optional)
- [ ] Browser with 2 profiles or incognito windows

---

## Demo Scenario 1: Multi-Tenant Isolation

**Purpose:** Prove that tenants cannot see each other's data

**Duration:** 5 minutes

### Steps

1. **Login as Tenant A (Acme Corp) HR Admin**
   - Navigate to http://localhost:5173
   - Email: admin@acme.com
   - Password: Admin@123
   - Click Login

2. **Show Tenant A Dashboard**
   - Point out company name in header
   - Show employee count (should show Acme employees only)
   - Navigate to Employees list

3. **View Employee List**
   - Show that only Acme Corp employees are visible
   - Point out department names specific to Acme

4. **Logout and Login as Tenant B (TechStart Inc)**
   - Logout from Acme
   - Login as admin@techstart.com / Admin@123

5. **Show Tenant B Dashboard**
   - Point out different company name
   - Show different employee count
   - Navigate to Employees list
   - Show that only TechStart employees are visible
   - Point out different department names

6. **Key Takeaway**
   - "Each tenant's data is completely isolated"
   - "Same codebase, single database, but strict data separation"

---

## Demo Scenario 2: Employee Onboarding Flow (End-to-End)

**Purpose:** Demonstrate configuration-driven flow engine with dynamic forms and approval workflow

**Duration:** 15 minutes

### Part A: Admin Configures Onboarding Flow (5 minutes)

**Login as:** admin@acme.com

1. **Navigate to Workflows**
   - Click "Workflows" in sidebar
   - Show existing flows list

2. **View Onboarding Flow Configuration**
   - Click "Configure" on Employee Onboarding flow
   - Show the 4 steps:
     - Step 1: Basic Information (Form)
     - Step 2: Job Details (Form)
     - Step 3: Manager Approval (Approval)
     - Step 4: HR Approval (Approval)

3. **Show Form Schema**
   - Click on Step 1 "Basic Information"
   - Show form schema configuration
   - Point out fields: first_name, last_name, email, phone, DOB
   - Show field types and validation rules

4. **Edit Step (Optional)**
   - Click "Edit" on Step 3
   - Show approval role selection (Manager)
   - Cancel without saving

5. **Key Message**
   - "HR Admin can configure entire workflow without writing code"
   - "Forms are defined as JSON schemas"
   - "Approval roles can be changed easily"

### Part B: Employee Executes Onboarding Flow (10 minutes)

**Login as:** john.doe@acme.com (New Employee)

6. **Employee Dashboard**
   - Show "Complete Onboarding" task in pending tasks widget
   - Click "Resume" button

7. **Step 1: Basic Information Form**
   - Show dynamically rendered form from schema
   - Fill in:
     - First Name: John
     - Last Name: Doe
     - Email: john.doe@acme.com (pre-filled)
     - Phone: 1234567890
     - Date of Birth: (select date)
   - Click "Next Step"

8. **Show Validation**
   - Try to skip required field (e.g., clear First Name)
   - Click Next
   - Show error message
   - Fill it back
   - Click "Next Step"

9. **Step 2: Job Details Form**
   - Show dropdowns populated from master data
   - Fill in:
     - Department: Engineering (dropdown)
     - Designation: Software Engineer (dropdown)
     - Location: Headquarters (dropdown)
     - Manager: Jane Smith (dropdown)
     - Joining Date: (select date)
   - Click "Next Step"

10. **Step 3: Manager Approval (Waiting)**
    - Show "Waiting for Manager Approval" message
    - Show who it's assigned to: Jane Smith
    - Show that employee cannot proceed
    - Note: Employee sees notification "Onboarding submitted for approval"

11. **Switch to Manager Login**
    - Logout John Doe
    - Login as jane.smith@acme.com (Manager)

12. **Manager Pending Approvals**
    - Show notification badge (1 new approval)
    - Navigate to "Approvals" page
    - Show John Doe's onboarding request

13. **Manager Approves**
    - Click on approval request
    - Review submitted details:
      - Basic Information data
      - Job Details data
    - Add comment: "All details look good"
    - Click "Approve"
    - Show success message

14. **Switch to HR Admin Login**
    - Logout Manager
    - Login as admin@acme.com (HR Admin)

15. **HR Admin Sees Approval**
    - Navigate to Approvals
    - Show John Doe's onboarding (now at Step 4: HR Approval)
    - Show previous approval by Jane Smith

16. **HR Admin Approves**
    - Review all details
    - Add comment: "Approved. Welcome to Acme!"
    - Click "Approve"
    - Show success message

17. **Verify Flow Completion**
    - Navigate to Employees
    - Show John Doe in employee list
    - Click to view details
    - Show that all onboarding data is saved

18. **Switch back to John Doe**
    - Login as john.doe@acme.com
    - Dashboard shows "Onboarding Completed"
    - No pending tasks

19. **Key Takeaways**
    - "Forms rendered dynamically from schemas"
    - "Multi-level approval workflow"
    - "Manager and HR both approved sequentially"
    - "Employee data automatically saved"
    - "Notifications sent at each step"

---

## Demo Scenario 3: Leave Approval Flow

**Purpose:** Demonstrate policy engine, leave balance calculation, and approval workflow

**Duration:** 10 minutes

### Part A: Employee Checks Balance (2 minutes)

**Login as:** john.doe@acme.com

1. **Navigate to Leave**
   - Click "Leave" in top navigation
   - Show leave balance widget
   - Point out balances:
     - Casual Leave: 15/18 available
     - Sick Leave: 12/12 available
     - Earned Leave: 15/15 available

2. **Explain Policy**
   - "Policy engine calculated these balances"
   - "Based on monthly accrual rules configured by HR"

### Part B: Employee Applies Leave (3 minutes)

3. **Click Apply Leave**
   - Apply Leave modal opens

4. **Fill Leave Application**
   - Leave Type: Casual Leave (dropdown)
   - From Date: (select future date, e.g., Jan 20, 2025)
   - To Date: (select Jan 22, 2025)
   - Number of Days: 3 (auto-calculated)
   - Reason: "Family function"
   - Click "Submit Request"

5. **Validation Check (Optional)**
   - Try to apply for more days than available
   - Show error: "Insufficient balance"
   - Adjust dates back to 3 days

6. **Leave Applied**
   - Show success message
   - Show leave in history with status "Pending"
   - Show updated balance: 15 available, 3 pending

### Part C: Manager Approves Leave (5 minutes)

7. **Switch to Manager**
   - Logout John
   - Login as jane.smith@acme.com

8. **Manager Sees Approval Request**
   - Show notification (new leave approval)
   - Navigate to Approvals
   - Show John Doe's leave request

9. **View Leave Details**
   - Click on request
   - Review:
     - Leave Type: Casual Leave
     - Dates: Jan 20-22, 2025
     - Days: 3
     - Reason: Family function
     - Available Balance: 15 days
   - Add comment: "Approved"
   - Click "Approve"

10. **Verify Leave Balance Updated**
    - Logout Manager
    - Login back as john.doe@acme.com
    - Navigate to Leave
    - Show updated balance:
      - Available: 12 (15 - 3)
      - Used: 3
      - Pending: 0
    - Show leave in history with status "Approved"

11. **Key Takeaways**
    - "Leave balance calculated by policy engine"
    - "Balance validation before submission"
    - "Manager can review all details before approving"
    - "Balance automatically deducted on approval"

---

## Demo Scenario 4: Configuration Flexibility

**Purpose:** Show that flows can be modified without code changes

**Duration:** 5-7 minutes

### Steps

**Login as:** admin@acme.com

1. **Navigate to Workflows**

2. **Modify Onboarding Flow**
   - Click "Configure" on Employee Onboarding
   - Click "Add Step" button

3. **Add New Step**
   - Step Title: "Background Verification"
   - Step Type: Approval
   - Approver Role: HR Admin
   - Step Order: 3 (after Job Details, before Manager Approval)
   - Click "Save"

4. **Reorder Steps**
   - Show that step order can be changed
   - Show up/down arrows to reorder
   - Keep new step at position 3

5. **Save Draft**
   - Click "Save Draft"
   - Show that version is still in DRAFT status
   - Previous version still ACTIVE

6. **Publish New Version**
   - Click "Publish Version"
   - Show confirmation dialog
   - Confirm
   - Show that:
     - Previous version moved to ARCHIVED
     - New version now ACTIVE

7. **Verify Change Takes Effect**
   - Open new incognito window
   - Login as new employee (or use test account)
   - Start onboarding flow
   - Complete Step 1 and Step 2
   - Show that Step 3 is now "Background Verification" approval

8. **Key Takeaway**
   - "Flow modified without code deployment"
   - "Version management ensures safe changes"
   - "New flow instances use new configuration"
   - "Old running instances not affected"

---

## Demo Scenario 5: Rejection Flow (Optional)

**Purpose:** Show what happens when approval is rejected

**Duration:** 3 minutes

**Setup:** Have an employee apply for leave

1. **Employee applies leave** (as john.doe@acme.com)
2. **Manager reviews** (as jane.smith@acme.com)
3. **Manager Rejects**
   - Add comment: "Please reschedule. Critical deadline this week."
   - Click "Reject"
4. **Verify Rejection**
   - Login back as john.doe@acme.com
   - Show leave status: "Rejected"
   - Show rejection reason
   - Show balance: no deduction (still 15 available)

---

## Demo Scenario 6: API Demonstration (Optional)

**Purpose:** Show backend API structure for technical stakeholders

**Duration:** 5 minutes

### Steps

1. **Open Postman**
   - Import POC collection

2. **Show Authentication**
   - POST /api/v1/auth/login
   - Show request body
   - Show response with JWT token

3. **Show Tenant-Scoped Endpoint**
   - GET /api/v1/acme/employees
   - Show Authorization header with token
   - Show tenant ID in URL
   - Show response with only Acme employees

4. **Show Flow API**
   - GET /api/v1/acme/flows/type/ONBOARDING/active-version
   - Show flow configuration in response
   - Show steps array with form schemas

5. **Show Permission Check**
   - Try to call admin endpoint with employee token
   - Show 403 Forbidden response

---

## Post-Demo Q&A Preparation

### Expected Questions & Answers

**Q: Can we add more fields to forms?**  
A: Yes, by editing the form schema JSON. No code changes needed.

**Q: Can we have 3 or 4 level approvals?**  
A: Yes, just add more approval steps in the flow configuration.

**Q: Can approval go to specific person instead of role?**  
A: Current POC supports role-based. Specific person assignment can be added.

**Q: Can we have conditional steps (if-then-else)?**  
A: Not in POC. This is a future enhancement.

**Q: What if we want email notifications?**  
A: Backend structure supports it. Just need to configure SMTP and add templates.

**Q: How do we handle timezone differences?**  
A: POC uses server timezone. Production will support per-tenant timezone.

**Q: Can employees edit submitted forms?**  
A: Not in POC. Once submitted, only admin can edit.

---

## Demo Success Checklist

After demo, verify:

- [ ] Tenant isolation demonstrated clearly
- [ ] Onboarding flow completed end-to-end
- [ ] Leave approval flow completed end-to-end
- [ ] Configuration changes shown working without code
- [ ] Dynamic forms rendered correctly
- [ ] Approvals worked smoothly
- [ ] Stakeholders understand architecture concepts
- [ ] Questions answered satisfactorily
- [ ] Feedback collected

---

## Backup Demo Data

If demo data gets corrupted during demo:

```bash
# Reset database
npm run seed:reset

# Re-seed
npm run seed

# Takes ~2 minutes
```

Keep terminal ready with this command!

---

**Document Status:** Ready for Demo  
**Next Document:** Success Criteria

