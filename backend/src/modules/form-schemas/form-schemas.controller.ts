import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { FormSchemasService } from './form-schemas.service';
import { CreateFormSchemaDto } from './dto/create-form-schema.dto';
import { UpdateFormSchemaDto } from './dto/update-form-schema.dto';
import { FormSchema } from './entities/form-schema.entity';

@Controller('form-schemas')
export class FormSchemasController {
  constructor(private readonly formSchemasService: FormSchemasService) {}

  /**
   * Create a new form schema
   * POST /api/v1/form-schemas
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: ExpressRequest,
    @Body() createFormSchemaDto: CreateFormSchemaDto,
  ): Promise<FormSchema> {
    const tenantId = (req.user?.tenantId || req.headers['x-tenant-id']) as string;
    return await this.formSchemasService.create(tenantId, createFormSchemaDto);
  }

  /**
   * Get all form schemas for a tenant
   * GET /api/v1/form-schemas
   */
  @Get()
  async findAll(@Request() req: ExpressRequest): Promise<FormSchema[]> {
    const tenantId = (req.user?.tenantId || req.headers['x-tenant-id']) as string;
    return await this.formSchemasService.findAll(tenantId);
  }

  /**
   * Get a form schema by ID
   * GET /api/v1/form-schemas/:id
   */
  @Get(':id')
  async findOne(@Request() req: ExpressRequest, @Param('id') id: string): Promise<FormSchema> {
    const tenantId = (req.user?.tenantId || req.headers['x-tenant-id']) as string;
    return await this.formSchemasService.findOne(tenantId, id);
  }

  /**
   * Get a form schema by code
   * GET /api/v1/form-schemas/code/:code
   */
  @Get('code/:code')
  async findByCode(@Request() req: ExpressRequest, @Param('code') code: string): Promise<FormSchema> {
    const tenantId = (req.user?.tenantId || req.headers['x-tenant-id']) as string;
    return await this.formSchemasService.findByCode(tenantId, code);
  }

  /**
   * Update a form schema
   * PATCH /api/v1/form-schemas/:id
   */
  @Patch(':id')
  async update(
    @Request() req: ExpressRequest,
    @Param('id') id: string,
    @Body() updateFormSchemaDto: UpdateFormSchemaDto,
  ): Promise<FormSchema> {
    const tenantId = (req.user?.tenantId || req.headers['x-tenant-id']) as string;
    return await this.formSchemasService.update(tenantId, id, updateFormSchemaDto);
  }

  /**
   * Soft delete a form schema (mark as inactive)
   * DELETE /api/v1/form-schemas/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Request() req: ExpressRequest, @Param('id') id: string): Promise<FormSchema> {
    const tenantId = (req.user?.tenantId || req.headers['x-tenant-id']) as string;
    return await this.formSchemasService.remove(tenantId, id);
  }

  /**
   * Validate form data against a schema
   * POST /api/v1/form-schemas/:id/validate
   */
  @Post(':id/validate')
  @HttpCode(HttpStatus.OK)
  async validateFormData(
    @Param('id') id: string,
    @Body() data: Record<string, any>,
  ): Promise<{
    isValid: boolean;
    errors: Array<{ field: string; message: string }>;
  }> {
    return await this.formSchemasService.validateFormData(id, data);
  }
}
