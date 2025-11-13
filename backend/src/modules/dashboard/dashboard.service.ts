import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../employees/entities/employee.entity';
import { Department } from '../departments/entities/department.entity';
import { FlowDefinition } from '../flows/entities/flow-definition.entity';
import { FlowStepInstance } from '../flows/entities/flow-step-instance.entity';
import { Approval } from '../approvals/entities/approval.entity';
import { LeaveRequest } from '../leave/entities/leave-request.entity';
import { LeaveBalance } from '../leave/entities/leave-balance.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(FlowDefinition)
    private flowDefinitionRepository: Repository<FlowDefinition>,
    @InjectRepository(FlowStepInstance)
    private flowStepInstanceRepository: Repository<FlowStepInstance>,
    @InjectRepository(Approval)
    private approvalRepository: Repository<Approval>,
    @InjectRepository(LeaveRequest)
    private leaveRequestRepository: Repository<LeaveRequest>,
    @InjectRepository(LeaveBalance)
    private leaveBalanceRepository: Repository<LeaveBalance>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Get Admin Dashboard data
   * Returns system-wide statistics and metrics
   */
  async getAdminDashboard(tenantId: string) {
    // Total employees count
    const totalEmployees = await this.employeeRepository.count({
      where: { tenantId },
    });

    // Active employees count
    const activeEmployees = await this.employeeRepository.count({
      where: { tenantId, employmentStatus: 'ACTIVE', isActive: true },
    });

    // Total departments count
    const totalDepartments = await this.departmentRepository.count({
      where: { tenantId, isActive: true },
    });

    // Total flows count
    const totalFlows = await this.flowDefinitionRepository.count({
      where: { tenantId, isActive: true },
    });

    // Pending approvals count
    const pendingApprovals = await this.approvalRepository.count({
      where: { tenantId, status: 'PENDING' },
    });

    // Recent activities (last 10 notifications)
    const recentActivities = await this.notificationRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: 10,
      relations: ['user'],
    });

    // Leave requests by status
    const leaveRequestsByStatus = await this.leaveRequestRepository
      .createQueryBuilder('lr')
      .select('lr.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('lr.tenantId = :tenantId', { tenantId })
      .groupBy('lr.status')
      .getRawMany();

    // Format leave requests by status
    const leaveRequestsStats: Record<string, number> = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      CANCELLED: 0,
    };

    leaveRequestsByStatus.forEach((item) => {
      if (item.status in leaveRequestsStats) {
        leaveRequestsStats[item.status] = parseInt(item.count, 10);
      }
    });

    return {
      totalEmployees,
      activeEmployees,
      totalDepartments,
      totalFlows,
      pendingApprovals,
      recentActivities: recentActivities.map((activity) => ({
        id: activity.id,
        title: activity.title,
        message: activity.message,
        type: activity.notificationType,
        entityType: activity.entityType,
        entityId: activity.entityId,
        isRead: activity.isRead,
        createdAt: activity.createdAt,
        user: activity.user
          ? {
              id: activity.user.id,
              firstName: activity.user.firstName,
              lastName: activity.user.lastName,
              email: activity.user.email,
            }
          : null,
      })),
      leaveRequestsByStatus: leaveRequestsStats,
    };
  }

  /**
   * Get Employee Dashboard data
   * Returns employee-specific data and metrics
   */
  async getEmployeeDashboard(tenantId: string, userId: string) {
    // Find employee by userId
    const employee = await this.employeeRepository.findOne({
      where: { tenantId, userId },
      relations: ['user', 'department', 'designation', 'location', 'manager'],
    });

    if (!employee) {
      throw new NotFoundException(
        'Employee profile not found for this user',
      );
    }

    // Employee profile summary
    const profileSummary = {
      id: employee.id,
      employeeCode: employee.employeeCode,
      firstName: employee.user?.firstName,
      lastName: employee.user?.lastName,
      email: employee.user?.email,
      phone: employee.phone,
      department: employee.department
        ? {
            id: employee.department.id,
            name: employee.department.name,
            code: employee.department.code,
          }
        : null,
      designation: employee.designation
        ? {
            id: employee.designation.id,
            title: employee.designation.title,
          }
        : null,
      location: employee.location
        ? {
            id: employee.location.id,
            name: employee.location.name,
          }
        : null,
      manager: employee.manager
        ? {
            id: employee.manager.id,
            employeeCode: employee.manager.employeeCode,
          }
        : null,
      joiningDate: employee.joiningDate,
      employmentStatus: employee.employmentStatus,
    };

    // Leave balances
    const currentYear = new Date().getFullYear();
    const leaveBalances = await this.leaveBalanceRepository.find({
      where: { tenantId, employeeId: employee.id, year: currentYear },
      relations: ['leaveType'],
    });

    const formattedLeaveBalances = leaveBalances.map((balance) => ({
      leaveType: balance.leaveType?.name || 'Unknown',
      leaveTypeId: balance.leaveTypeId,
      openingBalance: parseFloat(balance.openingBalance.toString()),
      accrued: parseFloat(balance.accrued.toString()),
      used: parseFloat(balance.used.toString()),
      pending: parseFloat(balance.pending.toString()),
      available: parseFloat(balance.available.toString()),
      year: balance.year,
    }));

    // Pending approvals for me (approvals assigned to this user)
    const pendingApprovalsForMe = await this.approvalRepository.find({
      where: { tenantId, approverId: userId, status: 'PENDING' },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const formattedApprovals = pendingApprovalsForMe.map((approval) => ({
      id: approval.id,
      entityType: approval.entityType,
      entityId: approval.entityId,
      approverRole: approval.approverRole,
      status: approval.status,
      createdAt: approval.createdAt,
    }));

    // My pending tasks (flow steps assigned to me)
    const myPendingTasks = await this.flowStepInstanceRepository.find({
      where: { assignedToId: userId, status: 'PENDING' },
      relations: ['flowInstance', 'stepDefinition'],
      order: { startedAt: 'DESC' },
      take: 10,
    });

    const formattedTasks = myPendingTasks.map((task) => ({
      id: task.id,
      flowInstanceId: task.flowInstanceId,
      stepOrder: task.stepOrder,
      status: task.status,
      startedAt: task.startedAt,
      stepDefinition: task.stepDefinition
        ? {
            id: task.stepDefinition.id,
            title: task.stepDefinition.title,
            stepType: task.stepDefinition.stepType,
          }
        : null,
    }));

    // Recent notifications (last 5)
    const recentNotifications = await this.notificationRepository.find({
      where: { tenantId, userId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const formattedNotifications = recentNotifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.notificationType,
      entityType: notification.entityType,
      entityId: notification.entityId,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    }));

    // Upcoming holidays (placeholder - since no holiday entity exists)
    // This would be populated when a holiday entity is created
    const upcomingHolidays: any[] = [];

    return {
      profileSummary,
      leaveBalances: formattedLeaveBalances,
      pendingApprovalsForMe: formattedApprovals,
      myPendingTasks: formattedTasks,
      recentNotifications: formattedNotifications,
      upcomingHolidays,
    };
  }
}
