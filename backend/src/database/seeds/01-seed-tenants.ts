import { DataSource } from 'typeorm';
import { Tenant } from '../../modules/tenants/entities/tenant.entity';

export async function seedTenants(dataSource: DataSource): Promise<void> {
  console.log('Seeding tenants...');

  const tenantRepository = dataSource.getRepository(Tenant);

  const tenants = [
    {
      name: 'Acme Corporation',
      subdomain: 'acme',
      settings: {
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: {
          start: '09:00',
          end: '17:00',
        },
      },
      isActive: true,
    },
    {
      name: 'TechStart Inc',
      subdomain: 'techstart',
      settings: {
        timezone: 'America/Los_Angeles',
        dateFormat: 'DD/MM/YYYY',
        currency: 'USD',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: {
          start: '09:00',
          end: '18:00',
        },
      },
      isActive: true,
    },
  ];

  for (const tenantData of tenants) {
    const existingTenant = await tenantRepository.findOne({
      where: { subdomain: tenantData.subdomain },
    });

    if (!existingTenant) {
      const tenant = tenantRepository.create(tenantData);
      await tenantRepository.save(tenant);
      console.log(`✓ Created tenant: ${tenantData.name} (${tenantData.subdomain})`);
    } else {
      console.log(`- Tenant already exists: ${tenantData.name} (${tenantData.subdomain})`);
    }
  }

  console.log('Tenants seeding completed.\n');
}
