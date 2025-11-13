import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Designation } from './entities/designation.entity';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';

@Injectable()
export class DesignationsService {
  constructor(
    @InjectRepository(Designation)
    private designationRepository: Repository<Designation>,
  ) {}

  /**
   * Create a new designation
   */
  async create(
    tenantId: string,
    createDesignationDto: CreateDesignationDto,
  ): Promise<Designation> {
    // Check if designation code already exists for tenant
    const existingDesignation = await this.designationRepository.findOne({
      where: {
        code: createDesignationDto.code,
        tenantId,
      },
    });

    if (existingDesignation) {
      throw new ConflictException(
        'Designation with this code already exists for this tenant',
      );
    }

    // Create designation
    const designation = this.designationRepository.create({
      ...createDesignationDto,
      tenantId,
      isActive: createDesignationDto.isActive ?? true,
    });

    return await this.designationRepository.save(designation);
  }

  /**
   * Find all designations for a tenant
   */
  async findAll(tenantId: string): Promise<Designation[]> {
    return await this.designationRepository.find({
      where: { tenantId, isActive: true },
      order: { level: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * Find one designation by ID
   */
  async findOne(tenantId: string, id: string): Promise<Designation> {
    const designation = await this.designationRepository.findOne({
      where: { id, tenantId, isActive: true },
      relations: ['employees'],
    });

    if (!designation) {
      throw new NotFoundException(`Designation with ID ${id} not found`);
    }

    return designation;
  }

  /**
   * Update designation
   */
  async update(
    tenantId: string,
    id: string,
    updateDesignationDto: UpdateDesignationDto,
  ): Promise<Designation> {
    const designation = await this.findOne(tenantId, id);

    // Check if code is being updated and if it conflicts
    if (updateDesignationDto.code && updateDesignationDto.code !== designation.code) {
      const existingDesignation = await this.designationRepository.findOne({
        where: {
          code: updateDesignationDto.code,
          tenantId,
        },
      });

      if (existingDesignation) {
        throw new ConflictException(
          'Designation with this code already exists for this tenant',
        );
      }
    }

    // Update designation
    Object.assign(designation, updateDesignationDto);

    return await this.designationRepository.save(designation);
  }

  /**
   * Soft delete designation by setting isActive to false
   */
  async remove(tenantId: string, id: string): Promise<void> {
    const designation = await this.findOne(tenantId, id);

    // Check if designation has employees
    // Note: This would require loading the employees relation
    // For now, we'll proceed with soft delete
    // In production, you might want to add this check

    // Soft delete by setting isActive to false
    designation.isActive = false;
    await this.designationRepository.save(designation);
  }
}
