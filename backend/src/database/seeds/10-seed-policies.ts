import { DataSource } from 'typeorm';
import { Tenant } from '../../modules/tenants/entities/tenant.entity';
import { PolicyDefinition } from '../../modules/policies/entities/policy-definition.entity';

export async function seedPolicies(dataSource: DataSource): Promise<void> {
  console.log('Seeding policies...');

  const tenantRepository = dataSource.getRepository(Tenant);
  const policyRepository = dataSource.getRepository(PolicyDefinition);

  const tenants = await tenantRepository.find();

  const policiesData = [
    {
      policyType: 'LEAVE',
      name: 'Annual Leave Policy',
      code: 'ANNUAL_LEAVE_POLICY',
      configJson: {
        leaveTypes: {
          CL: {
            name: 'Casual Leave',
            annualQuota: 12,
            maxConsecutiveDays: 3,
            minNoticePeriodDays: 1,
            carryForward: false,
            encashment: false,
          },
          SL: {
            name: 'Sick Leave',
            annualQuota: 10,
            maxConsecutiveDays: 10,
            minNoticePeriodDays: 0,
            carryForward: false,
            encashment: false,
            requiresMedicalCertificate: {
              afterDays: 3,
            },
          },
          EL: {
            name: 'Earned Leave',
            annualQuota: 15,
            maxConsecutiveDays: 15,
            minNoticePeriodDays: 7,
            carryForward: true,
            carryForwardMaxDays: 10,
            encashment: true,
            encashmentMaxDays: 10,
          },
        },
        generalRules: {
          minServiceMonthsForLeave: 3,
          maxLeaveApplicationsPerMonth: 3,
          weekendsCounted: false,
          holidaysCounted: false,
        },
        approvalHierarchy: [
          {
            level: 1,
            role: 'MANAGER',
            condition: 'leaveDays <= 5',
          },
          {
            level: 2,
            role: 'HR_ADMIN',
            condition: 'leaveDays > 5',
          },
        ],
      },
      effectiveFrom: new Date(2024, 0, 1), // Jan 1, 2024
      effectiveTo: null,
    },
    {
      policyType: 'LEAVE',
      name: 'Maternity Leave Policy',
      code: 'MATERNITY_LEAVE_POLICY',
      configJson: {
        leaveTypes: {
          ML: {
            name: 'Maternity Leave',
            annualQuota: 90,
            maxConsecutiveDays: 90,
            minNoticePeriodDays: 30,
            carryForward: false,
            encashment: false,
            eligibility: {
              gender: 'Female',
              minServiceMonths: 6,
            },
            preDelivery: {
              minDays: 30,
              maxDays: 60,
            },
            postDelivery: {
              minDays: 30,
            },
            requiresDocumentation: true,
          },
        },
        approvalHierarchy: [
          {
            level: 1,
            role: 'HR_ADMIN',
          },
        ],
      },
      effectiveFrom: new Date(2024, 0, 1),
      effectiveTo: null,
    },
    {
      policyType: 'LEAVE',
      name: 'Paternity Leave Policy',
      code: 'PATERNITY_LEAVE_POLICY',
      configJson: {
        leaveTypes: {
          PL: {
            name: 'Paternity Leave',
            annualQuota: 10,
            maxConsecutiveDays: 10,
            minNoticePeriodDays: 7,
            carryForward: false,
            encashment: false,
            eligibility: {
              gender: 'Male',
              minServiceMonths: 6,
            },
            mustBeTakenWithin: {
              afterEventDays: 90,
            },
            requiresDocumentation: true,
          },
        },
        approvalHierarchy: [
          {
            level: 1,
            role: 'MANAGER',
          },
          {
            level: 2,
            role: 'HR_ADMIN',
          },
        ],
      },
      effectiveFrom: new Date(2024, 0, 1),
      effectiveTo: null,
    },
    {
      policyType: 'ATTENDANCE',
      name: 'Work From Home Policy',
      code: 'WFH_POLICY',
      configJson: {
        maxDaysPerMonth: 8,
        minNoticePeriodDays: 1,
        requiresApproval: true,
        approvalRole: 'MANAGER',
        eligibility: {
          minServiceMonths: 3,
          employmentStatus: ['ACTIVE'],
        },
        restrictions: {
          consecutiveDaysMax: 5,
          blackoutPeriods: [
            {
              name: 'Quarter End',
              description: 'Last week of each quarter',
              daysBeforeQuarterEnd: 7,
            },
          ],
        },
      },
      effectiveFrom: new Date(2024, 0, 1),
      effectiveTo: null,
    },
    {
      policyType: 'ONBOARDING',
      name: 'Employee Onboarding Policy',
      code: 'ONBOARDING_POLICY',
      configJson: {
        timeline: {
          preJoining: {
            daysBeforeJoining: 7,
            tasks: [
              'Send offer letter',
              'Collect required documents',
              'Setup IT accounts',
              'Assign buddy',
            ],
          },
          firstDay: {
            tasks: [
              'Office tour',
              'Issue ID card',
              'IT equipment handover',
              'HR orientation',
            ],
          },
          firstWeek: {
            tasks: [
              'Team introduction',
              'Policy briefing',
              'System training',
              'Assign initial tasks',
            ],
          },
          firstMonth: {
            tasks: [
              'Department training',
              'Goal setting',
              'Mid-probation review',
            ],
          },
          probationPeriod: {
            durationMonths: 3,
            reviewPoints: [30, 60, 90],
          },
        },
        requiredDocuments: [
          'Photo ID proof',
          'Address proof',
          'Educational certificates',
          'Experience letters',
          'Passport size photos',
          'Bank account details',
          'PAN card',
        ],
        stakeholders: {
          primaryContact: 'HR_ADMIN',
          reportingManager: 'MANAGER',
          buddy: 'EMPLOYEE',
        },
      },
      effectiveFrom: new Date(2024, 0, 1),
      effectiveTo: null,
    },
  ];

  for (const tenant of tenants) {
    console.log(`\nSeeding policies for tenant: ${tenant.name}`);

    for (const policyData of policiesData) {
      let policy = await policyRepository.findOne({
        where: { tenantId: tenant.id, code: policyData.code },
      });

      if (!policy) {
        policy = policyRepository.create({
          tenantId: tenant.id,
          policyType: policyData.policyType,
          name: policyData.name,
          code: policyData.code,
          configJson: policyData.configJson,
          isActive: true,
          effectiveFrom: policyData.effectiveFrom,
          effectiveTo: policyData.effectiveTo,
        });
        await policyRepository.save(policy);
        console.log(`✓ Created policy: ${policyData.name}`);
      } else {
        console.log(`- Policy already exists: ${policyData.name}`);
      }
    }
  }

  console.log('\nPolicies seeding completed.\n');
}
