import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormSchema } from './entities/form-schema.entity';
import { CreateFormSchemaDto } from './dto/create-form-schema.dto';
import { UpdateFormSchemaDto } from './dto/update-form-schema.dto';

@Injectable()
export class FormSchemasService {
  constructor(
    @InjectRepository(FormSchema)
    private readonly formSchemaRepository: Repository<FormSchema>,
  ) {}

  /**
   * Create a new form schema
   * @param tenantId - Tenant ID
   * @param createFormSchemaDto - Form schema creation data
   * @returns Created form schema
   */
  async create(tenantId: string, createFormSchemaDto: CreateFormSchemaDto): Promise<FormSchema> {
    // Check if code already exists for this tenant
    const existingSchema = await this.formSchemaRepository.findOne({
      where: { tenantId, code: createFormSchemaDto.code },
    });

    if (existingSchema) {
      throw new ConflictException(`Form schema with code '${createFormSchemaDto.code}' already exists`);
    }

    // Validate schema JSON structure
    this.validateSchemaStructure(createFormSchemaDto.schemaJson);

    const formSchema = this.formSchemaRepository.create({
      ...createFormSchemaDto,
      tenantId,
      validationRules: createFormSchemaDto.validationRules || {},
      isActive: createFormSchemaDto.isActive !== undefined ? createFormSchemaDto.isActive : true,
    });

    return await this.formSchemaRepository.save(formSchema);
  }

