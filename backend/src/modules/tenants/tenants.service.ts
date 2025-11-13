import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  /**
   * Create a new tenant
   * @param createTenantDto - Tenant creation data
   * @returns Created tenant
   */
  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Check if subdomain already exists
    const existingTenant = await this.tenantRepository.findOne({
      where: { subdomain: createTenantDto.subdomain },
    });

    if (existingTenant) {
      throw new ConflictException(`Tenant with subdomain '${createTenantDto.subdomain}' already exists`);
    }

    const tenant = this.tenantRepository.create({
      ...createTenantDto,
      settings: createTenantDto.settings || {},
      isActive: createTenantDto.isActive !== undefined ? createTenantDto.isActive : true,
    });

    return await this.tenantRepository.save(tenant);
  }

  /**
   * Find all tenants
   * @returns Array of all tenants
   */
  async findAll(): Promise<Tenant[]> {
    return await this.tenantRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find a tenant by ID
   * @param id - Tenant ID
   * @returns Tenant entity
   */
  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID '${id}' not found`);
    }

    return tenant;
  }

  /**
   * Find a tenant by subdomain
   * @param subdomain - Tenant subdomain
   * @returns Tenant entity
   */
  async findBySubdomain(subdomain: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { subdomain },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with subdomain '${subdomain}' not found`);
    }

    return tenant;
  }

  /**
   * Update a tenant
   * @param id - Tenant ID
   * @param updateTenantDto - Tenant update data
   * @returns Updated tenant
   */
  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);

    // Check if subdomain is being changed and if it already exists
    if (updateTenantDto.subdomain && updateTenantDto.subdomain !== tenant.subdomain) {
      const existingTenant = await this.tenantRepository.findOne({
        where: { subdomain: updateTenantDto.subdomain },
      });

      if (existingTenant) {
        throw new ConflictException(`Tenant with subdomain '${updateTenantDto.subdomain}' already exists`);
      }
    }

    // Merge settings if provided
    if (updateTenantDto.settings) {
      updateTenantDto.settings = {
        ...tenant.settings,
        ...updateTenantDto.settings,
      };
    }

    Object.assign(tenant, updateTenantDto);

    return await this.tenantRepository.save(tenant);
  }

  /**
   * Soft delete a tenant (mark as inactive)
   * @param id - Tenant ID
   * @returns Deleted tenant
   */
  async remove(id: string): Promise<Tenant> {
    const tenant = await this.findOne(id);

    tenant.isActive = false;

    return await this.tenantRepository.save(tenant);
  }

  /**
   * Hard delete a tenant (permanent deletion - use with caution)
   * @param id - Tenant ID
   * @returns Deletion result
   */
  async hardDelete(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    await this.tenantRepository.remove(tenant);
  }

  /**
   * Restore a soft-deleted tenant
   * @param id - Tenant ID
   * @returns Restored tenant
   */
  async restore(id: string): Promise<Tenant> {
    const tenant = await this.findOne(id);

    tenant.isActive = true;

    return await this.tenantRepository.save(tenant);
  }
}
