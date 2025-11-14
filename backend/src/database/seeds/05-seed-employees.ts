import { DataSource } from 'typeorm';
import { Tenant } from '../../modules/tenants/entities/tenant.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Employee } from '../../modules/employees/entities/employee.entity';
import { Department } from '../../modules/departments/entities/department.entity';
import { Designation } from '../../modules/designations/entities/designation.entity';
import { Location } from '../../modules/locations/entities/location.entity';
import { Role } from '../../modules/roles/entities/role.entity';

export async function seedEmployees(dataSource: DataSource): Promise<void> {
  console.log('Seeding employees...');

  const tenantRepository = dataSource.getRepository(Tenant);
  const userRepository = dataSource.getRepository(User);
  const employeeRepository = dataSource.getRepository(Employee);
  const departmentRepository = dataSource.getRepository(Department);
  const designationRepository = dataSource.getRepository(Designation);
  const locationRepository = dataSource.getRepository(Location);
  const roleRepository = dataSource.getRepository(Role);

  const tenants = await tenantRepository.find();

  for (const tenant of tenants) {
    console.log(`\nSeeding employees for tenant: ${tenant.name}`);

    // Get all users for this tenant
    const users = await userRepository.find({
      where: { tenantId: tenant.id },
      relations: ['userRoles', 'userRoles.role'],
    });

    // Get departments, designations, and locations
    const departments = await departmentRepository.find({
      where: { tenantId: tenant.id },
    });
    const designations = await designationRepository.find({
      where: { tenantId: tenant.id },
    });
    const locations = await locationRepository.find({
      where: { tenantId: tenant.id },
    });

    // Get HR department
    const hrDept = departments.find((d) => d.code === 'HR');
    const engDept = departments.find((d) => d.code === 'ENG');
    const salesDept = departments.find((d) => d.code === 'SALES');
    const mktDept = departments.find((d) => d.code === 'MKT');

    // Get HQ location
    const hqLocation = locations.find((l) => l.code === 'HQ');
    const wcLocation = locations.find((l) => l.code === 'WC');

    // Get designations
    const managerDesig = designations.find((d) => d.code === 'MGR');
    const hrManagerDesig = designations.find((d) => d.code === 'HRM');
    const seDesig = designations.find((d) => d.code === 'SE');
    const salesExecDesig = designations.find((d) => d.code === 'SE');

    let employeeCounter = 1;
    let manager1Employee: Employee | null = null;

    for (const user of users) {
      const existingEmployee = await employeeRepository.findOne({
        where: { userId: user.id },
      });

      if (existingEmployee) {
        console.log(`- Employee record already exists for: ${user.email}`);
        if (user.email.includes('manager1')) {
          manager1Employee = existingEmployee;
        }
        continue;
      }

      const userRole = user.userRoles[0];
      const roleCode = userRole?.role?.code;

      let department: Department | undefined;
      let designation: Designation | undefined;
      let location: Location | undefined;
      let manager: Employee | null = null;

      // Assign department, designation, location based on role
      if (roleCode === 'SUPER_ADMIN') {
        department = hrDept;
        designation = hrManagerDesig;
        location = hqLocation;
      } else if (roleCode === 'HR_ADMIN') {
        department = hrDept;
        designation = hrManagerDesig;
        location = hqLocation;
      } else if (roleCode === 'MANAGER') {
        if (user.email.includes('manager1')) {
          department = engDept;
          designation = managerDesig;
          location = hqLocation;
        } else {
          department = salesDept;
          designation = managerDesig;
          location = wcLocation;
        }
      } else if (roleCode === 'EMPLOYEE') {
        // Distribute employees across departments
        const deptIndex = employeeCounter % 3;
        if (deptIndex === 0) {
          department = engDept;
          designation = seDesig;
        } else if (deptIndex === 1) {
          department = salesDept;
          designation = salesExecDesig;
        } else {
          department = mktDept;
          designation = seDesig;
        }
        location = employeeCounter % 2 === 0 ? hqLocation : wcLocation;
        manager = manager1Employee; // Assign first manager as manager for employees
        employeeCounter++;
      }

      const employee = employeeRepository.create({
        tenantId: tenant.id,
        userId: user.id,
        employeeCode: `EMP${String(employeeCounter).padStart(4, '0')}`,
        departmentId: department?.id || null,
        designationId: designation?.id || null,
        locationId: location?.id || null,
        managerId: manager?.id || null,
        joiningDate: new Date(2024, 0, 1), // Jan 1, 2024
        employmentStatus: 'ACTIVE',
        personalEmail: `${user.firstName.toLowerCase()}.${user.lastName.toLowerCase()}@personal.com`,
        phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        dateOfBirth: new Date(1990, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: employeeCounter % 2 === 0 ? 'Male' : 'Female',
        address: `${employeeCounter * 100} Employee Street, City, State`,
        isActive: true,
      });

      await employeeRepository.save(employee);
      console.log(
        `✓ Created employee record: ${user.firstName} ${user.lastName} (${employee.employeeCode})`,
      );

      // Save first manager for assigning to employees
      if (roleCode === 'MANAGER' && user.email.includes('manager1')) {
        manager1Employee = employee;
      }
    }
  }

  console.log('\nEmployees seeding completed.\n');
}
