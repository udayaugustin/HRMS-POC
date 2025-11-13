import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveBalance } from '../entities/leave-balance.entity';
import { CreateLeaveBalanceDto } from '../dto/create-leave-balance.dto';
import { UpdateLeaveBalanceDto } from '../dto/update-leave-balance.dto';

@Injectable()
export class LeaveBalancesService {
  constructor(
    @InjectRepository(LeaveBalance)
    private leaveBalanceRepository: Repository<LeaveBalance>,
  ) {}

  /**
   * Get leave balance for an employee, leave type, and year
   */
  async getBalance(
    tenantId: string,
    employeeId: string,
    leaveTypeId: string,
    year: number,
  ): Promise<LeaveBalance | null> {
    return await this.leaveBalanceRepository.findOne({
      where: {
        tenantId,
        employeeId,
        leaveTypeId,
        year,
      },
      relations: ['leaveType', 'employee'],
    });
  }

  /**
   * Get all leave balances for an employee in a year
   */
  async getEmployeeBalances(
    tenantId: string,
    employeeId: string,
    year: number,
  ): Promise<LeaveBalance[]> {
    return await this.leaveBalanceRepository.find({
      where: {
        tenantId,
        employeeId,
        year,
      },
      relations: ['leaveType'],
      order: { leaveType: { name: 'ASC' } },
    });
  }

  /**
   * Initialize leave balances for an employee for a year
   * Creates balance entries for all active leave types
   */
  async initializeBalances(
    tenantId: string,
    employeeId: string,
    year: number,
    leaveTypeIds: string[],
    openingBalance = 0,
  ): Promise<LeaveBalance[]> {
    const balances: LeaveBalance[] = [];

    for (const leaveTypeId of leaveTypeIds) {
      // Check if balance already exists
      const existing = await this.getBalance(tenantId, employeeId, leaveTypeId, year);

      if (!existing) {
        const balance = this.leaveBalanceRepository.create({
          tenantId,
          employeeId,
          leaveTypeId,
          year,
          openingBalance,
          accrued: 0,
          used: 0,
          pending: 0,
        });

        balances.push(await this.leaveBalanceRepository.save(balance));
      } else {
        balances.push(existing);
      }
    }

    return balances;
  }

  /**
   * Create a leave balance entry
   */
  async create(
    tenantId: string,
    createLeaveBalanceDto: CreateLeaveBalanceDto,
  ): Promise<LeaveBalance> {
    // Check if balance already exists
    const existingBalance = await this.leaveBalanceRepository.findOne({
      where: {
        tenantId,
        employeeId: createLeaveBalanceDto.employeeId,
        leaveTypeId: createLeaveBalanceDto.leaveTypeId,
        year: createLeaveBalanceDto.year,
      },
    });

    if (existingBalance) {
      throw new ConflictException(
        'Leave balance already exists for this employee, leave type, and year',
      );
    }

    // Create balance
    const balance = this.leaveBalanceRepository.create({
      ...createLeaveBalanceDto,
      tenantId,
      openingBalance: createLeaveBalanceDto.openingBalance ?? 0,
      accrued: createLeaveBalanceDto.accrued ?? 0,
      used: 0,
      pending: 0,
    });

    return await this.leaveBalanceRepository.save(balance);
  }

  /**
   * Accrue leave for an employee
   */
  async accrueLeave(
    tenantId: string,
    employeeId: string,
    leaveTypeId: string,
    year: number,
    days: number,
  ): Promise<LeaveBalance> {
    if (days < 0) {
      throw new BadRequestException('Accrual days cannot be negative');
    }

    let balance = await this.getBalance(tenantId, employeeId, leaveTypeId, year);

    if (!balance) {
      // Create balance if it doesn't exist
      balance = await this.create(tenantId, {
        employeeId,
        leaveTypeId,
        year,
        openingBalance: 0,
        accrued: 0,
      });
    }

    balance.accrued = Number(balance.accrued) + Number(days);

    return await this.leaveBalanceRepository.save(balance);
  }

