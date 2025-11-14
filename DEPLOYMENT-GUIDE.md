# 🚀 WisRight HRMS - Deployment Guide

Complete guide for deploying the WisRight HRMS POC in various environments.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
  - [Heroku](#heroku)
  - [Railway](#railway)
  - [AWS](#aws)
  - [Google Cloud](#google-cloud)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Post-Deployment Steps](#post-deployment-steps)
- [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Required Software
- **Node.js**: 18+ ([Download](https://nodejs.org/))
- **PostgreSQL**: 14+ ([Download](https://www.postgresql.org/))
- **npm**: 9+ (included with Node.js)
- **Git**: Latest version

### Optional Tools
- **Docker**: For containerized deployment
- **Postman**: For API testing
- **DBeaver** or **pgAdmin**: For database management

---

## 💻 Local Development Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/udayaugustin/HRMS-POC.git
cd HRMS-POC/backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup PostgreSQL Database

#### On Ubuntu/Debian
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE wisright_hrms_poc;
CREATE USER hrms_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE wisright_hrms_poc TO hrms_user;
\q
```

#### On macOS
```bash
# Install PostgreSQL via Homebrew
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Create database
psql postgres
CREATE DATABASE wisright_hrms_poc;
CREATE USER hrms_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE wisright_hrms_poc TO hrms_user;
\q
```

#### On Windows
```bash
# Download and install PostgreSQL from:
# https://www.postgresql.org/download/windows/

# Open pgAdmin or psql and run:
CREATE DATABASE wisright_hrms_poc;
CREATE USER hrms_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE wisright_hrms_poc TO hrms_user;
```

### Step 4: Configure Environment Variables
```bash
# Copy example environment file
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

Required environment variables:
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=hrms_user
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=wisright_hrms_poc

# JWT
JWT_SECRET=your-super-secret-jwt-key-CHANGE-THIS-IN-PRODUCTION
JWT_EXPIRY=24h

# Server
PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
```

### Step 5: Run Database Migrations & Seeds
```bash
# TypeORM will auto-create tables in development mode
# Run seeds to populate demo data
npm run seed
```

Expected output:
```
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

Database seeding completed successfully!
```

### Step 6: Start Development Server
```bash
npm run start:dev
```

Server will start at: `http://localhost:3000`

### Step 7: Verify Installation
```bash
# Test health endpoint
curl http://localhost:3000/api/v1

# Test login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.com","password":"Demo@123"}'
```

---

## 🐳 Docker Deployment

### Create Dockerfile

Create `Dockerfile` in `/backend` directory:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "run", "start:prod"]
```

### Create docker-compose.yml

Create `docker-compose.yml` in project root:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: hrms-postgres
    environment:
      POSTGRES_DB: wisright_hrms_poc
      POSTGRES_USER: hrms_user
      POSTGRES_PASSWORD: secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - hrms-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: hrms-backend
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USER: hrms_user
      DATABASE_PASSWORD: secure_password
      DATABASE_NAME: wisright_hrms_poc
      JWT_SECRET: your-jwt-secret-here
      JWT_EXPIRY: 24h
      PORT: 3000
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    networks:
      - hrms-network

volumes:
  postgres_data:

networks:
  hrms-network:
    driver: bridge
```

### Deploy with Docker
```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f backend

# Run seeds
docker-compose exec backend npm run seed

# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## ☁️ Cloud Deployment

### Heroku

#### 1. Install Heroku CLI
```bash
# macOS
brew install heroku/brew/heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

#### 2. Login to Heroku
```bash
heroku login
```

#### 3. Create Heroku App
```bash
cd backend
heroku create wisright-hrms-poc
```

#### 4. Add PostgreSQL
```bash
heroku addons:create heroku-postgresql:mini
```

#### 5. Set Environment Variables
```bash
heroku config:set JWT_SECRET=your-secure-jwt-secret
heroku config:set JWT_EXPIRY=24h
heroku config:set NODE_ENV=production
```

#### 6. Deploy
```bash
git push heroku main

# Or from a branch
git push heroku your-branch:main
```

#### 7. Run Seeds
```bash
heroku run npm run seed
```

#### 8. View Logs
```bash
heroku logs --tail
```

---

### Railway

#### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

#### 2. Login
```bash
railway login
```

#### 3. Initialize Project
```bash
cd backend
railway init
```

#### 4. Add PostgreSQL
```bash
railway add postgres
```

#### 5. Deploy
```bash
railway up
```

#### 6. Set Environment Variables
```bash
railway variables set JWT_SECRET=your-secure-jwt-secret
railway variables set JWT_EXPIRY=24h
railway variables set NODE_ENV=production
```

---

### AWS (Elastic Beanstalk)

#### 1. Install EB CLI
```bash
pip install awsebcli
```

#### 2. Initialize EB Application
```bash
cd backend
eb init -p node.js-18 wisright-hrms-poc
```

#### 3. Create Environment
```bash
eb create wisright-hrms-prod
```

#### 4. Set Environment Variables
```bash
eb setenv DATABASE_HOST=your-rds-endpoint \
          DATABASE_PORT=5432 \
          DATABASE_USER=hrms_user \
          DATABASE_PASSWORD=your-password \
          DATABASE_NAME=wisright_hrms_poc \
          JWT_SECRET=your-jwt-secret \
          NODE_ENV=production
```

#### 5. Deploy
```bash
eb deploy
```

#### 6. View Logs
```bash
eb logs
```

---

### Google Cloud Platform (Cloud Run)

#### 1. Build Container
```bash
cd backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/hrms-backend
```

#### 2. Deploy to Cloud Run
```bash
gcloud run deploy hrms-backend \
  --image gcr.io/YOUR_PROJECT_ID/hrms-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### 3. Set Environment Variables
```bash
gcloud run services update hrms-backend \
  --set-env-vars DATABASE_HOST=your-cloud-sql-ip \
  --set-env-vars JWT_SECRET=your-jwt-secret \
  --set-env-vars NODE_ENV=production
```

---

## 🗄️ Database Setup

### Production Database Recommendations

#### Managed PostgreSQL Services

1. **AWS RDS**
   - Instance type: db.t3.micro (POC) or db.t3.small (production)
   - Storage: 20GB SSD
   - Automated backups enabled
   - Multi-AZ for high availability

2. **Google Cloud SQL**
   - Machine type: db-f1-micro (POC) or db-n1-standard-1 (production)
   - Storage: 10GB SSD
   - Automated backups

3. **Azure Database for PostgreSQL**
   - Tier: Basic (POC) or General Purpose (production)
   - vCores: 1-2
   - Storage: 10-20GB

4. **Supabase**
   - Free tier available for POC
   - Includes real-time subscriptions
   - Built-in authentication

### Database Migration in Production

```bash
# Disable synchronize in production
# Edit src/app.module.ts:
synchronize: false  # IMPORTANT: Never true in production

# Generate migration
npm run migration:generate -- AddNewFeature

# Run migrations
npm run migration:run

# Revert if needed
npm run migration:revert
```

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| DATABASE_HOST | PostgreSQL host | localhost | Yes |
| DATABASE_PORT | PostgreSQL port | 5432 | Yes |
| DATABASE_USER | Database username | hrms_user | Yes |
| DATABASE_PASSWORD | Database password | secure_pass | Yes |
| DATABASE_NAME | Database name | wisright_hrms_poc | Yes |
| JWT_SECRET | Secret for JWT signing | random-32-char-string | Yes |
| JWT_EXPIRY | Token expiration | 24h | Yes |
| PORT | Server port | 3000 | Yes |
| NODE_ENV | Environment | production | Yes |
| FRONTEND_URL | Frontend URL for CORS | https://app.wisright.com | No |

### Generating Secure JWT Secret

```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 3: Online
# Visit: https://randomkeygen.com/
```

---

## ✅ Post-Deployment Steps

### 1. Verify Deployment
```bash
# Check health endpoint
curl https://your-domain.com/api/v1

# Test authentication
curl -X POST https://your-domain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.com","password":"Demo@123"}'
```

### 2. Run Database Seeds (First Time Only)
```bash
npm run seed
```

### 3. Change Default Passwords
```bash
# Login as admin and change password via API
curl -X PATCH https://your-domain.com/api/v1/users/me/password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"Demo@123","newPassword":"NewSecurePassword@456"}'
```

### 4. Setup Monitoring
- Configure application monitoring (New Relic, DataDog)
- Setup error tracking (Sentry)
- Enable database monitoring
- Configure log aggregation

### 5. Setup Backups
```bash
# Automated PostgreSQL backups
# AWS RDS: Enabled by default
# Manual backup:
pg_dump -h your-host -U hrms_user wisright_hrms_poc > backup_$(date +%Y%m%d).sql
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:**
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check DATABASE_HOST and DATABASE_PORT in .env
- Verify database user has proper permissions
- Check firewall settings

#### 2. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run start:dev
```

#### 3. JWT Secret Not Set
```
Error: JWT_SECRET is not defined
```
**Solution:**
- Verify .env file exists
- Check JWT_SECRET is set in .env
- Restart application after changing .env

#### 4. Seed Script Fails
```
Error: relation "tenants" does not exist
```
**Solution:**
```bash
# Ensure database tables are created first
# In development, synchronize:true creates tables automatically
# Or run application once to create tables, then run seeds
npm run start:dev
# Ctrl+C after tables are created
npm run seed
```

#### 5. TypeORM Connection Issues
```
Error: password authentication failed for user "hrms_user"
```
**Solution:**
- Verify DATABASE_USER and DATABASE_PASSWORD match
- Reset PostgreSQL password if needed:
```bash
sudo -u postgres psql
ALTER USER hrms_user WITH PASSWORD 'new_password';
\q
```

### Performance Optimization

#### 1. Database Indexing
```sql
-- Already included in entities, but verify:
CREATE INDEX idx_employees_tenant ON employees(tenant_id);
CREATE INDEX idx_users_email ON users(tenant_id, email);
CREATE INDEX idx_flow_instances_status ON flow_instances(tenant_id, status);
```

#### 2. Connection Pooling
Edit `src/app.module.ts`:
```typescript
TypeOrmModule.forRoot({
  // ... other config
  extra: {
    max: 20,              // Maximum connections
    min: 5,               // Minimum connections
    idleTimeoutMillis: 30000,
  },
}),
```

#### 3. Enable Query Caching
```typescript
// In TypeORM repository calls
findAll({ cache: true, cache: 60000 }); // Cache for 60 seconds
```

---

## 📞 Support

If you encounter issues not covered in this guide:

1. Check backend logs: `npm run start:dev` (development) or `docker logs hrms-backend` (Docker)
2. Review database logs: `tail -f /var/log/postgresql/postgresql-14-main.log`
3. Consult documentation in `backend/README.md`
4. Create an issue in the repository

---

## 🎯 Production Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Set secure JWT_SECRET (32+ characters)
- [ ] Disable TypeORM synchronize (set to false)
- [ ] Use environment variables for all secrets
- [ ] Enable SSL/TLS for database connections
- [ ] Setup automated backups
- [ ] Configure monitoring and alerting
- [ ] Enable CORS only for your frontend domain
- [ ] Setup rate limiting
- [ ] Enable security headers
- [ ] Review and update all permissions
- [ ] Setup CI/CD pipeline
- [ ] Perform security audit
- [ ] Load testing
- [ ] Document disaster recovery plan

---

**Last Updated**: November 2025
**Version**: 1.0.0
