import { DataSource } from 'typeorm';
import { Tenant } from '../../modules/tenants/entities/tenant.entity';
import { Department } from '../../modules/departments/entities/department.entity';
import { Designation } from '../../modules/designations/entities/designation.entity';
import { Location } from '../../modules/locations/entities/location.entity';
import { User } from '../../modules/users/entities/user.entity';

export async function seedMasterData(dataSource: DataSource): Promise<void> {
  console.log('Seeding master data...');

  const tenantRepository = dataSource.getRepository(Tenant);
  const departmentRepository = dataSource.getRepository(Department);
  const designationRepository = dataSource.getRepository(Designation);
  const locationRepository = dataSource.getRepository(Location);
  const userRepository = dataSource.getRepository(User);

  const tenants = await tenantRepository.find();

  // Departments
  const departmentsData = [
    { name: 'Engineering', code: 'ENG' },
    { name: 'Human Resources', code: 'HR' },
    { name: 'Sales', code: 'SALES' },
    { name: 'Marketing', code: 'MKT' },
    { name: 'Finance', code: 'FIN' },
    { name: 'Operations', code: 'OPS' },
  ];

  // Designations
  const designationsData = [
    { title: 'Chief Executive Officer', code: 'CEO', level: 1 },
    { title: 'Vice President', code: 'VP', level: 2 },
    { title: 'Senior Manager', code: 'SM', level: 3 },
    { title: 'Manager', code: 'MGR', level: 4 },
    { title: 'Team Lead', code: 'TL', level: 5 },
    { title: 'Senior Software Engineer', code: 'SSE', level: 6 },
    { title: 'Software Engineer', code: 'SE', level: 7 },
    { title: 'Junior Software Engineer', code: 'JSE', level: 8 },
    { title: 'HR Manager', code: 'HRM', level: 4 },
    { title: 'HR Executive', code: 'HRE', level: 7 },
    { title: 'Sales Manager', code: 'SM', level: 4 },
    { title: 'Sales Executive', code: 'SE', level: 7 },
    { title: 'Marketing Manager', code: 'MM', level: 4 },
    { title: 'Marketing Executive', code: 'ME', level: 7 },
    { title: 'Finance Manager', code: 'FM', level: 4 },
    { title: 'Accountant', code: 'ACC', level: 7 },
  ];

  // Locations
  const locationsData = [
    {
      name: 'Headquarters',
      code: 'HQ',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      country: 'USA',
    },
    {
      name: 'West Coast Office',
      code: 'WC',
      address: '456 Tech Boulevard',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
    },
    {
      name: 'Development Center',
      code: 'DC',
      address: '789 Innovation Drive',
      city: 'Austin',
      state: 'TX',
      country: 'USA',
    },
    {
      name: 'Remote',
      code: 'REMOTE',
      address: 'N/A',
      city: 'N/A',
      state: 'N/A',
      country: 'N/A',
    },
  ];

  for (const tenant of tenants) {
    console.log(`\nSeeding master data for tenant: ${tenant.name}`);

    // Seed Departments
    console.log('\n  Seeding Departments:');
    const departmentMap = new Map<string, string>();

    for (const deptData of departmentsData) {
      let department = await departmentRepository.findOne({
        where: { tenantId: tenant.id, code: deptData.code },
      });

      if (!department) {
        // Find a manager user for the department
        const managerUser = await userRepository
          .createQueryBuilder('user')
          .innerJoin('user.userRoles', 'userRole')
          .innerJoin('userRole.role', 'role')
          .where('user.tenantId = :tenantId', { tenantId: tenant.id })
          .andWhere('role.code = :roleCode', { roleCode: 'MANAGER' })
          .getOne();

        department = departmentRepository.create({
          tenantId: tenant.id,
          name: deptData.name,
          code: deptData.code,
          managerId: managerUser?.id || null,
          isActive: true,
        });
        await departmentRepository.save(department);
        console.log(`    ✓ Created department: ${deptData.name}`);
      } else {
        console.log(`    - Department already exists: ${deptData.name}`);
      }
      departmentMap.set(deptData.code, department.id);
    }

    // Seed Designations
    console.log('\n  Seeding Designations:');
    for (const desigData of designationsData) {
      let designation = await designationRepository.findOne({
        where: { tenantId: tenant.id, code: desigData.code },
      });

      if (!designation) {
        designation = designationRepository.create({
          tenantId: tenant.id,
          title: desigData.title,
          code: desigData.code,
          level: desigData.level,
          description: `${desigData.title} position`,
          isActive: true,
        });
        await designationRepository.save(designation);
        console.log(`    ✓ Created designation: ${desigData.title}`);
      } else {
        console.log(`    - Designation already exists: ${desigData.title}`);
      }
    }

    // Seed Locations
    console.log('\n  Seeding Locations:');
    for (const locData of locationsData) {
      let location = await locationRepository.findOne({
        where: { tenantId: tenant.id, code: locData.code },
      });

      if (!location) {
        location = locationRepository.create({
          tenantId: tenant.id,
          name: locData.name,
          code: locData.code,
          address: locData.address,
          city: locData.city,
          state: locData.state,
          country: locData.country,
          isActive: true,
        });
        await locationRepository.save(location);
        console.log(`    ✓ Created location: ${locData.name}`);
      } else {
        console.log(`    - Location already exists: ${locData.name}`);
      }
    }
  }

  console.log('\nMaster data seeding completed.\n');
}
