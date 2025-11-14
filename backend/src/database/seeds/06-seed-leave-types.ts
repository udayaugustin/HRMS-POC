import { DataSource } from 'typeorm';
import { Tenant } from '../../modules/tenants/entities/tenant.entity';
import { LeaveType } from '../../modules/leave/entities/leave-type.entity';

export async function seedLeaveTypes(dataSource: DataSource): Promise<void> {
  console.log('Seeding leave types...');

  const tenantRepository = dataSource.getRepository(Tenant);
  const leaveTypeRepository = dataSource.getRepository(LeaveType);

  const tenants = await tenantRepository.find();

  const leaveTypesData = [
    {
      name: 'Casual Leave',
      code: 'CL',
      description: 'Casual leave for personal reasons',
      isPaid: true,
    },
    {
      name: 'Sick Leave',
      code: 'SL',
      description: 'Leave for medical reasons',
      isPaid: true,
    },
    {
      name: 'Earned Leave',
      code: 'EL',
      description: 'Earned/Privilege leave that can be accumulated',
      isPaid: true,
    },
    {
      name: 'Maternity Leave',
      code: 'ML',
      description: 'Maternity leave for expecting mothers',
      isPaid: true,
    },
    {
      name: 'Paternity Leave',
      code: 'PL',
      description: 'Paternity leave for new fathers',
      isPaid: true,
    },
    {
      name: 'Unpaid Leave',
      code: 'UL',
      description: 'Leave without pay',
      isPaid: false,
    },
    {
      name: 'Compensatory Off',
      code: 'CO',
      description: 'Compensatory off for working on holidays',
      isPaid: true,
    },
  ];

  for (const tenant of tenants) {
    console.log(`\nSeeding leave types for tenant: ${tenant.name}`);

    for (const leaveTypeData of leaveTypesData) {
      let leaveType = await leaveTypeRepository.findOne({
        where: { tenantId: tenant.id, code: leaveTypeData.code },
      });

      if (!leaveType) {
        leaveType = leaveTypeRepository.create({
          tenantId: tenant.id,
          name: leaveTypeData.name,
          code: leaveTypeData.code,
          description: leaveTypeData.description,
          isPaid: leaveTypeData.isPaid,
          isActive: true,
        });
        await leaveTypeRepository.save(leaveType);
        console.log(`✓ Created leave type: ${leaveTypeData.name} (${leaveTypeData.code})`);
      } else {
        console.log(`- Leave type already exists: ${leaveTypeData.name}`);
      }
    }
  }

  console.log('\nLeave types seeding completed.\n');
}
