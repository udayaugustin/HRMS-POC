import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Tenant } from '../../modules/tenants/entities/tenant.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { UserRole } from '../../modules/roles/entities/user-role.entity';

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  roleCode: string;
}

export async function seedUsers(dataSource: DataSource): Promise<void> {
  console.log('Seeding users...');

  const tenantRepository = dataSource.getRepository(Tenant);
  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);
  const userRoleRepository = dataSource.getRepository(UserRole);

  // Hash the default password
  const defaultPassword = 'Demo@123';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const tenants = await tenantRepository.find();

  const usersData: UserData[] = [
    // 1 Super Admin
    {
      email: 'admin@{subdomain}.com',
      firstName: 'Super',
      lastName: 'Admin',
      roleCode: 'SUPER_ADMIN',
    },
    // 1 HR Admin
    {
      email: 'hr@{subdomain}.com',
      firstName: 'HR',
      lastName: 'Administrator',
      roleCode: 'HR_ADMIN',
    },
    // 2 Managers
    {
      email: 'manager1@{subdomain}.com',
      firstName: 'John',
      lastName: 'Manager',
      roleCode: 'MANAGER',
    },
    {
      email: 'manager2@{subdomain}.com',
      firstName: 'Sarah',
      lastName: 'Williams',
      roleCode: 'MANAGER',
    },
    // 10 Employees
    {
      email: 'emp1@{subdomain}.com',
      firstName: 'Alice',
      lastName: 'Johnson',
      roleCode: 'EMPLOYEE',
    },
    {
      email: 'emp2@{subdomain}.com',
      firstName: 'Bob',
      lastName: 'Smith',
      roleCode: 'EMPLOYEE',
    },
    {
      email: 'emp3@{subdomain}.com',
      firstName: 'Charlie',
      lastName: 'Brown',
      roleCode: 'EMPLOYEE',
    },
    {
      email: 'emp4@{subdomain}.com',
      firstName: 'Diana',
      lastName: 'Davis',
      roleCode: 'EMPLOYEE',
    },
    {
      email: 'emp5@{subdomain}.com',
      firstName: 'Edward',
      lastName: 'Wilson',
      roleCode: 'EMPLOYEE',
    },
    {
      email: 'emp6@{subdomain}.com',
      firstName: 'Fiona',
      lastName: 'Martinez',
      roleCode: 'EMPLOYEE',
    },
    {
      email: 'emp7@{subdomain}.com',
      firstName: 'George',
      lastName: 'Anderson',
      roleCode: 'EMPLOYEE',
    },
    {
      email: 'emp8@{subdomain}.com',
      firstName: 'Hannah',
      lastName: 'Taylor',
      roleCode: 'EMPLOYEE',
    },
    {
      email: 'emp9@{subdomain}.com',
      firstName: 'Ian',
      lastName: 'Thomas',
      roleCode: 'EMPLOYEE',
    },
    {
      email: 'emp10@{subdomain}.com',
      firstName: 'Julia',
      lastName: 'Moore',
      roleCode: 'EMPLOYEE',
    },
  ];

  for (const tenant of tenants) {
    console.log(`\nSeeding users for tenant: ${tenant.name}`);

    for (const userData of usersData) {
      const email = userData.email.replace('{subdomain}', tenant.subdomain);

      let user = await userRepository.findOne({
        where: { tenantId: tenant.id, email },
      });

      if (!user) {
        user = userRepository.create({
          tenantId: tenant.id,
          email,
          passwordHash,
          firstName: userData.firstName,
          lastName: userData.lastName,
          isActive: true,
        });
        await userRepository.save(user);
        console.log(`✓ Created user: ${userData.firstName} ${userData.lastName} (${email})`);
      } else {
        console.log(`- User already exists: ${email}`);
      }

      // Assign role to user
      const role = await roleRepository.findOne({
        where: { tenantId: tenant.id, code: userData.roleCode },
      });

      if (role) {
        const existingUserRole = await userRoleRepository.findOne({
          where: { userId: user.id, roleId: role.id },
        });

        if (!existingUserRole) {
          const userRole = userRoleRepository.create({
            userId: user.id,
            roleId: role.id,
          });
          await userRoleRepository.save(userRole);
          console.log(`  ✓ Assigned role: ${userData.roleCode}`);
        }
      }
    }
  }

  console.log('\n✓ All users created with password: Demo@123');
  console.log('Users seeding completed.\n');
}
