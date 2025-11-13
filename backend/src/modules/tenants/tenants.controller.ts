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
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant } from './entities/tenant.entity';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  /**
   * Create a new tenant
   * POST /api/v1/tenants
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTenantDto: CreateTenantDto): Promise<Tenant> {
    return await this.tenantsService.create(createTenantDto);
  }

  /**
   * Get all tenants
   * GET /api/v1/tenants
   */
  @Get()
  async findAll(): Promise<Tenant[]> {
    return await this.tenantsService.findAll();
  }

  /**
   * Get a tenant by ID
   * GET /api/v1/tenants/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Tenant> {
    return await this.tenantsService.findOne(id);
  }

  /**
   * Get a tenant by subdomain
   * GET /api/v1/tenants/subdomain/:subdomain
   */
  @Get('subdomain/:subdomain')
  async findBySubdomain(@Param('subdomain') subdomain: string): Promise<Tenant> {
    return await this.tenantsService.findBySubdomain(subdomain);
  }

  /**
   * Update a tenant
   * PATCH /api/v1/tenants/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ): Promise<Tenant> {
    return await this.tenantsService.update(id, updateTenantDto);
  }

  /**
   * Soft delete a tenant (mark as inactive)
   * DELETE /api/v1/tenants/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<Tenant> {
    return await this.tenantsService.remove(id);
  }

  /**
   * Restore a soft-deleted tenant
   * PATCH /api/v1/tenants/:id/restore
   */
  @Patch(':id/restore')
  async restore(@Param('id') id: string): Promise<Tenant> {
    return await this.tenantsService.restore(id);
  }

  /**
   * Permanently delete a tenant (use with caution)
   * DELETE /api/v1/tenants/:id/hard
   */
  @Delete(':id/hard')
  @HttpCode(HttpStatus.NO_CONTENT)
  async hardDelete(@Param('id') id: string): Promise<void> {
    return await this.tenantsService.hardDelete(id);
  }
}
