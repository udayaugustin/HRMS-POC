import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeFiltersDto } from './dto/employee-filters.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  /**
   * Create a new employee and optionally link to a user
   */
  async create(
    tenantId: string,
    createEmployeeDto: CreateEmployeeDto,
  ): Promise<Employee> {
    // Check if employee code already exists for this tenant
    if (createEmployeeDto.employeeCode) {
      const existingEmployee = await this.employeeRepository.findOne({
        where: {
          tenantId,
          employeeCode: createEmployeeDto.employeeCode,
        },
      });

      if (existingEmployee) {
        throw new ConflictException(
          'Employee with this employee code already exists for this tenant',
        );
      }
    }

    // Check if user is already linked to another employee
    if (createEmployeeDto.userId) {
      const existingEmployeeWithUser = await this.employeeRepository.findOne({
        where: {
          tenantId,
          userId: createEmployeeDto.userId,
        },
      });

      if (existingEmployeeWithUser) {
        throw new ConflictException(
          'This user is already linked to another employee',
        );
      }
    }

    // Create employee
    const employee = this.employeeRepository.create({
      ...createEmployeeDto,
      tenantId,
      isActive: createEmployeeDto.isActive ?? true,
      employmentStatus: createEmployeeDto.employmentStatus ?? 'ACTIVE',
    });

    return await this.employeeRepository.save(employee);
  }

  /**
   * Find all employees for a tenant with pagination and filters
   */
  async findAll(
    tenantId: string,
    filters: EmployeeFiltersDto,
  ): Promise<{
    data: Employee[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      search,
      departmentId,
      designationId,
      locationId,
      employmentStatus,
      isActive,
      page = 1,
      limit = 10,
    } = filters;

    const queryBuilder = this.employeeRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoinAndSelect('employee.department', 'department')
      .leftJoinAndSelect('employee.designation', 'designation')
      .leftJoinAndSelect('employee.location', 'location')
      .leftJoinAndSelect('employee.manager', 'manager')
      .leftJoinAndSelect('manager.user', 'managerUser')
      .where('employee.tenantId = :tenantId', { tenantId });

    // Apply search filter (search by employee code, name, email)
    if (search) {
      queryBuilder.andWhere(
        '(employee.employeeCode ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search OR employee.personalEmail ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply department filter
    if (departmentId) {
      queryBuilder.andWhere('employee.departmentId = :departmentId', {
        departmentId,
      });
    }

    // Apply designation filter
    if (designationId) {
      queryBuilder.andWhere('employee.designationId = :designationId', {
        designationId,
      });
    }

    // Apply location filter
    if (locationId) {
      queryBuilder.andWhere('employee.locationId = :locationId', {
        locationId,
      });
    }

    // Apply employment status filter
    if (employmentStatus) {
      queryBuilder.andWhere('employee.employmentStatus = :employmentStatus', {
        employmentStatus,
      });
    }

    // Apply active status filter
    if (isActive !== undefined) {
      const activeValue = typeof isActive === 'string' ? isActive === 'true' : isActive === true;
      queryBuilder.andWhere('employee.isActive = :isActive', {
        isActive: activeValue,
      });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by created date
    queryBuilder.orderBy('employee.createdAt', 'DESC');

    // Execute query
    const data = await queryBuilder.getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find one employee by ID
   */
  async findOne(tenantId: string, id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id, tenantId },
      relations: [
        'user',
        'department',
        'designation',
        'location',
        'manager',
        'manager.user',
      ],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  /**
   * Find employee by user ID
   */
  async findByUser(tenantId: string, userId: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { userId, tenantId },
      relations: [
        'user',
        'department',
        'designation',
        'location',
        'manager',
        'manager.user',
      ],
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee with user ID ${userId} not found`,
      );
    }

    return employee;
  }

  /**
   * Update employee
   */
  async update(
    tenantId: string,
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const employee = await this.findOne(tenantId, id);

    // Check if employee code is being updated and if it conflicts
    if (
      updateEmployeeDto.employeeCode &&
      updateEmployeeDto.employeeCode !== employee.employeeCode
    ) {
      const existingEmployee = await this.employeeRepository.findOne({
        where: {
          tenantId,
          employeeCode: updateEmployeeDto.employeeCode,
        },
      });

      if (existingEmployee) {
        throw new ConflictException(
          'Employee with this employee code already exists for this tenant',
        );
      }
    }

    // Check if user is being updated and if it's already linked to another employee
    if (updateEmployeeDto.userId && updateEmployeeDto.userId !== employee.userId) {
      const existingEmployeeWithUser = await this.employeeRepository.findOne({
        where: {
          tenantId,
          userId: updateEmployeeDto.userId,
        },
      });

      if (existingEmployeeWithUser) {
        throw new ConflictException(
          'This user is already linked to another employee',
        );
      }
    }

    Object.assign(employee, updateEmployeeDto);
    return await this.employeeRepository.save(employee);
  }

  /**
   * Deactivate employee (soft delete)
   */
  async deactivate(tenantId: string, id: string): Promise<void> {
    const employee = await this.findOne(tenantId, id);
    employee.isActive = false;
    employee.employmentStatus = 'INACTIVE';
    await this.employeeRepository.save(employee);
  }

  /**
   * Get subordinates of a manager
   */
  async getSubordinates(
    tenantId: string,
    managerId: string,
  ): Promise<Employee[]> {
    // First verify that the manager exists
    await this.findOne(tenantId, managerId);

    // Get all subordinates
    const subordinates = await this.employeeRepository.find({
      where: {
        tenantId,
        managerId,
        isActive: true,
      },
      relations: [
        'user',
        'department',
        'designation',
        'location',
      ],
      order: { createdAt: 'DESC' },
    });

    return subordinates;
  }
}