  /**
   * Deduct leave from employee balance (when leave is approved)
   */
  async deductLeave(
    tenantId: string,
    employeeId: string,
    leaveTypeId: string,
    year: number,
    days: number,
  ): Promise<LeaveBalance> {
    if (days < 0) {
      throw new BadRequestException('Deduction days cannot be negative');
    }

    const balance = await this.getBalance(tenantId, employeeId, leaveTypeId, year);

    if (!balance) {
      throw new NotFoundException(
        'Leave balance not found for this employee, leave type, and year',
      );
    }

    // Deduct from pending first (if this was a pending request being approved)
    if (Number(balance.pending) >= Number(days)) {
      balance.pending = Number(balance.pending) - Number(days);
    }

    balance.used = Number(balance.used) + Number(days);

    return await this.leaveBalanceRepository.save(balance);
  }

  /**
   * Add to pending balance (when leave is applied)
   */
  async addToPending(
    tenantId: string,
    employeeId: string,
    leaveTypeId: string,
    year: number,
    days: number,
  ): Promise<LeaveBalance> {
    if (days < 0) {
      throw new BadRequestException('Pending days cannot be negative');
    }

    let balance = await this.getBalance(tenantId, employeeId, leaveTypeId, year);

    if (!balance) {
      // Create balance if it doesn't exist
      balance = await this.create(tenantId, {
        employeeId,
        leaveTypeId,
        year,
        openingBalance: 0,
        accrued: 0,
      });
    }

    balance.pending = Number(balance.pending) + Number(days);

    return await this.leaveBalanceRepository.save(balance);
  }

  /**
   * Remove from pending balance (when leave is rejected or cancelled)
   */
  async removeFromPending(
    tenantId: string,
    employeeId: string,
    leaveTypeId: string,
    year: number,
    days: number,
  ): Promise<LeaveBalance> {
    if (days < 0) {
      throw new BadRequestException('Pending days cannot be negative');
    }

    const balance = await this.getBalance(tenantId, employeeId, leaveTypeId, year);

    if (!balance) {
      throw new NotFoundException(
        'Leave balance not found for this employee, leave type, and year',
      );
    }

    balance.pending = Number(balance.pending) - Number(days);

    // Ensure pending doesn't go negative
    if (Number(balance.pending) < 0) {
      balance.pending = 0;
    }

    return await this.leaveBalanceRepository.save(balance);
  }

  /**
   * Update leave balance
   */
  async updateBalance(
    tenantId: string,
    employeeId: string,
    leaveTypeId: string,
    year: number,
    updateLeaveBalanceDto: UpdateLeaveBalanceDto,
  ): Promise<LeaveBalance> {
    const balance = await this.getBalance(tenantId, employeeId, leaveTypeId, year);

    if (!balance) {
      throw new NotFoundException(
        'Leave balance not found for this employee, leave type, and year',
      );
    }

    // Update balance
    Object.assign(balance, updateLeaveBalanceDto);

    return await this.leaveBalanceRepository.save(balance);
  }

  /**
   * Check if employee has sufficient leave balance
   */
  async hasAvailableBalance(
    tenantId: string,
    employeeId: string,
    leaveTypeId: string,
    year: number,
    requiredDays: number,
  ): Promise<boolean> {
    const balance = await this.getBalance(tenantId, employeeId, leaveTypeId, year);

    if (!balance) {
      return false;
    }

    // Calculate available: openingBalance + accrued - used - pending
    const available =
      Number(balance.openingBalance) +
      Number(balance.accrued) -
      Number(balance.used) -
      Number(balance.pending);

    return available >= requiredDays;
  }

  /**
   * Get available leave balance
   */
  async getAvailableBalance(
    tenantId: string,
    employeeId: string,
    leaveTypeId: string,
    year: number,
  ): Promise<number> {
    const balance = await this.getBalance(tenantId, employeeId, leaveTypeId, year);

    if (!balance) {
      return 0;
    }

    // Calculate available: openingBalance + accrued - used - pending
    return (
      Number(balance.openingBalance) +
      Number(balance.accrued) -
      Number(balance.used) -
      Number(balance.pending)
    );
  }
}
