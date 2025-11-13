import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  /**
   * Create a new location
   */
  async create(
    tenantId: string,
    createLocationDto: CreateLocationDto,
  ): Promise<Location> {
    // Check if location code already exists for tenant
    const existingLocation = await this.locationRepository.findOne({
      where: {
        code: createLocationDto.code,
        tenantId,
      },
    });

    if (existingLocation) {
      throw new ConflictException(
        'Location with this code already exists for this tenant',
      );
    }

    // Create location
    const location = this.locationRepository.create({
      ...createLocationDto,
      tenantId,
      isActive: createLocationDto.isActive ?? true,
    });

    return await this.locationRepository.save(location);
  }

  /**
   * Find all locations for a tenant
   */
  async findAll(tenantId: string): Promise<Location[]> {
    return await this.locationRepository.find({
      where: { tenantId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find one location by ID
   */
  async findOne(tenantId: string, id: string): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { id, tenantId, isActive: true },
      relations: ['employees'],
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return location;
  }

  /**
   * Update location
   */
  async update(
    tenantId: string,
    id: string,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    const location = await this.findOne(tenantId, id);

    // Check if code is being updated and if it conflicts
    if (updateLocationDto.code && updateLocationDto.code !== location.code) {
      const existingLocation = await this.locationRepository.findOne({
        where: {
          code: updateLocationDto.code,
          tenantId,
        },
      });

      if (existingLocation) {
        throw new ConflictException(
          'Location with this code already exists for this tenant',
        );
      }
    }

    // Update location
    Object.assign(location, updateLocationDto);

    return await this.locationRepository.save(location);
  }

  /**
   * Soft delete location by setting isActive to false
   */
  async remove(tenantId: string, id: string): Promise<void> {
    const location = await this.findOne(tenantId, id);

    // Check if location has employees
    // Note: This would require loading the employees relation
    // For now, we'll proceed with soft delete
    // In production, you might want to add this check

    // Soft delete by setting isActive to false
    location.isActive = false;
    await this.locationRepository.save(location);
  }
}
