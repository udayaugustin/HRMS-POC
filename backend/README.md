# WisRight HRMS POC - Backend

A robust, multi-tenant Human Resource Management System (HRMS) backend built with modern technologies and best practices. This Proof of Concept demonstrates a scalable, enterprise-grade HRMS solution with comprehensive features for employee management, leave management, approvals, and policy enforcement.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features/Modules Implemented](#featuresmodules-implemented)
- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Multi-Tenant Architecture](#multi-tenant-architecture)
- [Authentication & Authorization](#authentication--authorization)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Project Overview

WisRight HRMS POC is a comprehensive backend solution designed to handle multiple organizations (tenants) within a single application instance. It provides a complete set of HRMS functionalities including:

- Employee lifecycle management
- Leave management with configurable policies
- Workflow-based approvals
- Role-based access control (RBAC)
- Dynamic form schemas for extensibility
- Real-time notifications
- Dashboard analytics

The system is built with a focus on security, scalability, and maintainability, making it suitable for enterprise deployments.

---

## Tech Stack

### Core Framework & Language
- **NestJS** (v10.x) - Progressive Node.js framework for building efficient, scalable server-side applications
- **TypeScript** (v5.x) - Strongly typed JavaScript for enhanced developer experience and code quality

### Database & ORM
- **PostgreSQL** (v14+) - Open-source relational database
- **TypeORM** (v0.3.x) - Object-Relational Mapper for TypeScript and JavaScript

### Authentication & Security
- **Passport JWT** (v4.x) - JWT authentication strategy for Passport
- **bcrypt** (v5.x) - Password hashing library
- **class-validator** (v0.14.x) - Decorator-based validation library
- **class-transformer** (v0.5.x) - Object transformation library

### Development Tools
- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting
- **ts-node** - TypeScript execution environment

---

## Features/Modules Implemented

### 1. Authentication & Authorization
- JWT-based authentication
- Secure password hashing with bcrypt
- Token refresh mechanism
- User registration and login

### 2. Multi-Tenant Management
- Tenant creation and configuration
- Subdomain-based tenant identification
- Tenant-specific settings (JSONB)
- Complete data isolation per tenant

### 3. User Management
- User CRUD operations
- User-role associations
- Profile management
- Activity tracking (last login)

### 4. Role-Based Access Control (RBAC)
- Dynamic role creation
- Permission management
- Role-user associations
- Permission-based route guards

### 5. Employee Management
- Comprehensive employee profiles
- Department and designation assignments
- Location tracking
- Employee hierarchy

### 6. Organizational Structure
- **Departments**: Create and manage organizational departments
- **Designations**: Define job titles and positions
- **Locations**: Manage office locations and branches

### 7. Leave Management
- Multiple leave types (Casual, Sick, Earned, etc.)
- Leave balance tracking
- Leave request submission and approval
- Policy-based leave calculations
- Leave history and reporting

### 8. Workflow Engine
- Dynamic flow definitions
- Multi-step approval workflows
- Conditional routing
- Flow instance tracking
- Step-level status management

### 9. Policy Management
- Configurable HR policies
- Policy versioning
- Policy enforcement engine
- Tenant-specific policy rules

### 10. Approvals System
- Multi-level approval chains
- Approval delegation
- Approval history tracking
- Status management (Pending, Approved, Rejected)

### 11. Notifications
- Real-time notification system
- Multiple notification types
- Read/unread status tracking
- User-specific notifications

### 12. Form Schemas
- Dynamic form definitions
- Field-level validation rules
- Reusable form templates
- JSONB-based flexible schema storage

### 13. Dashboard & Analytics
- Summary statistics
- Tenant-specific analytics
- Real-time data aggregation

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18.x or higher) - [Download](https://nodejs.org/)
- **npm** (v9.x or higher) - Comes with Node.js
- **PostgreSQL** (v14.x or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/downloads)

### Verify Installation

```bash
node --version    # Should show v18.x or higher
npm --version     # Should show v9.x or higher
psql --version    # Should show PostgreSQL 14 or higher
```

---

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd HRMS-POC/backend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages defined in `package.json`.

### 3. Configure Environment Variables

Copy the example environment file and update it with your configuration:

```bash
cp .env.example .env
```

Edit the `.env` file with your specific configuration (see [Environment Variables](#environment-variables) section).

### 4. Setup Database

Create a PostgreSQL database for the application:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE wisright_hrms_poc;

# Grant privileges (if needed)
GRANT ALL PRIVILEGES ON DATABASE wisright_hrms_poc TO postgres;

# Exit PostgreSQL
\q
```

### 5. Run Database Migrations (if available)

```bash
npm run migration:run
```

### 6. Seed Initial Data (Optional)

```bash
npm run seed
```

---

## Environment Variables

Create a `.env` file in the backend root directory with the following configuration:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=wisright_hrms_poc

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=24h

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### Configuration Details

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_HOST` | PostgreSQL server hostname | `localhost` | Yes |
| `DATABASE_PORT` | PostgreSQL server port | `5432` | Yes |
| `DATABASE_USER` | Database username | `postgres` | Yes |
| `DATABASE_PASSWORD` | Database password | - | Yes |
| `DATABASE_NAME` | Database name | `wisright_hrms_poc` | Yes |
| `JWT_SECRET` | Secret key for JWT signing | - | Yes |
| `JWT_EXPIRY` | JWT token expiration time | `24h` | Yes |
| `PORT` | Application server port | `3000` | No |
| `NODE_ENV` | Environment mode | `development` | No |
| `FRONTEND_URL` | Frontend application URL for CORS | `http://localhost:5173` | No |

**Security Note**:
- Always use a strong, random string for `JWT_SECRET` in production
- Never commit `.env` file to version control
- Use different credentials for development and production environments

---

## Database Setup

### PostgreSQL Installation

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS (using Homebrew)
```bash
brew install postgresql
brew services start postgresql
```

#### Windows
Download and install from [PostgreSQL Official Website](https://www.postgresql.org/download/windows/)

### Database Creation

```bash
# Method 1: Using psql command line
createdb -U postgres wisright_hrms_poc

# Method 2: Using SQL
psql -U postgres
CREATE DATABASE wisright_hrms_poc;
\q
```

### Database Schema

The application uses TypeORM with automatic synchronization in development mode. When you start the application in development mode (`NODE_ENV=development`), TypeORM will automatically create tables based on your entity definitions.

**Production Note**: Set `synchronize: false` in production and use migrations instead.

### Verify Database Connection

```bash
psql -U postgres -d wisright_hrms_poc -c "SELECT version();"
```

---

## Running the Application

### Development Mode

Start the application with hot-reload enabled:

```bash
npm run start:dev
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

API base URL: `http://localhost:3000/api/v1`

### Debug Mode

Start with debugging enabled:

```bash
npm run start:debug
```

This enables Node.js inspector for debugging with Chrome DevTools or VS Code.

### Production Mode

First, build the application:

```bash
npm run build
```

Then start the production server:

```bash
npm run start:prod
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Start the application |
| `npm run start:dev` | Start in development mode with watch mode |
| `npm run start:debug` | Start in debug mode with watch mode |
| `npm run start:prod` | Start the production build |
| `npm run build` | Build the application for production |
| `npm run format` | Format code using Prettier |
| `npm run lint` | Lint and fix code using ESLint |
| `npm run typeorm` | Run TypeORM CLI commands |
| `npm run migration:generate` | Generate a new migration |
| `npm run migration:run` | Run pending migrations |
| `npm run migration:revert` | Revert the last migration |
| `npm run seed` | Seed the database with initial data |

---

## API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

All API endpoints are prefixed with `/api/v1`.

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Module Endpoints Overview

#### 1. Authentication (`/auth`)
```
POST   /api/v1/auth/register      - Register new user
POST   /api/v1/auth/login         - Login user
GET    /api/v1/auth/profile       - Get current user profile (Protected)
```

**Example: Login Request**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "tenantId": "tenant-uuid"
  }
}
```

#### 2. Tenants (`/tenants`)
```
GET    /api/v1/tenants            - Get all tenants (Admin)
POST   /api/v1/tenants            - Create new tenant (Admin)
GET    /api/v1/tenants/:id        - Get tenant by ID
PATCH  /api/v1/tenants/:id        - Update tenant
DELETE /api/v1/tenants/:id        - Delete tenant (Admin)
```

#### 3. Users (`/users`)
```
GET    /api/v1/users              - Get all users (Tenant-scoped)
POST   /api/v1/users              - Create new user
GET    /api/v1/users/:id          - Get user by ID
PATCH  /api/v1/users/:id          - Update user
DELETE /api/v1/users/:id          - Delete user
```

#### 4. Roles (`/roles`)
```
GET    /api/v1/roles              - Get all roles
POST   /api/v1/roles              - Create new role
GET    /api/v1/roles/:id          - Get role by ID
PATCH  /api/v1/roles/:id          - Update role
DELETE /api/v1/roles/:id          - Delete role
```

#### 5. Employees (`/employees`)
```
GET    /api/v1/employees          - Get all employees
POST   /api/v1/employees          - Create new employee
GET    /api/v1/employees/:id      - Get employee by ID
PATCH  /api/v1/employees/:id      - Update employee
DELETE /api/v1/employees/:id      - Delete employee
```

#### 6. Departments (`/departments`)
```
GET    /api/v1/departments        - Get all departments
POST   /api/v1/departments        - Create new department
GET    /api/v1/departments/:id    - Get department by ID
PATCH  /api/v1/departments/:id    - Update department
DELETE /api/v1/departments/:id    - Delete department
```

#### 7. Designations (`/designations`)
```
GET    /api/v1/designations       - Get all designations
POST   /api/v1/designations       - Create new designation
GET    /api/v1/designations/:id   - Get designation by ID
PATCH  /api/v1/designations/:id   - Update designation
DELETE /api/v1/designations/:id   - Delete designation
```

#### 8. Locations (`/locations`)
```
GET    /api/v1/locations          - Get all locations
POST   /api/v1/locations          - Create new location
GET    /api/v1/locations/:id      - Get location by ID
PATCH  /api/v1/locations/:id      - Update location
DELETE /api/v1/locations/:id      - Delete location
```

#### 9. Leave Management (`/leave`)
```
GET    /api/v1/leave/types        - Get all leave types
POST   /api/v1/leave/types        - Create leave type
GET    /api/v1/leave/requests     - Get leave requests
POST   /api/v1/leave/requests     - Create leave request
GET    /api/v1/leave/balances     - Get leave balances
PATCH  /api/v1/leave/requests/:id - Update leave request
```

#### 10. Workflows (`/flows`)
```
GET    /api/v1/flows              - Get all flow definitions
POST   /api/v1/flows              - Create flow definition
GET    /api/v1/flows/:id          - Get flow by ID
PATCH  /api/v1/flows/:id          - Update flow
GET    /api/v1/flows/instances    - Get flow instances
```

#### 11. Policies (`/policies`)
```
GET    /api/v1/policies           - Get all policies
POST   /api/v1/policies           - Create policy
GET    /api/v1/policies/:id       - Get policy by ID
PATCH  /api/v1/policies/:id       - Update policy
DELETE /api/v1/policies/:id       - Delete policy
```

#### 12. Approvals (`/approvals`)
```
GET    /api/v1/approvals          - Get all approvals
POST   /api/v1/approvals          - Create approval
PATCH  /api/v1/approvals/:id      - Update approval status
GET    /api/v1/approvals/pending  - Get pending approvals
```

#### 13. Notifications (`/notifications`)
```
GET    /api/v1/notifications      - Get user notifications
PATCH  /api/v1/notifications/:id  - Mark as read
DELETE /api/v1/notifications/:id  - Delete notification
```

#### 14. Form Schemas (`/form-schemas`)
```
GET    /api/v1/form-schemas       - Get all form schemas
POST   /api/v1/form-schemas       - Create form schema
GET    /api/v1/form-schemas/:id   - Get form schema by ID
PATCH  /api/v1/form-schemas/:id   - Update form schema
```

#### 15. Dashboard (`/dashboard`)
```
GET    /api/v1/dashboard/stats    - Get dashboard statistics
GET    /api/v1/dashboard/summary  - Get summary data
```

### Response Format

All API responses follow a consistent structure:

**Success Response:**
```json
{
  "data": { ... },
  "message": "Success message",
  "statusCode": 200
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

---

## Project Structure

```
backend/
├── dist/                      # Compiled JavaScript output
├── node_modules/              # Dependencies
├── src/
│   ├── common/                # Shared utilities
│   │   ├── decorators/        # Custom decorators
│   │   │   └── permissions.decorator.ts
│   │   ├── guards/            # Route guards
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── permissions.guard.ts
│   │   └── middleware/        # Custom middleware
│   │       └── tenant.middleware.ts
│   │
│   ├── config/                # Configuration files
│   │
│   ├── database/              # Database related files
│   │   ├── migrations/        # Database migrations
│   │   └── seeds/             # Seed data scripts
│   │
│   ├── modules/               # Feature modules
│   │   ├── approvals/         # Approval management
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   ├── approvals.controller.ts
│   │   │   ├── approvals.service.ts
│   │   │   └── approvals.module.ts
│   │   │
│   │   ├── auth/              # Authentication & Authorization
│   │   │   ├── dto/
│   │   │   ├── strategies/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── dashboard/         # Dashboard & Analytics
│   │   ├── departments/       # Department management
│   │   ├── designations/      # Designation management
│   │   ├── employees/         # Employee management
│   │   ├── flows/             # Workflow engine
│   │   ├── form-schemas/      # Dynamic form schemas
│   │   ├── leave/             # Leave management
│   │   ├── locations/         # Location management
│   │   ├── notifications/     # Notification system
│   │   ├── policies/          # Policy management
│   │   ├── roles/             # Role & permissions
│   │   ├── tenants/           # Tenant management
│   │   └── users/             # User management
│   │
│   ├── app.module.ts          # Root application module
│   └── main.ts                # Application entry point
│
├── .env                       # Environment variables (not in git)
├── .env.example               # Example environment file
├── .gitignore                 # Git ignore rules
├── nest-cli.json              # NestJS CLI configuration
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

### Module Structure Pattern

Each module follows a consistent structure:

```
module-name/
├── dto/                       # Data Transfer Objects
│   ├── create-*.dto.ts
│   ├── update-*.dto.ts
│   └── filter-*.dto.ts
├── entities/                  # TypeORM entities
│   └── *.entity.ts
├── *.controller.ts            # HTTP request handlers
├── *.service.ts               # Business logic
└── *.module.ts                # Module definition
```

---

## Multi-Tenant Architecture

### Overview

The application implements a **shared database, shared schema** multi-tenancy approach where:
- All tenants share the same database and tables
- Each row is associated with a `tenantId`
- Complete data isolation is enforced at the application level

### Key Components

#### 1. Tenant Entity

The `Tenant` entity serves as the root of the multi-tenant hierarchy:

```typescript
@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  subdomain: string;

  @Column()
  name: string;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  // All related entities
  @OneToMany(() => User, user => user.tenant)
  users: User[];
  // ... other relationships
}
```

#### 2. Tenant Middleware

The `TenantMiddleware` extracts `tenantId` from JWT token and attaches it to the request:

```typescript
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const payload = this.jwtService.verify(token);

    req.tenantId = payload.tenantId;
    req.user = {
      userId: payload.userId,
      tenantId: payload.tenantId,
      email: payload.email,
      roles: payload.roles
    };

    next();
  }
}
```

#### 3. Tenant-Scoped Entities

All entities include a `tenantId` column with indexes for performance:

```typescript
@Entity('users')
@Index('idx_users_tenant', ['tenantId'])
@Index(['tenantId', 'email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column()
  email: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  tenant: Tenant;
  // ... other fields
}
```

#### 4. Data Isolation in Services

Services must always filter by `tenantId`:

```typescript
@Injectable()
export class UsersService {
  async findAll(tenantId: string) {
    return this.usersRepository.find({
      where: { tenantId }
    });
  }

  async findOne(id: string, tenantId: string) {
    return this.usersRepository.findOne({
      where: { id, tenantId }
    });
  }
}
```

### Benefits

- **Cost Effective**: Single database instance for all tenants
- **Easy Maintenance**: Single codebase and database schema
- **Data Isolation**: Strict tenant-level data segregation
- **Performance**: Proper indexing ensures fast queries
- **Scalability**: Horizontal scaling through database replication

### Security Considerations

1. **Never trust client input**: Always extract `tenantId` from authenticated JWT token
2. **Always filter by tenant**: Every database query must include tenant filter
3. **Cascade deletes**: Use `onDelete: 'CASCADE'` to maintain referential integrity
4. **Unique constraints**: Apply uniqueness within tenant scope (e.g., `[tenantId, email]`)

---

## Authentication & Authorization

### Authentication Flow

1. **User Registration**
   - User submits registration with email, password, and tenant info
   - Password is hashed using bcrypt (10 salt rounds)
   - User record created in database
   - JWT token generated and returned

2. **User Login**
   - User submits email and password
   - Credentials validated against database
   - Password verified using bcrypt
   - JWT token generated with user info and tenant context
   - Token returned to client

3. **Protected Routes**
   - Client includes JWT token in Authorization header
   - `JwtAuthGuard` validates token
   - `TenantMiddleware` extracts tenant context
   - Request proceeds with authenticated user info

### JWT Token Structure

```typescript
{
  userId: "uuid",
  email: "user@example.com",
  tenantId: "tenant-uuid",
  roles: ["Admin", "Manager"],
  iat: 1234567890,
  exp: 1234654290
}
```

### Guards

#### 1. JWT Auth Guard

Validates JWT token and ensures user is authenticated:

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@Request() req) {
  return req.user;
}
```

#### 2. Permissions Guard

Checks if user has required permissions:

```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('users:read')
@Get()
async findAll() {
  // Only users with 'users:read' permission can access
}
```

### Role-Based Access Control (RBAC)

The system implements a flexible RBAC model:

```
User -> UserRole -> Role -> Permissions
```

**Key Entities:**
- `User`: Individual user account
- `Role`: Named role (e.g., "Admin", "Manager", "Employee")
- `UserRole`: Junction table linking users to roles
- `Permission`: Granular permissions (e.g., "users:read", "employees:write")

**Example Usage:**

```typescript
// Protect route with permission
@RequirePermissions('employees:create')
@Post()
async create(@Body() dto: CreateEmployeeDto) {
  // Only users with 'employees:create' permission
}
```

### Password Security

- **Hashing**: bcrypt with 10 salt rounds
- **No plain text**: Passwords never stored in plain text
- **Validation**: Minimum 8 characters (configurable in DTO)

---

## Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

### Writing Tests

Example test structure:

```typescript
describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

**Note**: Comprehensive test suites are under development. Contributions welcome!

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check database credentials in `.env`
- Ensure database exists: `psql -U postgres -l`
- Check if PostgreSQL is listening on correct port: `sudo netstat -plnt | grep 5432`

#### 2. Port Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**
- Change `PORT` in `.env` file
- Kill process using the port: `lsof -ti:3000 | xargs kill -9`
- Or use different port: `PORT=3001 npm run start:dev`

#### 3. JWT Token Invalid

**Symptoms:**
```
401 Unauthorized: Invalid token
```

**Solutions:**
- Verify `JWT_SECRET` matches between environments
- Check token hasn't expired
- Ensure token is included in Authorization header: `Bearer <token>`
- Clear old tokens and login again

#### 4. TypeORM Synchronization Issues

**Symptoms:**
```
Error: relation "table_name" does not exist
```

**Solutions:**
- Ensure `synchronize: true` in development (app.module.ts)
- Drop and recreate database if needed
- Run migrations: `npm run migration:run`
- Check entity imports in app.module.ts

#### 5. Module Not Found Errors

**Symptoms:**
```
Error: Cannot find module '@nestjs/...'
```

**Solutions:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`
- Check Node.js version compatibility

### Debug Mode

Enable detailed logging:

```bash
# Set environment variable
NODE_ENV=development npm run start:debug

# Or in .env
NODE_ENV=development
```

### Database Query Logging

TypeORM logging is automatically enabled in development mode. To enable in production:

```typescript
// app.module.ts
TypeOrmModule.forRoot({
  // ...
  logging: true,
  logger: 'advanced-console'
})
```

### Check Application Health

```bash
# Check if server is responding
curl http://localhost:3000/api/v1/health

# Check database connection
psql -U postgres -d wisright_hrms_poc -c "SELECT 1;"
```

### Getting Help

If you encounter issues not covered here:

1. Check application logs
2. Verify environment configuration
3. Review NestJS documentation: https://docs.nestjs.com
4. Review TypeORM documentation: https://typeorm.io
5. Contact the development team

---

## License

**UNLICENSED**

This is proprietary software. All rights reserved.

This software is provided for evaluation purposes only as part of the WisRight HRMS Proof of Concept. Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited without explicit written permission from the copyright holder.

---

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

---

**Version**: 1.0.0
**Last Updated**: 2025-11-13
**Maintained By**: WisRight HRMS Development Team
