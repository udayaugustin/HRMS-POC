import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { seedTenants } from './01-seed-tenants';
import { seedRoles } from './02-seed-roles';
import { seedUsers } from './03-seed-users';
import { seedMasterData } from './04-seed-master-data';
import { seedEmployees } from './05-seed-employees';
import { seedLeaveTypes } from './06-seed-leave-types';
import { seedLeaveBalances } from './07-seed-leave-balances';
import { seedFlows } from './08-seed-flows';
import { seedFormSchemas } from './09-seed-form-schemas';
import { seedPolicies } from './10-seed-policies';

// Load environment variables
dotenv.config();

async function runSeeds() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  WisRight HRMS - Database Seeding');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Create database connection
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'wisright_hrms',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: false,
  });

  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('✓ Database connected successfully\n');

    const startTime = Date.now();

    // Run seeds in order
    await seedTenants(dataSource);
    await seedRoles(dataSource);
    await seedUsers(dataSource);
    await seedMasterData(dataSource);
    await seedEmployees(dataSource);
    await seedLeaveTypes(dataSource);
    await seedFormSchemas(dataSource); // Run before flows as flows depend on form schemas
    await seedFlows(dataSource);
    await seedLeaveBalances(dataSource);
    await seedPolicies(dataSource);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✓ All seeds completed successfully in ${duration}s`);
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('Summary:');
    console.log('  - 2 Tenants created (acme, techstart)');
    console.log('  - 4 Roles per tenant (SUPER_ADMIN, HR_ADMIN, MANAGER, EMPLOYEE)');
    console.log('  - 14 Users per tenant (1 admin, 1 HR, 2 managers, 10 employees)');
    console.log('  - Default password for all users: Demo@123');
    console.log('  - 6 Departments, 16 Designations, 4 Locations per tenant');
    console.log('  - Employee records linked to all users');
    console.log('  - 7 Leave types with balances initialized');
    console.log('  - 5 Form schemas for various workflows');
    console.log('  - 2 Flows (ONBOARDING, LEAVE_APPROVAL) with steps');
    console.log('  - 5 Policies (Leave, WFH, Onboarding)\n');

    console.log('Sample Login Credentials:');
    console.log('  Acme Corporation:');
    console.log('    - Super Admin: admin@acme.com / Demo@123');
    console.log('    - HR Admin: hr@acme.com / Demo@123');
    console.log('    - Manager: manager1@acme.com / Demo@123');
    console.log('    - Employee: emp1@acme.com / Demo@123');
    console.log('\n  TechStart Inc:');
    console.log('    - Super Admin: admin@techstart.com / Demo@123');
    console.log('    - HR Admin: hr@techstart.com / Demo@123');
    console.log('    - Manager: manager1@techstart.com / Demo@123');
    console.log('    - Employee: emp1@techstart.com / Demo@123');
    console.log('\n');
  } catch (error) {
    console.error('\n✗ Error during seeding:');
    console.error(error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Database connection closed.');
    }
  }
}

// Run the seeds
runSeeds()
  .then(() => {
    console.log('Seeding process completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding process failed:', error);
    process.exit(1);
  });
