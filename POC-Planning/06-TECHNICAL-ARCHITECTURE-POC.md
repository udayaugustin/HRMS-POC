# WisRight HRMS - POC Technical Architecture

## Technology Stack

### Backend
- Node.js 18+ with NestJS framework
- TypeScript for type safety
- PostgreSQL 14+ database
- TypeORM for database access
- JWT for authentication
- bcrypt for password hashing

### Frontend
- React 18+ with TypeScript
- Vite build tool
- Material-UI component library
- React Query for server state
- React Hook Form for forms
- React Router for navigation
- Axios for API calls

### Development Tools
- Git version control
- VS Code IDE
- Postman for API testing
- Docker for PostgreSQL (optional)

## Project Structure

### Backend Structure
```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/          # Guards, middleware, pipes
│   ├── config/          # Configuration
│   ├── database/        # Migrations, seeds
│   └── modules/
│       ├── auth/
│       ├── tenants/
│       ├── users/
│       ├── roles/
│       ├── employees/
│       ├── departments/
│       ├── designations/
│       ├── locations/
│       ├── flows/
│       ├── form-schemas/
│       ├── policies/
│       ├── leave/
│       ├── approvals/
│       ├── notifications/
│       └── dashboard/
```

### Frontend Structure
```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/           # Route configuration
│   ├── layouts/          # Layout components
│   ├── pages/            # Page components
│   │   ├── auth/
│   │   ├── admin/
│   │   └── user/
│   ├── components/       # Reusable components
│   ├── services/         # API services
│   ├── hooks/            # Custom hooks
│   ├── contexts/         # React contexts
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
```

## Key Technical Patterns

### Backend Patterns

#### Tenant Isolation
Every query must filter by tenant_id automatically using middleware

#### Permission Guard
Check user permissions before allowing controller actions

#### Dynamic Form Validation
Validate form submissions against JSON schemas

### Frontend Patterns

#### Dynamic Form Renderer
Render forms dynamically from JSON schema using React Hook Form

#### React Query Integration
Manage server state with caching and automatic refetching

#### Protected Routes
Wrap routes with authentication and permission checks

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Git

### Backend Setup
```bash
npx @nestjs/cli new backend
cd backend
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/jwt @nestjs/passport passport-jwt
npm install bcrypt class-validator class-transformer

# Configure .env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=wisright_hrms_poc
JWT_SECRET=your-secret-key

npm run start:dev
```

### Frontend Setup
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install @mui/material @emotion/react @emotion/styled
npm install react-router-dom
npm install @tanstack/react-query
npm install react-hook-form
npm install axios

# Configure .env
VITE_API_BASE_URL=http://localhost:3000/api/v1

npm run dev
```

## Environment Variables

### Backend .env
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=wisright_hrms_poc
JWT_SECRET=your-super-secret-key
JWT_EXPIRY=24h
PORT=3000
NODE_ENV=development
```

### Frontend .env
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=WisRight HRMS
```

