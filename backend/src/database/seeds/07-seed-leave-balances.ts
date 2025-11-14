import { DataSource } from 'typeorm';
import { Tenant } from '../../modules/tenants/entities/tenant.entity';
import { Employee } from '../../modules/employees/entities/employee.entity';
import { LeaveType } from '../../modules/leave/entities/leave-type.entity';
import { LeaveBalance } from '../../modules/leave/entities/leave-balance.entity';

export async function seedLeaveBalances(dataSource: DataSource): Promise<void> {
  console.log('Seeding leave balances...');

  const tenantRepository = dataSource.getRepository(Tenant);
  const employeeRepository = dataSource.getRepository(Employee);
  const leaveTypeRepository = dataSource.getRepository(LeaveType);
  const leaveBalanceRepository = dataSource.getRepository(LeaveBalance);

  const tenants = await tenantRepository.find();
  const currentYear = new Date().getFullYear();

  // Default leave balances per leave type
  const defaultBalances: Record<string, number> = {
    CL: 12, // Casual Leave: 12 days
    SL: 10, // Sick Leave: 10 days
    EL: 15, // Earned Leave: 15 days
    ML: 90, // Maternity Leave: 90 days
    PL: 10, // Paternity Leave: 10 days
    UL: 0, // Unpaid Leave: 0 days (no limit)
    CO: 0, // Compensatory Off: 0 days (earned based on work)
  };

  for (const tenant of tenants) {
    console.log(`\nSeeding leave balances for tenant: ${tenant.name}`);

    // Get all employees
    const employees = await employeeRepository.find({
      where: { tenantId: tenant.id, isActive: true },
    });

    // Get all leave types
    const leaveTypes = await leaveTypeRepository.find({
      where: { tenantId: tenant.id, isActive: true },
    });

    for (const employee of employees) {
      for (const leaveType of leaveTypes) {
        const existingBalance = await leaveBalanceRepository.findOne({
          where: {
            tenantId: tenant.id,
            employeeId: employee.id,
            leaveTypeId: leaveType.id,
            year: currentYear,
          },
        });

        if (!existingBalance) {
          const openingBalance = defaultBalances[leaveType.code] || 0;

          const leaveBalance = leaveBalanceRepository.create({
            tenantId: tenant.id,
            employeeId: employee.id,
            leaveTypeId: leaveType.id,
            year: currentYear,
            openingBalance,
            accrued: 0,
            used: 0,
            pending: 0,
          });

          await leaveBalanceRepository.save(leaveBalance);
          console.log(
            `✓ Created leave balance: ${employee.employeeCode} - ${leaveType.code} (${openingBalance} days)`,
          );
        } else {
          console.log(
            `- Leave balance already exists: ${employee.employeeCode} - ${leaveType.code}`,
          );
        }
      }
    }
  }

  console.log('\nLeave balances seeding completed.\n');
}
