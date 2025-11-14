# Database Seed Scripts

This directory contains comprehensive database seed scripts for the WisRight HRMS POC application.

## Overview

The seed scripts populate the database with demo data for testing and development purposes. All seeds are **idempotent**, meaning they can be run multiple times without creating duplicate data.

## Seed Files

The seeds are executed in the following order:

1. **01-seed-tenants.ts** - Creates 2 demo tenants
   - Acme Corporation (subdomain: acme)
   - TechStart Inc (subdomain: techstart)

2. **02-seed-roles.ts** - Creates default roles with permissions
   - SUPER_ADMIN - Full system access
   - HR_ADMIN - HR administrative access
   - MANAGER - Team management access
   - EMPLOYEE - Basic employee access

3. **03-seed-users.ts** - Creates demo users (14 per tenant)
   - 1 Super Admin
   - 1 HR Admin
   - 2 Managers
   - 10 Employees
   - All users have password: `Demo@123`

4. **04-seed-master-data.ts** - Creates master data
   - 6 Departments (Engineering, HR, Sales, Marketing, Finance, Operations)
   - 16 Designations (CEO, VP, Manager, Engineers, etc.)
   - 4 Locations (HQ, West Coast, Development Center, Remote)

5. **05-seed-employees.ts** - Links users to employee records
   - Creates employee profiles for all users
   - Assigns departments, designations, and locations
   - Sets up reporting hierarchy

6. **06-seed-leave-types.ts** - Creates leave types
   - Casual Leave (CL)
   - Sick Leave (SL)
   - Earned Leave (EL)
   - Maternity Leave (ML)
   - Paternity Leave (PL)
   - Unpaid Leave (UL)
   - Compensatory Off (CO)

7. **07-seed-leave-balances.ts** - Initializes leave balances
   - CL: 12 days
   - SL: 10 days
   - EL: 15 days
   - ML: 90 days
   - PL: 10 days

8. **08-seed-flows.ts** - Creates workflow definitions
   - **ONBOARDING Flow** (6 steps)
     - Personal Information
     - Employment Details
     - Bank Details
     - Document Upload
     - HR Review
     - Manager Approval
   - **LEAVE_APPROVAL Flow** (3 steps)
     - Leave Request
     - Manager Approval
     - HR Review (conditional)

9. **09-seed-form-schemas.ts** - Creates form schemas
   - Personal Information Form
   - Employment Details Form
   - Leave Request Form
   - Document Upload Form
   - Bank Details Form

10. **10-seed-policies.ts** - Creates policies
    - Annual Leave Policy
    - Maternity Leave Policy
    - Paternity Leave Policy
    - Work From Home Policy
    - Employee Onboarding Policy

11. **run-seeds.ts** - Main script that executes all seeds in order

## Usage

### Run All Seeds

From the backend directory:

```bash
npm run seed
```

Or directly:

```bash
ts-node src/database/seeds/run-seeds.ts
```

### Prerequisites

1. Ensure PostgreSQL is running
2. Database should exist (create if not exists)
3. Environment variables should be configured in `.env`:
   ```env
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=postgres
   DATABASE_PASSWORD=postgres
   DATABASE_NAME=wisright_hrms
   ```

## Sample Login Credentials

### Acme Corporation

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@acme.com | Demo@123 |
| HR Admin | hr@acme.com | Demo@123 |
| Manager | manager1@acme.com | Demo@123 |
| Manager | manager2@acme.com | Demo@123 |
| Employee | emp1@acme.com | Demo@123 |
| Employee | emp2@acme.com through emp10@acme.com | Demo@123 |

### TechStart Inc

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@techstart.com | Demo@123 |
| HR Admin | hr@techstart.com | Demo@123 |
| Manager | manager1@techstart.com | Demo@123 |
| Manager | manager2@techstart.com | Demo@123 |
| Employee | emp1@techstart.com | Demo@123 |
| Employee | emp2@techstart.com through emp10@techstart.com | Demo@123 |

## Features

- **Idempotent**: Seeds can be run multiple times without creating duplicates
- **Tenant Isolation**: Data is properly isolated by tenant
- **Realistic Data**: Demo data represents real-world scenarios
- **Complete Setup**: All necessary data for testing HRMS features
- **Error Handling**: Graceful error handling with detailed logging
- **Progress Tracking**: Clear console output showing progress

## Data Summary

Per Tenant:
- 4 Roles with comprehensive permissions
- 14 Users with various roles
- 6 Departments
- 16 Designations
- 4 Locations
- 14 Employee records
- 7 Leave types
- ~98 Leave balances (14 employees × 7 leave types)
- 2 Workflow definitions with multiple steps
- 5 Form schemas
- 5 Policies

## Notes

- All passwords are hashed using bcrypt
- Employee codes follow pattern: EMP0001, EMP0002, etc.
- All dates are set to realistic values
- Reporting hierarchy is established
- Leave balances are initialized for the current year
- Flows are published and ready to use
- Policies have effective dates set

## Cleanup

To reset the database and re-run seeds:

```bash
# Drop and recreate the database
psql -U postgres -c "DROP DATABASE IF EXISTS wisright_hrms;"
psql -U postgres -c "CREATE DATABASE wisright_hrms;"

# Run migrations
npm run migration:run

# Run seeds
npm run seed
```

## Troubleshooting

**Error: Connection refused**
- Ensure PostgreSQL is running
- Check DATABASE_HOST and DATABASE_PORT in .env

**Error: Database does not exist**
- Create the database: `psql -U postgres -c "CREATE DATABASE wisright_hrms;"`

**Error: Duplicate key violation**
- This is expected behavior - seeds are idempotent and will skip existing records

**Error: bcrypt issues**
- Ensure bcrypt is properly installed: `npm install bcrypt`
- May need to rebuild: `npm rebuild bcrypt`
