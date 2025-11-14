import { DataSource } from 'typeorm';
import { Tenant } from '../../modules/tenants/entities/tenant.entity';
import { FormSchema } from '../../modules/form-schemas/entities/form-schema.entity';

export async function seedFormSchemas(dataSource: DataSource): Promise<void> {
  console.log('Seeding form schemas...');

  const tenantRepository = dataSource.getRepository(Tenant);
  const formSchemaRepository = dataSource.getRepository(FormSchema);

  const tenants = await tenantRepository.find();

  const formSchemasData = [
    {
      name: 'Personal Information Form',
      code: 'PERSONAL_INFO',
      schemaJson: {
        fields: [
          {
            id: 'firstName',
            type: 'text',
            label: 'First Name',
            required: true,
            placeholder: 'Enter your first name',
          },
          {
            id: 'lastName',
            type: 'text',
            label: 'Last Name',
            required: true,
            placeholder: 'Enter your last name',
          },
          {
            id: 'dateOfBirth',
            type: 'date',
            label: 'Date of Birth',
            required: true,
          },
          {
            id: 'gender',
            type: 'select',
            label: 'Gender',
            required: true,
            options: [
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' },
            ],
          },
          {
            id: 'phone',
            type: 'tel',
            label: 'Phone Number',
            required: true,
            placeholder: '+1-555-0000',
          },
          {
            id: 'personalEmail',
            type: 'email',
            label: 'Personal Email',
            required: true,
            placeholder: 'your.email@example.com',
          },
          {
            id: 'address',
            type: 'textarea',
            label: 'Address',
            required: true,
            placeholder: 'Enter your complete address',
          },
        ],
      },
      validationRules: {
        firstName: { minLength: 2, maxLength: 50 },
        lastName: { minLength: 2, maxLength: 50 },
        phone: { pattern: '^\\+?[1-9]\\d{1,14}$' },
        personalEmail: { pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
      },
    },
    {
      name: 'Employment Details Form',
      code: 'EMPLOYMENT_DETAILS',
      schemaJson: {
        fields: [
          {
            id: 'employeeCode',
            type: 'text',
            label: 'Employee Code',
            required: true,
            placeholder: 'EMP0001',
          },
          {
            id: 'joiningDate',
            type: 'date',
            label: 'Joining Date',
            required: true,
          },
          {
            id: 'departmentId',
            type: 'select',
            label: 'Department',
            required: true,
            dataSource: 'departments',
          },
          {
            id: 'designationId',
            type: 'select',
            label: 'Designation',
            required: true,
            dataSource: 'designations',
          },
          {
            id: 'locationId',
            type: 'select',
            label: 'Location',
            required: true,
            dataSource: 'locations',
          },
          {
            id: 'managerId',
            type: 'select',
            label: 'Reporting Manager',
            required: false,
            dataSource: 'managers',
          },
          {
            id: 'employmentStatus',
            type: 'select',
            label: 'Employment Status',
            required: true,
            options: [
              { value: 'ACTIVE', label: 'Active' },
              { value: 'PROBATION', label: 'Probation' },
              { value: 'INACTIVE', label: 'Inactive' },
            ],
          },
        ],
      },
      validationRules: {
        employeeCode: { pattern: '^EMP\\d{4}$' },
      },
    },
    {
      name: 'Leave Request Form',
      code: 'LEAVE_REQUEST',
      schemaJson: {
        fields: [
          {
            id: 'leaveTypeId',
            type: 'select',
            label: 'Leave Type',
            required: true,
            dataSource: 'leaveTypes',
          },
          {
            id: 'startDate',
            type: 'date',
            label: 'Start Date',
            required: true,
          },
          {
            id: 'endDate',
            type: 'date',
            label: 'End Date',
            required: true,
          },
          {
            id: 'reason',
            type: 'textarea',
            label: 'Reason',
            required: true,
            placeholder: 'Enter reason for leave',
          },
          {
            id: 'halfDay',
            type: 'checkbox',
            label: 'Half Day',
            required: false,
          },
          {
            id: 'contactNumber',
            type: 'tel',
            label: 'Contact Number During Leave',
            required: false,
            placeholder: '+1-555-0000',
          },
        ],
      },
      validationRules: {
        reason: { minLength: 10, maxLength: 500 },
        startDate: { futureDate: true },
        endDate: { afterField: 'startDate' },
      },
    },
    {
      name: 'Document Upload Form',
      code: 'DOCUMENT_UPLOAD',
      schemaJson: {
        fields: [
          {
            id: 'documentType',
            type: 'select',
            label: 'Document Type',
            required: true,
            options: [
              { value: 'ID_PROOF', label: 'ID Proof' },
              { value: 'ADDRESS_PROOF', label: 'Address Proof' },
              { value: 'EDUCATION', label: 'Educational Certificate' },
              { value: 'EXPERIENCE', label: 'Experience Letter' },
              { value: 'PHOTO', label: 'Passport Size Photo' },
              { value: 'OTHER', label: 'Other' },
            ],
          },
          {
            id: 'documentName',
            type: 'text',
            label: 'Document Name',
            required: true,
            placeholder: 'Enter document name',
          },
          {
            id: 'documentFile',
            type: 'file',
            label: 'Upload Document',
            required: true,
            accept: '.pdf,.jpg,.jpeg,.png',
          },
          {
            id: 'notes',
            type: 'textarea',
            label: 'Notes',
            required: false,
            placeholder: 'Additional notes about this document',
          },
        ],
      },
      validationRules: {
        documentFile: { maxSize: 5242880, allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'] },
      },
    },
    {
      name: 'Bank Details Form',
      code: 'BANK_DETAILS',
      schemaJson: {
        fields: [
          {
            id: 'bankName',
            type: 'text',
            label: 'Bank Name',
            required: true,
            placeholder: 'Enter bank name',
          },
          {
            id: 'accountNumber',
            type: 'text',
            label: 'Account Number',
            required: true,
            placeholder: 'Enter account number',
          },
          {
            id: 'accountHolderName',
            type: 'text',
            label: 'Account Holder Name',
            required: true,
            placeholder: 'Enter account holder name',
          },
          {
            id: 'ifscCode',
            type: 'text',
            label: 'IFSC Code',
            required: true,
            placeholder: 'Enter IFSC code',
          },
          {
            id: 'accountType',
            type: 'select',
            label: 'Account Type',
            required: true,
            options: [
              { value: 'SAVINGS', label: 'Savings' },
              { value: 'CURRENT', label: 'Current' },
            ],
          },
        ],
      },
      validationRules: {
        accountNumber: { pattern: '^\\d{9,18}$' },
        ifscCode: { pattern: '^[A-Z]{4}0[A-Z0-9]{6}$' },
      },
    },
  ];

  for (const tenant of tenants) {
    console.log(`\nSeeding form schemas for tenant: ${tenant.name}`);

    for (const schemaData of formSchemasData) {
      let formSchema = await formSchemaRepository.findOne({
        where: { tenantId: tenant.id, code: schemaData.code },
      });

      if (!formSchema) {
        formSchema = formSchemaRepository.create({
          tenantId: tenant.id,
          name: schemaData.name,
          code: schemaData.code,
          schemaJson: schemaData.schemaJson,
          validationRules: schemaData.validationRules,
          isActive: true,
        });
        await formSchemaRepository.save(formSchema);
        console.log(`✓ Created form schema: ${schemaData.name}`);
      } else {
        console.log(`- Form schema already exists: ${schemaData.name}`);
      }
    }
  }

  console.log('\nForm schemas seeding completed.\n');
}
