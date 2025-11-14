import { DataSource } from 'typeorm';
import { Tenant } from '../../modules/tenants/entities/tenant.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { RolePermission } from '../../modules/roles/entities/role-permission.entity';

interface RoleData {
  name: string;
  code: string;
  description: string;
  isSystem: boolean;
  permissions: Array<{ module: string; action: string }>;
}

export async function seedRoles(dataSource: DataSource): Promise<void> {
  console.log('Seeding roles and permissions...');

  const tenantRepository = dataSource.getRepository(Tenant);
  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(RolePermission);

  const tenants = await tenantRepository.find();

  const rolesData: RoleData[] = [
    {
      name: 'Super Admin',
      code: 'SUPER_ADMIN',
      description: 'Full system access with all permissions',
      isSystem: true,
      permissions: [
        // Tenants
        { module: 'tenants', action: 'create' },
        { module: 'tenants', action: 'read' },
        { module: 'tenants', action: 'update' },
        { module: 'tenants', action: 'delete' },
        // Users
        { module: 'users', action: 'create' },
        { module: 'users', action: 'read' },
        { module: 'users', action: 'update' },
        { module: 'users', action: 'delete' },
        // Roles
        { module: 'roles', action: 'create' },
        { module: 'roles', action: 'read' },
        { module: 'roles', action: 'update' },
        { module: 'roles', action: 'delete' },
        // Employees
        { module: 'employees', action: 'create' },
        { module: 'employees', action: 'read' },
        { module: 'employees', action: 'update' },
        { module: 'employees', action: 'delete' },
        // Departments
        { module: 'departments', action: 'create' },
        { module: 'departments', action: 'read' },
        { module: 'departments', action: 'update' },
        { module: 'departments', action: 'delete' },
        // Designations
        { module: 'designations', action: 'create' },
        { module: 'designations', action: 'read' },
        { module: 'designations', action: 'update' },
        { module: 'designations', action: 'delete' },
        // Locations
        { module: 'locations', action: 'create' },
        { module: 'locations', action: 'read' },
        { module: 'locations', action: 'update' },
        { module: 'locations', action: 'delete' },
        // Flows
        { module: 'flows', action: 'create' },
        { module: 'flows', action: 'read' },
        { module: 'flows', action: 'update' },
        { module: 'flows', action: 'delete' },
        // Policies
        { module: 'policies', action: 'create' },
        { module: 'policies', action: 'read' },
        { module: 'policies', action: 'update' },
        { module: 'policies', action: 'delete' },
        // Leave
        { module: 'leave', action: 'create' },
        { module: 'leave', action: 'read' },
        { module: 'leave', action: 'update' },
        { module: 'leave', action: 'delete' },
        { module: 'leave', action: 'approve' },
        // Approvals
        { module: 'approvals', action: 'read' },
        { module: 'approvals', action: 'approve' },
        { module: 'approvals', action: 'reject' },
        // Reports
        { module: 'reports', action: 'read' },
        { module: 'reports', action: 'export' },
      ],
    },
    {
      name: 'HR Admin',
      code: 'HR_ADMIN',
      description: 'HR administrative access',
      isSystem: true,
      permissions: [
        // Users
        { module: 'users', action: 'create' },
        { module: 'users', action: 'read' },
        { module: 'users', action: 'update' },
        // Employees
        { module: 'employees', action: 'create' },
        { module: 'employees', action: 'read' },
        { module: 'employees', action: 'update' },
        // Departments
        { module: 'departments', action: 'read' },
        { module: 'departments', action: 'update' },
        // Designations
        { module: 'designations', action: 'read' },
        { module: 'designations', action: 'update' },
        // Locations
        { module: 'locations', action: 'read' },
        { module: 'locations', action: 'update' },
        // Leave
        { module: 'leave', action: 'read' },
        { module: 'leave', action: 'update' },
        { module: 'leave', action: 'approve' },
        // Approvals
        { module: 'approvals', action: 'read' },
        { module: 'approvals', action: 'approve' },
        { module: 'approvals', action: 'reject' },
        // Reports
        { module: 'reports', action: 'read' },
        { module: 'reports', action: 'export' },
      ],
    },
    {
      name: 'Manager',
      code: 'MANAGER',
      description: 'Team management access',
      isSystem: true,
      permissions: [
        // Employees (Read only for team)
        { module: 'employees', action: 'read' },
        // Leave (Approve team requests)
        { module: 'leave', action: 'read' },
        { module: 'leave', action: 'approve' },
        // Approvals
        { module: 'approvals', action: 'read' },
        { module: 'approvals', action: 'approve' },
        { module: 'approvals', action: 'reject' },
        // Reports (Team only)
        { module: 'reports', action: 'read' },
      ],
    },
    {
      name: 'Employee',
      code: 'EMPLOYEE',
      description: 'Basic employee access',
      isSystem: true,
      permissions: [
        // Self profile
        { module: 'employees', action: 'read' },
        // Leave (Create and view own)
        { module: 'leave', action: 'create' },
        { module: 'leave', action: 'read' },
        // Approvals (View own)
        { module: 'approvals', action: 'read' },
      ],
    },
  ];

  for (const tenant of tenants) {
    console.log(`\nSeeding roles for tenant: ${tenant.name}`);

    for (const roleData of rolesData) {
      let role = await roleRepository.findOne({
        where: { tenantId: tenant.id, code: roleData.code },
      });

      if (!role) {
        role = roleRepository.create({
          tenantId: tenant.id,
          name: roleData.name,
          code: roleData.code,
          description: roleData.description,
          isSystem: roleData.isSystem,
          isActive: true,
        });
        await roleRepository.save(role);
        console.log(`✓ Created role: ${roleData.name}`);
      } else {
        console.log(`- Role already exists: ${roleData.name}`);
      }

      // Add permissions
      for (const permData of roleData.permissions) {
        const existingPermission = await permissionRepository.findOne({
          where: {
            roleId: role.id,
            module: permData.module,
            action: permData.action,
          },
        });

        if (!existingPermission) {
          const permission = permissionRepository.create({
            roleId: role.id,
            module: permData.module,
            action: permData.action,
          });
          await permissionRepository.save(permission);
        }
      }
      console.log(`  ✓ Added ${roleData.permissions.length} permissions`);
    }
  }

  console.log('\nRoles and permissions seeding completed.\n');
}