  /**
   * Find all form schemas for a tenant
   * @param tenantId - Tenant ID
   * @returns Array of form schemas
   */
  async findAll(tenantId: string): Promise<FormSchema[]> {
    return await this.formSchemaRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find a form schema by ID
   * @param tenantId - Tenant ID
   * @param id - Form schema ID
   * @returns Form schema entity
   */
  async findOne(tenantId: string, id: string): Promise<FormSchema> {
    const formSchema = await this.formSchemaRepository.findOne({
      where: { tenantId, id },
    });

    if (!formSchema) {
      throw new NotFoundException(`Form schema with ID '${id}' not found`);
    }

    return formSchema;
  }

  /**
   * Find a form schema by code
   * @param tenantId - Tenant ID
   * @param code - Form schema code
   * @returns Form schema entity
   */
  async findByCode(tenantId: string, code: string): Promise<FormSchema> {
    const formSchema = await this.formSchemaRepository.findOne({
      where: { tenantId, code },
    });

    if (!formSchema) {
      throw new NotFoundException(`Form schema with code '${code}' not found`);
    }

    return formSchema;
  }

  /**
   * Update a form schema
   * @param tenantId - Tenant ID
   * @param id - Form schema ID
   * @param updateFormSchemaDto - Form schema update data
   * @returns Updated form schema
   */
  async update(tenantId: string, id: string, updateFormSchemaDto: UpdateFormSchemaDto): Promise<FormSchema> {
    const formSchema = await this.findOne(tenantId, id);

    // Check if code is being changed and if it already exists
    if (updateFormSchemaDto.code && updateFormSchemaDto.code !== formSchema.code) {
      const existingSchema = await this.formSchemaRepository.findOne({
        where: { tenantId, code: updateFormSchemaDto.code },
      });

      if (existingSchema) {
        throw new ConflictException(`Form schema with code '${updateFormSchemaDto.code}' already exists`);
      }
    }

    // Validate schema JSON structure if provided
    if (updateFormSchemaDto.schemaJson) {
      this.validateSchemaStructure(updateFormSchemaDto.schemaJson);
    }

    // Merge validation rules if provided
    if (updateFormSchemaDto.validationRules) {
      updateFormSchemaDto.validationRules = {
        ...formSchema.validationRules,
        ...updateFormSchemaDto.validationRules,
      };
    }

    Object.assign(formSchema, updateFormSchemaDto);

    return await this.formSchemaRepository.save(formSchema);
  }

  /**
   * Soft delete a form schema (mark as inactive)
   * @param tenantId - Tenant ID
   * @param id - Form schema ID
   * @returns Deleted form schema
   */
  async remove(tenantId: string, id: string): Promise<FormSchema> {
    const formSchema = await this.findOne(tenantId, id);

    formSchema.isActive = false;

    return await this.formSchemaRepository.save(formSchema);
  }

  /**
   * Validate form data against a schema
   * @param schemaId - Form schema ID
   * @param data - Form data to validate
   * @returns Validation result
   */
  async validateFormData(schemaId: string, data: Record<string, any>): Promise<{
    isValid: boolean;
    errors: Array<{ field: string; message: string }>;
  }> {
    const formSchema = await this.formSchemaRepository.findOne({
      where: { id: schemaId },
    });

    if (!formSchema) {
      throw new NotFoundException(`Form schema with ID '${schemaId}' not found`);
    }

    if (!formSchema.isActive) {
      throw new BadRequestException('Form schema is not active');
    }

    const errors: Array<{ field: string; message: string }> = [];

    // Validate against schema fields
    if (formSchema.schemaJson && formSchema.schemaJson.fields) {
      for (const field of formSchema.schemaJson.fields) {
        const fieldValue = data[field.id];

        // Check required fields
        if (field.required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
          errors.push({
            field: field.id,
            message: `${field.label} is required`,
          });
          continue;
        }

        // Skip validation if field is not required and no value provided
        if (!field.required && (fieldValue === undefined || fieldValue === null)) {
          continue;
        }

        // Type validation
        if (fieldValue !== undefined && fieldValue !== null) {
          switch (field.type) {
            case 'email':
              if (!this.isValidEmail(fieldValue)) {
                errors.push({
                  field: field.id,
                  message: `${field.label} must be a valid email address`,
                });
              }
              break;

            case 'number':
              if (isNaN(Number(fieldValue))) {
                errors.push({
                  field: field.id,
                  message: `${field.label} must be a number`,
                });
              }
              break;

            case 'date':
              if (!this.isValidDate(fieldValue)) {
                errors.push({
                  field: field.id,
                  message: `${field.label} must be a valid date`,
                });
              }
              break;
          }

          // Custom validation rules
          if (field.validation) {
            // Min length validation
            if (field.validation.minLength && String(fieldValue).length < field.validation.minLength) {
              errors.push({
                field: field.id,
                message: `${field.label} must be at least ${field.validation.minLength} characters`,
              });
            }

            // Max length validation
            if (field.validation.maxLength && String(fieldValue).length > field.validation.maxLength) {
              errors.push({
                field: field.id,
                message: `${field.label} must not exceed ${field.validation.maxLength} characters`,
              });
            }

            // Min value validation
            if (field.validation.min !== undefined && Number(fieldValue) < field.validation.min) {
              errors.push({
                field: field.id,
                message: `${field.label} must be at least ${field.validation.min}`,
              });
            }

            // Max value validation
            if (field.validation.max !== undefined && Number(fieldValue) > field.validation.max) {
              errors.push({
                field: field.id,
                message: `${field.label} must not exceed ${field.validation.max}`,
              });
            }

            // Pattern validation
            if (field.validation.pattern) {
              const regex = new RegExp(field.validation.pattern);
              if (!regex.test(String(fieldValue))) {
                errors.push({
                  field: field.id,
                  message: field.validation.patternMessage || `${field.label} format is invalid`,
                });
              }
            }
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate schema JSON structure
   * @param schemaJson - Schema JSON to validate
   */
  private validateSchemaStructure(schemaJson: Record<string, any>): void {
    if (!schemaJson.fields || !Array.isArray(schemaJson.fields)) {
      throw new BadRequestException('Schema must contain a fields array');
    }

    for (const field of schemaJson.fields) {
      if (!field.id || !field.label || !field.type) {
        throw new BadRequestException('Each field must have id, label, and type properties');
      }

      const validTypes = ['text', 'email', 'number', 'date', 'select', 'textarea', 'checkbox', 'radio'];
      if (!validTypes.includes(field.type)) {
        throw new BadRequestException(`Invalid field type: ${field.type}`);
      }
    }
  }

  /**
   * Validate email format
   * @param email - Email to validate
   * @returns True if valid email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate date format
   * @param date - Date to validate
   * @returns True if valid date
   */
  private isValidDate(date: any): boolean {
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
  }
}
