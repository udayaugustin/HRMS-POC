import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveType } from '../entities/leave-type.entity';
import { CreateLeaveTypeDto } from '../dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from '../dto/update-leave-type.dto';

@Injectable()
export class LeaveTypesService {
  constructor(
    @InjectRepository(LeaveType)
    private leaveTypeRepository: Repository<LeaveType>,
  ) {}

  /**
   * Create a new leave type
   */
  async create(
    tenantId: string,
    createLeaveTypeDto: CreateLeaveTypeDto,
  ): Promise<LeaveType> {
    // Check if leave type code already exists for tenant
    const existingLeaveType = await this.leaveTypeRepository.findOne({
      where: {
        code: createLeaveTypeDto.code,
        tenantId,
      },
    });

    if (existingLeaveType) {
      throw new ConflictException(
        'Leave type with this code already exists for this tenant',
      );
    }

    // Create leave type
    const leaveType = this.leaveTypeRepository.create({
      ...createLeaveTypeDto,
      tenantId,
      isPaid: createLeaveTypeDto.isPaid ?? true,
      isActive: createLeaveTypeDto.isActive ?? true,
    });

    return await this.leaveTypeRepository.save(leaveType);
  }

  /**
   * Find all leave types for a tenant
   */
  async findAll(tenantId: string, includeInactive = false): Promise<LeaveType[]> {
    const where: any = { tenantId };

    if (!includeInactive) {
      where.isActive = true;
    }

    return await this.leaveTypeRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find one leave type by ID
   */
  async findOne(tenantId: string, id: string): Promise<LeaveType> {
    const leaveType = await this.leaveTypeRepository.findOne({
      where: { id, tenantId },
    });

    if (!leaveType) {
      throw new NotFoundException(`Leave type with ID ${id} not found`);
    }

    return leaveType;
  }

  /**
   * Find leave type by code
   */
  async findByCode(tenantId: string, code: string): Promise<LeaveType> {
    const leaveType = await this.leaveTypeRepository.findOne({
      where: { code, tenantId, isActive: true },
    });

    if (!leaveType) {
      throw new NotFoundException(`Leave type with code ${code} not found`);
    }

    return leaveType;
  }

  /**
   * Update leave type
   */
  async update(
    tenantId: string,
    id: string,
    updateLeaveTypeDto: UpdateLeaveTypeDto,
  ): Promise<LeaveType> {
    const leaveType = await this.findOne(tenantId, id);

    // Check if code is being updated and if it conflicts
    if (updateLeaveTypeDto.code && updateLeaveTypeDto.code !== leaveType.code) {
      const existingLeaveType = await this.leaveTypeRepository.findOne({
        where: {
          code: updateLeaveTypeDto.code,
          tenantId,
        },
      });

      if (existingLeaveType) {
        throw new ConflictException(
          'Leave type with this code already exists for this tenant',
        );
      }
    }

    // Update leave type
    Object.assign(leaveType, updateLeaveTypeDto);

    return await this.leaveTypeRepository.save(leaveType);
  }

  /**
   * Soft delete leave type by setting isActive to false
   */
  async remove(tenantId: string, id: string): Promise<void> {
    const leaveType = await this.findOne(tenantId, id);

    // Soft delete by setting isActive to false
    leaveType.isActive = false;
    await this.leaveTypeRepository.save(leaveType);
  }

  /**
   * Hard delete leave type (use with caution)
   */
  async hardDelete(tenantId: string, id: string): Promise<void> {
    const leaveType = await this.findOne(tenantId, id);
    await this.leaveTypeRepository.remove(leaveType);
  }
}
