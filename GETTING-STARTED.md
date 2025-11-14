# 🚀 Getting Started with WisRight HRMS POC

**Complete Step-by-Step Setup Guide**

This guide will walk you through setting up the WisRight HRMS POC from scratch to running application in under 15 minutes.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Installation Steps](#installation-steps)
4. [Database Setup](#database-setup)
5. [Backend Setup](#backend-setup)
6. [Running the Application](#running-the-application)
7. [Verifying Installation](#verifying-installation)
8. [Testing the API](#testing-the-api)
9. [Accessing Demo Data](#accessing-demo-data)
10. [Common Issues & Solutions](#common-issues--solutions)
11. [Next Steps](#next-steps)

---

## ✅ Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

| Software | Minimum Version | Download Link | Check Installation |
|----------|----------------|---------------|-------------------|
| **Node.js** | 18.0.0+ | [nodejs.org](https://nodejs.org/) | `node --version` |
| **npm** | 9.0.0+ | Comes with Node.js | `npm --version` |
| **PostgreSQL** | 14.0+ | [postgresql.org](https://www.postgresql.org/download/) | `psql --version` |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) | `git --version` |

### Optional Software

| Software | Purpose | Download Link |
|----------|---------|---------------|
| **Postman** | API Testing | [postman.com](https://www.postman.com/downloads/) |
| **DBeaver** | Database Management | [dbeaver.io](https://dbeaver.io/download/) |
| **VS Code** | Code Editor | [code.visualstudio.com](https://code.visualstudio.com/) |

---

## 💻 System Requirements

### Minimum Requirements
- **OS**: Windows 10, macOS 10.14+, or Ubuntu 20.04+
- **RAM**: 4 GB
- **Disk Space**: 2 GB free space
- **Internet**: Stable connection for downloading dependencies

### Recommended Requirements
- **RAM**: 8 GB or more
- **Disk Space**: 5 GB free space
- **CPU**: 4 cores or more

---

## 📦 Installation Steps

### Step 1: Verify Prerequisites

Open your terminal and verify all prerequisites are installed:

```bash
# Check Node.js version (should be 18.0.0 or higher)
node --version

# Check npm version (should be 9.0.0 or higher)
npm --version

# Check PostgreSQL version (should be 14.0 or higher)
psql --version

# Check Git version
git --version
```

**Expected Output:**
```
v22.21.1  (or higher)
10.9.4    (or higher)
psql (PostgreSQL) 14.x (or higher)
git version 2.x.x
```

If any command fails, install the missing software from the links in the Prerequisites section.

---

### Step 2: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/udayaugustin/HRMS-POC.git

# Navigate to the project directory
cd HRMS-POC

# Verify the structure
ls -la
```

**Expected Output:**
```
Architecture/
backend/
POC-Planning/
README.md
DEPLOYMENT-GUIDE.md
IMPLEMENTATION-SUMMARY.md
...
```

---

## 🗄️ Database Setup

### Step 3: Install and Configure PostgreSQL

#### On Ubuntu/Debian

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify PostgreSQL is running
sudo systemctl status postgresql
```

#### On macOS

```bash
# Install PostgreSQL using Homebrew
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Verify PostgreSQL is running
brew services list | grep postgresql
```

#### On Windows

1. Download PostgreSQL installer from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the wizard
3. Remember the password you set for the `postgres` user
4. Ensure PostgreSQL service is running (check Services)

---

### Step 4: Create Database

#### Option A: Using Command Line (Recommended)

```bash
# On Linux/Mac
sudo -u postgres createdb wisright_hrms_poc

# On Windows (run in Command Prompt as Administrator)
createdb -U postgres wisright_hrms_poc
```

#### Option B: Using psql

```bash
# Connect to PostgreSQL (Linux/Mac)
sudo -u postgres psql

# On Windows, open psql from Start Menu, then run:
psql -U postgres
```

Then run these SQL commands:

```sql
-- Create database
CREATE DATABASE wisright_hrms_poc;

-- Create user (optional - for better security)
CREATE USER hrms_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE wisright_hrms_poc TO hrms_user;

-- Verify database was created
\l

-- Exit psql
\q
```

**Expected Output:**
```
CREATE DATABASE
CREATE ROLE
GRANT
```

---

### Step 5: Verify Database Connection

Test that you can connect to the database:

```bash
# Connect to the database
psql -U postgres -d wisright_hrms_poc

# You should see the PostgreSQL prompt
wisright_hrms_poc=#

# Exit
\q
```

---

## ⚙️ Backend Setup

### Step 6: Navigate to Backend Directory

```bash
# From the HRMS-POC root directory
cd backend

# Verify you're in the right directory
pwd
# Should show: /path/to/HRMS-POC/backend

# Check package.json exists
ls package.json
```

---

### Step 7: Install Dependencies

```bash
# Install all npm packages (this may take 2-3 minutes)
npm install
```

**Expected Output:**
```
added 583 packages, and audited 584 packages in 30s

122 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

**Note:** You may see some warnings about deprecated packages - this is normal and can be ignored.

---

### Step 8: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Open .env for editing
nano .env
# Or use your preferred editor: code .env, vim .env, etc.
```

**Edit the .env file with your database credentials:**

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=wisright_hrms_poc

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-CHANGE-THIS-IN-PRODUCTION-12345678
JWT_EXPIRY=24h

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

**Important Configuration Notes:**

1. **DATABASE_PASSWORD**: Replace with your PostgreSQL password
2. **JWT_SECRET**: Change to a random 32+ character string (for production)
3. **DATABASE_USER**: If you created a custom user, use that instead of `postgres`

**Generate a secure JWT_SECRET:**
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -base64 32
```

Copy the generated string and paste it as your JWT_SECRET.

**Save and close the file:**
- In nano: Press `Ctrl + X`, then `Y`, then `Enter`
- In vim: Press `Esc`, type `:wq`, press `Enter`
- In VS Code: Press `Ctrl + S` (or `Cmd + S` on Mac)

---

### Step 9: Verify Configuration

Check that your .env file is set up correctly:

```bash
# Display the .env file (without sensitive data)
cat .env | grep -v PASSWORD | grep -v SECRET
```

**Expected Output:**
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_NAME=wisright_hrms_poc
JWT_EXPIRY=24h
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## 🌱 Database Seeding

### Step 10: Populate Demo Data

The backend will automatically create database tables when it starts (in development mode). We just need to populate them with demo data.

```bash
# Run the seed script (this takes about 10-15 seconds)
npm run seed
```

**Expected Output:**
```
🌱 Starting database seeding...
─────────────────────────────────
✓ Database connection established
✓ Tenants seeded (2)
✓ Roles seeded (8)
✓ Users seeded (28)
✓ Master data seeded (26)
✓ Employees seeded (28)
✓ Leave types seeded (14)
✓ Leave balances seeded (196)
✓ Flows seeded (4)
✓ Form schemas seeded (10)
✓ Policies seeded (10)
─────────────────────────────────
✅ Database seeding completed successfully!

📊 Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Tenants:         2
  Roles:           8
  Users:           28
  Employees:       28
  Departments:     6
  Designations:    16
  Locations:       4
  Leave Types:     14
  Leave Balances:  196
  Flows:           4
  Form Schemas:    10
  Policies:        10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 Sample Login Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Acme Corporation:
  Super Admin: admin@acme.com / Demo@123
  HR Admin:    hr@acme.com / Demo@123
  Manager:     manager1@acme.com / Demo@123
  Employee:    emp1@acme.com / Demo@123

TechStart Inc:
  Super Admin: admin@techstart.com / Demo@123
  HR Admin:    hr@techstart.com / Demo@123
  Manager:     manager1@techstart.com / Demo@123
  Employee:    emp1@techstart.com / Demo@123

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️  Seeding completed in 8.5 seconds
```

**What was created:**
- ✅ 2 demo tenants (Acme Corporation, TechStart Inc)
- ✅ 28 users with different roles
- ✅ Complete organizational structure
- ✅ 2 pre-configured workflows (Onboarding, Leave Approval)
- ✅ Leave types and balances
- ✅ Form schemas and policies

**Note:** You can run `npm run seed` multiple times - it's idempotent (won't create duplicates).

---

## 🚀 Running the Application

### Step 11: Start the Backend Server

```bash
# Start in development mode (with hot reload)
npm run start:dev
```

**Expected Output:**
```
[Nest] 12345  - 11/13/2025, 5:30:45 PM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 11/13/2025, 5:30:45 PM     LOG [InstanceLoader] AppModule dependencies initialized +25ms
[Nest] 12345  - 11/13/2025, 5:30:45 PM     LOG [InstanceLoader] TypeOrmModule dependencies initialized +1ms
[Nest] 12345  - 11/13/2025, 5:30:45 PM     LOG [InstanceLoader] ConfigModule dependencies initialized +1ms
...
[Nest] 12345  - 11/13/2025, 5:30:46 PM     LOG [RoutesResolver] AuthController {/api/v1/auth}: +1ms
[Nest] 12345  - 11/13/2025, 5:30:46 PM     LOG [RouterExplorer] Mapped {/api/v1/auth/login, POST} route +2ms
...
[Nest] 12345  - 11/13/2025, 5:30:46 PM     LOG [NestApplication] Nest application successfully started +3ms
🚀 Application is running on: http://localhost:3000/api/v1
```

**The server is now running!** 🎉

Keep this terminal window open. The server will automatically reload when you make code changes.

---

## ✅ Verifying Installation

### Step 12: Test Server Health

Open a **NEW terminal window** (keep the server running in the first terminal).

```bash
# Test the API health endpoint
curl http://localhost:3000/api/v1

# Or open in your browser:
# http://localhost:3000/api/v1
```

**Expected Response:**
```json
{
  "message": "WisRight HRMS API is running",
  "version": "1.0.0",
  "status": "OK"
}
```

---

## 🧪 Testing the API

### Step 13: Test Authentication

#### Test 1: Login as Admin

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@acme.com",
    "password": "Demo@123"
  }'
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "admin@acme.com",
    "firstName": "Admin",
    "lastName": "User",
    "tenantId": "tenant-uuid",
    "roles": ["SUPER_ADMIN"]
  }
}
```

**Copy the `accessToken` value** - you'll need it for the next tests.

---

#### Test 2: Access Protected Endpoint

Replace `YOUR_TOKEN_HERE` with the token from the previous step:

```bash
curl http://localhost:3000/api/v1/employees \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "employeeCode": "EMP0001",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@acme.com"
      },
      "department": {
        "name": "Engineering"
      },
      ...
    },
    ...
  ],
  "total": 14,
  "page": 1,
  "limit": 10
}
```

---

#### Test 3: Get Leave Balances

```bash
curl http://localhost:3000/api/v1/leave/balances/employee/EMPLOYEE_ID?year=2024 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Replace `EMPLOYEE_ID` with an employee UUID from the previous response.

---

### Using Postman (Recommended)

For easier API testing, use Postman:

1. **Download Postman**: [postman.com/downloads](https://www.postman.com/downloads/)
2. **Create a new collection**: "WisRight HRMS"
3. **Add requests**:

   **Login Request:**
   - Method: POST
   - URL: `http://localhost:3000/api/v1/auth/login`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "email": "admin@acme.com",
       "password": "Demo@123"
     }
     ```
   - Click **Send**
   - Copy the `accessToken` from the response

   **Get Employees:**
   - Method: GET
   - URL: `http://localhost:3000/api/v1/employees`
   - Headers: `Authorization: Bearer YOUR_TOKEN`
   - Click **Send**

---

## 🎯 Accessing Demo Data

### Available Demo Credentials

#### Acme Corporation (Tenant 1)

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Super Admin** | admin@acme.com | Demo@123 | Full system access |
| **HR Admin** | hr@acme.com | Demo@123 | HR administrative access |
| **Manager** | manager1@acme.com | Demo@123 | Team management + approvals |
| **Manager** | manager2@acme.com | Demo@123 | Team management + approvals |
| **Employee** | emp1@acme.com | Demo@123 | Basic employee access |
| **Employee** | emp2@acme.com | Demo@123 | Basic employee access |
| ... | emp3-emp10@acme.com | Demo@123 | More employees |

#### TechStart Inc (Tenant 2)

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Super Admin** | admin@techstart.com | Demo@123 | Full system access |
| **HR Admin** | hr@techstart.com | Demo@123 | HR administrative access |
| **Manager** | manager1@techstart.com | Demo@123 | Team management + approvals |
| **Employee** | emp1@techstart.com | Demo@123 | Basic employee access |
| ... | emp2-emp10@techstart.com | Demo@123 | More employees |

### What You Can Test

1. **Multi-Tenant Isolation**
   - Login as `admin@acme.com` - see only Acme data
   - Login as `admin@techstart.com` - see only TechStart data
   - Data is completely isolated!

2. **Leave Management**
   - Login as employee
   - View leave balances: GET `/api/v1/leave/balances/employee/{employeeId}?year=2024`
   - Apply for leave: POST `/api/v1/leave/requests/apply`

3. **Approvals**
   - Login as manager
   - View pending approvals: GET `/api/v1/approvals/pending`
   - Approve/reject: POST `/api/v1/approvals/{id}/approve`

4. **Employee Management**
   - Login as HR admin
   - List employees: GET `/api/v1/employees`
   - Create employee: POST `/api/v1/employees`
   - Update employee: PATCH `/api/v1/employees/{id}`

5. **Dynamic Workflows**
   - View flows: GET `/api/v1/flows/definitions`
   - View flow steps: GET `/api/v1/flows/versions/{versionId}/steps`
   - Start a flow: POST `/api/v1/flows/execute/start`

---

## 🔧 Common Issues & Solutions

### Issue 1: "Database connection refused"

**Error Message:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
1. Verify PostgreSQL is running:
   ```bash
   # Linux/Mac
   sudo systemctl status postgresql

   # Mac (Homebrew)
   brew services list | grep postgresql

   # Windows
   # Check Services app for "postgresql" service
   ```

2. Start PostgreSQL if it's stopped:
   ```bash
   # Linux
   sudo systemctl start postgresql

   # Mac
   brew services start postgresql@14

   # Windows
   # Start from Services app
   ```

3. Check DATABASE_HOST in .env:
   - Should be `localhost` or `127.0.0.1`
   - Port should be `5432`

---

### Issue 2: "Port 3000 is already in use"

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

**Option A: Kill the process using port 3000**
```bash
# Find the process
lsof -i :3000

# Kill it (replace PID with actual process ID)
kill -9 PID
```

**Option B: Use a different port**
Edit `.env`:
```env
PORT=3001
```

Then restart the server.

---

### Issue 3: "Cannot find module '@nestjs/...'"

**Error Message:**
```
Error: Cannot find module '@nestjs/common'
```

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### Issue 4: "Seed script fails"

**Error Message:**
```
Error: relation "tenants" does not exist
```

**Solution:**

The database tables haven't been created yet.

1. Start the backend first (tables are auto-created):
   ```bash
   npm run start:dev
   ```

2. Wait for the message: "Nest application successfully started"

3. Stop the server (Ctrl+C)

4. Run seeds again:
   ```bash
   npm run seed
   ```

---

### Issue 5: "Authentication failed for user"

**Error Message:**
```
error: password authentication failed for user "postgres"
```

**Solution:**

1. **Check your PostgreSQL password**:
   - The password in `.env` must match your PostgreSQL setup

2. **Reset PostgreSQL password** (if needed):
   ```bash
   sudo -u postgres psql
   ALTER USER postgres WITH PASSWORD 'newpassword';
   \q
   ```

3. **Update .env** with the new password:
   ```env
   DATABASE_PASSWORD=newpassword
   ```

---

### Issue 6: "JWT token invalid"

**Error Message:**
```
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Solutions:**

1. **Token expired** - Login again to get a fresh token
2. **Wrong token** - Make sure you copied the entire token
3. **Missing 'Bearer'** - Authorization header should be:
   ```
   Authorization: Bearer YOUR_TOKEN
   ```

---

## 📚 Next Steps

### Explore the API

**Full API Documentation:**
- See `backend/README.md` for complete API reference
- 150+ endpoints across 15 modules
- All endpoints documented with request/response examples

**Key Endpoints:**

| Module | Endpoint | Description |
|--------|----------|-------------|
| Auth | POST `/api/v1/auth/login` | User login |
| Employees | GET `/api/v1/employees` | List employees |
| Leave | GET `/api/v1/leave/balances/employee/:id` | Get leave balances |
| Flows | GET `/api/v1/flows/definitions` | List workflows |
| Approvals | GET `/api/v1/approvals/pending` | Pending approvals |
| Dashboard | GET `/api/v1/dashboard/admin` | Admin dashboard |

---

### Test Advanced Features

1. **Create a new workflow**:
   - POST `/api/v1/flows/definitions`
   - Configure steps
   - Publish version

2. **Apply for leave**:
   - POST `/api/v1/leave/requests/apply`
   - Track approval workflow

3. **Configure policies**:
   - POST `/api/v1/policies`
   - Define business rules

---

### Development

**Start developing:**
```bash
# Watch mode (auto-reload on changes)
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod
```

**Code quality:**
```bash
# Linting
npm run lint

# Format code
npm run format
```

---

### Deployment

When ready to deploy to production:

1. **Read deployment guide**: `DEPLOYMENT-GUIDE.md`
2. **Choose platform**: Heroku, AWS, GCP, Railway, etc.
3. **Set environment variables** (production values)
4. **Disable synchronize** in TypeORM (use migrations)
5. **Use managed PostgreSQL** (RDS, Cloud SQL, etc.)

---

## 📖 Additional Resources

### Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| **Main README** | `/README.md` | Project overview |
| **Backend API Docs** | `/backend/README.md` | API reference |
| **Deployment Guide** | `/DEPLOYMENT-GUIDE.md` | Deploy anywhere |
| **Implementation Summary** | `/IMPLEMENTATION-SUMMARY.md` | Feature list |
| **Seed Documentation** | `/backend/src/database/seeds/README.md` | Demo data |

### Architecture Documents

Located in `/POC-Planning/`:
- POC Scope Document
- Requirements Specification
- Database Schema
- API Specification
- UI/UX Design Specification
- Technical Architecture
- Timeline & Milestones
- Task Breakdown
- Demo Scenarios
- Success Criteria

---

## 🎉 Congratulations!

You now have a **fully functional WisRight HRMS backend** running locally!

### What You Can Do:

✅ Login with 28 different demo users
✅ Test all 150+ API endpoints
✅ Explore multi-tenant isolation
✅ Create and execute workflows
✅ Manage employees and leave
✅ Test approval workflows
✅ View dashboards and analytics

### Current Status:

✅ **Backend**: 100% Complete (134 files, 12,430 LOC)
✅ **Database**: Fully seeded with demo data
✅ **API**: 150+ endpoints ready to use
📋 **Frontend**: Not implemented (next phase)

---

## 🆘 Need Help?

### Getting Support

1. **Check documentation**: Most answers are in the docs
2. **Review troubleshooting**: Common issues section above
3. **Check logs**: Backend terminal shows detailed errors
4. **Database logs**: PostgreSQL logs in `/var/log/postgresql/`
5. **Create an issue**: Report bugs in the repository

### Useful Commands

```bash
# View backend logs
npm run start:dev

# Check database connection
psql -U postgres -d wisright_hrms_poc

# Reset database (careful - deletes all data!)
dropdb wisright_hrms_poc
createdb wisright_hrms_poc
npm run seed

# View all tables
psql -U postgres -d wisright_hrms_poc -c "\dt"

# Check running processes
ps aux | grep node
```

---

## 🚀 Ready to Build the Frontend?

The backend is ready and waiting!

**Next phase**: Build React frontend to interact with these APIs.

**What you'll need:**
- React 18 + TypeScript
- Material-UI components
- Dynamic form renderer
- Flow stepper component
- Admin and user portals

**Stay tuned for frontend implementation!**

---

**Last Updated**: November 2025
**Version**: 1.0.0
**Status**: Backend Complete ✅

**Happy Coding! 🎊**
