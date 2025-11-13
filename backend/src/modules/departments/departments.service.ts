import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  /**
   * Create a new department
   */
  async create(
    tenantId: string,
    createDepartmentDto: CreateDepartmentDto,
  ): Promise<Department> {
    // Check if department code already exists for tenant
    const existingDepartment = await this.departmentRepository.findOne({
      where: {
        code: createDepartmentDto.code,
        tenantId,
      },
    });

    if (existingDepartment) {
      throw new ConflictException(
        'Department with this code already exists for this tenant',
      );
    }

    // Validate parent department if provided
    if (createDepartmentDto.parentDepartmentId) {
      const parentDepartment = await this.departmentRepository.findOne({
        where: {
          id: createDepartmentDto.parentDepartmentId,
          tenantId,
        },
      });

      if (!parentDepartment) {
        throw new NotFoundException('Parent department not found');
      }
    }

    // Create department
    const department = this.departmentRepository.create({
      ...createDepartmentDto,
      tenantId,
      isActive: createDepartmentDto.isActive ?? true,
    });

    return await this.departmentRepository.save(department);
  }

  /**
   * Find all departments for a tenant
   */
  async findAll(tenantId: string): Promise<Department[]> {
    return await this.departmentRepository.find({
      where: { tenantId, isActive: true },
      relations: ['parentDepartment', 'childDepartments', 'manager'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find one department by ID
   */
  async findOne(tenantId: string, id: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id, tenantId, isActive: true },
      relations: ['parentDepartment', 'childDepartments', 'manager', 'employees'],
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  /**
   * Update department
   */
  async update(
    tenantId: string,
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    const department = await this.findOne(tenantId, id);

    // Check if code is being updated and if it conflicts
    if (updateDepartmentDto.code && updateDepartmentDto.code !== department.code) {
      const existingDepartment = await this.departmentRepository.findOne({
        where: {
          code: updateDepartmentDto.code,
          tenantId,
        },
      });

      if (existingDepartment) {
        throw new ConflictException(
          'Department with this code already exists for this tenant',
        );
      }
    }

    // Validate parent department if provided
    if (updateDepartmentDto.parentDepartmentId) {
      // Prevent circular reference
      if (updateDepartmentDto.parentDepartmentId === id) {
        throw new BadRequestException(
          'Department cannot be its own parent',
        );
      }

      const parentDepartment = await this.departmentRepository.findOne({
        where: {
          id: updateDepartmentDto.parentDepartmentId,
          tenantId,
        },
      });

      if (!parentDepartment) {
        throw new NotFoundException('Parent department not found');
      }
    }

    // Update department
    Object.assign(department, updateDepartmentDto);

    return await this.departmentRepository.save(department);
  }

  /**
   * Soft delete department by setting isActive to false
   */
  async remove(tenantId: string, id: string): Promise<void> {
    const department = await this.findOne(tenantId, id);

    // Check if department has active child departments
    const childDepartmentsCount = await this.departmentRepository.count({
      where: { parentDepartmentId: id, isActive: true },
    });

    if (childDepartmentsCount > 0) {
      throw new BadRequestException(
        `Cannot delete department. It has ${childDepartmentsCount} active child department(s)`,
      );
    }

    // Check if department has employees
    // Note: This would require loading the employees relation
    // For now, we'll proceed with soft delete
    // In production, you might want to add this check

    // Soft delete by setting isActive to false
    department.isActive = false;
    await this.departmentRepository.save(department);
  }
}
