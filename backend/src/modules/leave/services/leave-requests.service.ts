import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { LeaveRequest } from '../entities/leave-request.entity';
import { ApplyLeaveDto } from '../dto/apply-leave.dto';
import { LeaveRequestFiltersDto } from '../dto/leave-request-filters.dto';
import { LeaveBalancesService } from './leave-balances.service';
import { FlowExecutionService } from '../../flows/flow-execution.service';

@Injectable()
export class LeaveRequestsService {
  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRequestRepository: Repository<LeaveRequest>,
    private leaveBalancesService: LeaveBalancesService,
    private flowExecutionService: FlowExecutionService,
  ) {}

  /**
   * Apply for leave - Creates leave request AND starts approval flow
   */
  async apply(
    tenantId: string,
    employeeId: string,
    userId: string,
    applyLeaveDto: ApplyLeaveDto,
  ): Promise<LeaveRequest> {
    const { leaveTypeId, fromDate, toDate, numberOfDays, reason } = applyLeaveDto;

    // Validate dates
    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (from > to) {
      throw new BadRequestException('From date cannot be after to date');
    }

    // Get the year from the from date
    const year = from.getFullYear();

    // Check if employee has sufficient leave balance
    const hasBalance = await this.leaveBalancesService.hasAvailableBalance(
      tenantId,
      employeeId,
      leaveTypeId,
      year,
      numberOfDays,
    );

    if (!hasBalance) {
      throw new BadRequestException('Insufficient leave balance');
    }

    // Check for overlapping leave requests
    const overlapping = await this.leaveRequestRepository.findOne({
      where: {
        tenantId,
        employeeId,
        status: 'PENDING',
        fromDate: Between(from, to),
      },
    });

    if (overlapping) {
      throw new BadRequestException(
        'You already have a pending leave request for overlapping dates',
      );
    }

    // Create leave request
    const leaveRequest = this.leaveRequestRepository.create({
      tenantId,
      employeeId,
      leaveTypeId,
      fromDate: from,
      toDate: to,
      numberOfDays,
      reason,
      status: 'PENDING',
      appliedAt: new Date(),
    });

    const savedLeaveRequest = await this.leaveRequestRepository.save(leaveRequest);

    // Add to pending balance
    await this.leaveBalancesService.addToPending(
      tenantId,
      employeeId,
      leaveTypeId,
      year,
      numberOfDays,
    );

    // Start the LEAVE_APPROVAL flow
    try {
      const flowInstance = await this.flowExecutionService.startFlow(
        tenantId,
        'LEAVE_APPROVAL',
        userId,
        savedLeaveRequest.id,
        'LEAVE_REQUEST',
      );

      // Link the flow instance to the leave request
      savedLeaveRequest.flowInstanceId = flowInstance.id;
      await this.leaveRequestRepository.save(savedLeaveRequest);
    } catch (error) {
      // If flow creation fails, we should rollback the leave request
      // For now, we'll just log the error and continue
      console.error('Failed to start leave approval flow:', error);
    }

    return await this.findOne(tenantId, savedLeaveRequest.id);
  }

  /**
   * Find all leave requests with filters
   */
  async findAll(
    tenantId: string,
    filters?: LeaveRequestFiltersDto,
  ): Promise<LeaveRequest[]> {
    const where: any = { tenantId };

    if (filters?.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters?.leaveTypeId) {
      where.leaveTypeId = filters.leaveTypeId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.fromDate && filters?.toDate) {
      where.fromDate = Between(
        new Date(filters.fromDate),
        new Date(filters.toDate),
      );
    }

    return await this.leaveRequestRepository.find({
      where,
      relations: ['employee', 'leaveType', 'approvedBy', 'flowInstance'],
      order: { appliedAt: 'DESC' },
    });
  }

  /**
   * Find one leave request by ID
   */
  async findOne(tenantId: string, id: string): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOne({
      where: { id, tenantId },
      relations: [
        'employee',
        'leaveType',
        'approvedBy',
        'flowInstance',
        'flowInstance.flowStepInstances',
        'flowInstance.flowStepInstances.stepDefinition',
      ],
    });

    if (!leaveRequest) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }

    return leaveRequest;
  }

  /**
   * Get all leave requests for an employee
   */
  async getEmployeeLeaves(
    tenantId: string,
    employeeId: string,
    year?: number,
  ): Promise<LeaveRequest[]> {
    const where: any = { tenantId, employeeId };

    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      where.fromDate = Between(startDate, endDate);
    }

    return await this.leaveRequestRepository.find({
      where,
      relations: ['leaveType', 'approvedBy'],
      order: { fromDate: 'DESC' },
    });
  }

  /**
   * Approve leave request and deduct from balance
   */
  async approve(
    tenantId: string,
    id: string,
    userId: string,
    comments?: string,
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(tenantId, id);

    if (leaveRequest.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot approve leave request with status: ${leaveRequest.status}`,
      );
    }

    // Update leave request status
    leaveRequest.status = 'APPROVED';
    leaveRequest.approvedById = userId;
    leaveRequest.approvedAt = new Date();

    await this.leaveRequestRepository.save(leaveRequest);

    // Get the year from the from date
    const year = leaveRequest.fromDate.getFullYear();

    // Deduct from leave balance (this also reduces pending)
    await this.leaveBalancesService.deductLeave(
      tenantId,
      leaveRequest.employeeId,
      leaveRequest.leaveTypeId,
      year,
      Number(leaveRequest.numberOfDays),
    );

    // If there's a flow instance, complete it
    if (leaveRequest.flowInstanceId) {
      try {
        await this.flowExecutionService.completeFlow(leaveRequest.flowInstanceId);
      } catch (error) {
        console.error('Failed to complete flow instance:', error);
      }
    }

    return await this.findOne(tenantId, id);
  }

  /**
   * Reject leave request
   */
  async reject(
    tenantId: string,
    id: string,
    userId: string,
    reason: string,
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(tenantId, id);

    if (leaveRequest.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot reject leave request with status: ${leaveRequest.status}`,
      );
    }

    // Update leave request status
    leaveRequest.status = 'REJECTED';
    leaveRequest.approvedById = userId;
    leaveRequest.approvedAt = new Date();
    leaveRequest.rejectionReason = reason;

    await this.leaveRequestRepository.save(leaveRequest);

    // Get the year from the from date
    const year = leaveRequest.fromDate.getFullYear();

    // Remove from pending balance
    await this.leaveBalancesService.removeFromPending(
      tenantId,
      leaveRequest.employeeId,
      leaveRequest.leaveTypeId,
      year,
      Number(leaveRequest.numberOfDays),
    );

    // If there's a flow instance, cancel it
    if (leaveRequest.flowInstanceId) {
      try {
        await this.flowExecutionService.cancelFlow(
          tenantId,
          leaveRequest.flowInstanceId,
          userId,
        );
      } catch (error) {
        console.error('Failed to cancel flow instance:', error);
      }
    }

    return await this.findOne(tenantId, id);
  }

  /**
   * Cancel leave request
   */
  async cancel(
    tenantId: string,
    id: string,
    userId: string,
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(tenantId, id);

    if (leaveRequest.status !== 'PENDING' && leaveRequest.status !== 'APPROVED') {
      throw new BadRequestException(
        `Cannot cancel leave request with status: ${leaveRequest.status}`,
      );
    }

    const previousStatus = leaveRequest.status;

    // Update leave request status
    leaveRequest.status = 'CANCELLED';

    await this.leaveRequestRepository.save(leaveRequest);

    // Get the year from the from date
    const year = leaveRequest.fromDate.getFullYear();

    // Adjust balance based on previous status
    if (previousStatus === 'PENDING') {
      // Remove from pending balance
      await this.leaveBalancesService.removeFromPending(
        tenantId,
        leaveRequest.employeeId,
        leaveRequest.leaveTypeId,
        year,
        Number(leaveRequest.numberOfDays),
      );
    } else if (previousStatus === 'APPROVED') {
      // Add back to balance by reducing used
      const balance = await this.leaveBalancesService.getBalance(
        tenantId,
        leaveRequest.employeeId,
        leaveRequest.leaveTypeId,
        year,
      );

      if (balance) {
        balance.used = Number(balance.used) - Number(leaveRequest.numberOfDays);
        await this.leaveBalancesService.updateBalance(
          tenantId,
          leaveRequest.employeeId,
          leaveRequest.leaveTypeId,
          year,
          { used: balance.used },
        );
      }
    }

    // If there's a flow instance, cancel it
    if (leaveRequest.flowInstanceId) {
      try {
        await this.flowExecutionService.cancelFlow(
          tenantId,
          leaveRequest.flowInstanceId,
          userId,
        );
      } catch (error) {
        console.error('Failed to cancel flow instance:', error);
      }
    }

    return await this.findOne(tenantId, id);
  }

  /**
   * Get leave summary for an employee
   */
  async getLeaveSummary(
    tenantId: string,
    employeeId: string,
    year: number,
  ): Promise<any> {
    // Get all balances
    const balances = await this.leaveBalancesService.getEmployeeBalances(
      tenantId,
      employeeId,
      year,
    );

    // Get all leave requests for the year
    const leaveRequests = await this.getEmployeeLeaves(tenantId, employeeId, year);

    return {
      year,
      balances: balances.map((balance) => ({
        leaveType: balance.leaveType,
        openingBalance: balance.openingBalance,
        accrued: balance.accrued,
        used: balance.used,
        pending: balance.pending,
        available: balance.available,
      })),
      leaveRequests: leaveRequests.map((request) => ({
        id: request.id,
        leaveType: request.leaveType,
        fromDate: request.fromDate,
        toDate: request.toDate,
        numberOfDays: request.numberOfDays,
        status: request.status,
        reason: request.reason,
        appliedAt: request.appliedAt,
        approvedAt: request.approvedAt,
      })),
      statistics: {
        totalApproved: leaveRequests.filter((r) => r.status === 'APPROVED').length,
        totalPending: leaveRequests.filter((r) => r.status === 'PENDING').length,
        totalRejected: leaveRequests.filter((r) => r.status === 'REJECTED').length,
        totalCancelled: leaveRequests.filter((r) => r.status === 'CANCELLED').length,
      },
    };
  }
}
