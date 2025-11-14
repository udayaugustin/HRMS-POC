import { DataSource } from 'typeorm';
import { Tenant } from '../../modules/tenants/entities/tenant.entity';
import { User } from '../../modules/users/entities/user.entity';
import { FlowDefinition } from '../../modules/flows/entities/flow-definition.entity';
import { FlowVersion } from '../../modules/flows/entities/flow-version.entity';
import { FlowStepDefinition } from '../../modules/flows/entities/flow-step-definition.entity';
import { FormSchema } from '../../modules/form-schemas/entities/form-schema.entity';

export async function seedFlows(dataSource: DataSource): Promise<void> {
  console.log('Seeding flows...');

  const tenantRepository = dataSource.getRepository(Tenant);
  const userRepository = dataSource.getRepository(User);
  const flowDefinitionRepository = dataSource.getRepository(FlowDefinition);
  const flowVersionRepository = dataSource.getRepository(FlowVersion);
  const flowStepDefinitionRepository = dataSource.getRepository(FlowStepDefinition);
  const formSchemaRepository = dataSource.getRepository(FormSchema);

  const tenants = await tenantRepository.find();

  for (const tenant of tenants) {
    console.log(`\nSeeding flows for tenant: ${tenant.name}`);

    // Get a super admin user to set as creator
    const adminUser = await userRepository
      .createQueryBuilder('user')
      .innerJoin('user.userRoles', 'userRole')
      .innerJoin('userRole.role', 'role')
      .where('user.tenantId = :tenantId', { tenantId: tenant.id })
      .andWhere('role.code = :roleCode', { roleCode: 'SUPER_ADMIN' })
      .getOne();

    // Get form schemas
    const personalInfoForm = await formSchemaRepository.findOne({
      where: { tenantId: tenant.id, code: 'PERSONAL_INFO' },
    });
    const employmentDetailsForm = await formSchemaRepository.findOne({
      where: { tenantId: tenant.id, code: 'EMPLOYMENT_DETAILS' },
    });
    const documentUploadForm = await formSchemaRepository.findOne({
      where: { tenantId: tenant.id, code: 'DOCUMENT_UPLOAD' },
    });
    const bankDetailsForm = await formSchemaRepository.findOne({
      where: { tenantId: tenant.id, code: 'BANK_DETAILS' },
    });
    const leaveRequestForm = await formSchemaRepository.findOne({
      where: { tenantId: tenant.id, code: 'LEAVE_REQUEST' },
    });

    // 1. ONBOARDING Flow
    console.log('\n  Creating ONBOARDING flow...');
    let onboardingFlow = await flowDefinitionRepository.findOne({
      where: { tenantId: tenant.id, flowType: 'ONBOARDING' },
    });

    if (!onboardingFlow) {
      onboardingFlow = flowDefinitionRepository.create({
        tenantId: tenant.id,
        flowType: 'ONBOARDING',
        name: 'Employee Onboarding',
        description: 'Complete onboarding process for new employees',
        isActive: true,
      });
      await flowDefinitionRepository.save(onboardingFlow);
      console.log('    ✓ Created ONBOARDING flow definition');
    } else {
      console.log('    - ONBOARDING flow already exists');
    }

    // Create version for onboarding flow
    let onboardingVersion = await flowVersionRepository.findOne({
      where: { flowDefinitionId: onboardingFlow.id, versionNumber: 1 },
    });

    if (!onboardingVersion) {
      onboardingVersion = flowVersionRepository.create({
        flowDefinitionId: onboardingFlow.id,
        versionNumber: 1,
        status: 'PUBLISHED',
        createdById: adminUser?.id || null,
        publishedAt: new Date(),
      });
      await flowVersionRepository.save(onboardingVersion);
      console.log('    ✓ Created version 1 for ONBOARDING flow');

      // Create steps for onboarding flow
      const onboardingSteps = [
        {
          stepOrder: 1,
          stepType: 'FORM',
          title: 'Personal Information',
          description: 'Fill in your personal details',
          formSchemaId: personalInfoForm?.id || null,
          approvalRole: null,
          config: {},
          isMandatory: true,
        },
        {
          stepOrder: 2,
          stepType: 'FORM',
          title: 'Employment Details',
          description: 'Provide your employment information',
          formSchemaId: employmentDetailsForm?.id || null,
          approvalRole: null,
          config: {},
          isMandatory: true,
        },
        {
          stepOrder: 3,
          stepType: 'FORM',
          title: 'Bank Details',
          description: 'Enter your bank account information for salary processing',
          formSchemaId: bankDetailsForm?.id || null,
          approvalRole: null,
          config: {},
          isMandatory: true,
        },
        {
          stepOrder: 4,
          stepType: 'FORM',
          title: 'Document Upload',
          description: 'Upload required documents',
          formSchemaId: documentUploadForm?.id || null,
          approvalRole: null,
          config: {
            allowMultiple: true,
            maxDocuments: 10,
          },
          isMandatory: true,
        },
        {
          stepOrder: 5,
          stepType: 'APPROVAL',
          title: 'HR Review',
          description: 'HR Admin will review your information',
          formSchemaId: null,
          approvalRole: 'HR_ADMIN',
          config: {
            approvalType: 'SINGLE',
            autoAssign: true,
          },
          isMandatory: true,
        },
        {
          stepOrder: 6,
          stepType: 'APPROVAL',
          title: 'Manager Approval',
          description: 'Your manager will approve your onboarding',
          formSchemaId: null,
          approvalRole: 'MANAGER',
          config: {
            approvalType: 'SINGLE',
            autoAssign: true,
          },
          isMandatory: true,
        },
      ];

      for (const stepData of onboardingSteps) {
        const step = flowStepDefinitionRepository.create({
          flowVersionId: onboardingVersion.id,
          ...stepData,
        });
        await flowStepDefinitionRepository.save(step);
        console.log(`      ✓ Created step ${stepData.stepOrder}: ${stepData.title}`);
      }
    } else {
      console.log('    - Version 1 already exists for ONBOARDING flow');
    }

    // 2. LEAVE_APPROVAL Flow
    console.log('\n  Creating LEAVE_APPROVAL flow...');
    let leaveApprovalFlow = await flowDefinitionRepository.findOne({
      where: { tenantId: tenant.id, flowType: 'LEAVE_APPROVAL' },
    });

    if (!leaveApprovalFlow) {
      leaveApprovalFlow = flowDefinitionRepository.create({
        tenantId: tenant.id,
        flowType: 'LEAVE_APPROVAL',
        name: 'Leave Request Approval',
        description: 'Approval workflow for leave requests',
        isActive: true,
      });
      await flowDefinitionRepository.save(leaveApprovalFlow);
      console.log('    ✓ Created LEAVE_APPROVAL flow definition');
    } else {
      console.log('    - LEAVE_APPROVAL flow already exists');
    }

    // Create version for leave approval flow
    let leaveApprovalVersion = await flowVersionRepository.findOne({
      where: { flowDefinitionId: leaveApprovalFlow.id, versionNumber: 1 },
    });

    if (!leaveApprovalVersion) {
      leaveApprovalVersion = flowVersionRepository.create({
        flowDefinitionId: leaveApprovalFlow.id,
        versionNumber: 1,
        status: 'PUBLISHED',
        createdById: adminUser?.id || null,
        publishedAt: new Date(),
      });
      await flowVersionRepository.save(leaveApprovalVersion);
      console.log('    ✓ Created version 1 for LEAVE_APPROVAL flow');

      // Create steps for leave approval flow
      const leaveApprovalSteps = [
        {
          stepOrder: 1,
          stepType: 'FORM',
          title: 'Leave Request',
          description: 'Submit your leave request',
          formSchemaId: leaveRequestForm?.id || null,
          approvalRole: null,
          config: {},
          isMandatory: true,
        },
        {
          stepOrder: 2,
          stepType: 'APPROVAL',
          title: 'Manager Approval',
          description: 'Your manager will review and approve your leave request',
          formSchemaId: null,
          approvalRole: 'MANAGER',
          config: {
            approvalType: 'SINGLE',
            autoAssign: true,
            allowComments: true,
          },
          isMandatory: true,
        },
        {
          stepOrder: 3,
          stepType: 'APPROVAL',
          title: 'HR Review',
          description: 'HR will do final verification',
          formSchemaId: null,
          approvalRole: 'HR_ADMIN',
          config: {
            approvalType: 'SINGLE',
            autoAssign: true,
            allowComments: true,
            conditionalApproval: {
              condition: 'leaveDays > 5',
              message: 'HR approval required for leave requests exceeding 5 days',
            },
          },
          isMandatory: false,
        },
      ];

      for (const stepData of leaveApprovalSteps) {
        const step = flowStepDefinitionRepository.create({
          flowVersionId: leaveApprovalVersion.id,
          ...stepData,
        });
        await flowStepDefinitionRepository.save(step);
        console.log(`      ✓ Created step ${stepData.stepOrder}: ${stepData.title}`);
      }
    } else {
      console.log('    - Version 1 already exists for LEAVE_APPROVAL flow');
    }
  }

  console.log('\nFlows seeding completed.\n');
}
