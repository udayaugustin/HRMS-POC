import {
  Controller,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { DashboardService } from './dashboard.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@Controller('dashboard')
@UseGuards(PermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard/admin
   * Returns admin dashboard with system-wide statistics
   * Requires DASHBOARD:READ permission
   */
  @Get('admin')
  @RequirePermissions({ module: 'DASHBOARD', action: 'READ' })
  async getAdminDashboard(@Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.dashboardService.getAdminDashboard(tenantId);
  }

  /**
   * GET /dashboard/employee
   * Returns employee-specific dashboard data
   * Requires DASHBOARD:READ permission
   */
  @Get('employee')
  @RequirePermissions({ module: 'DASHBOARD', action: 'READ' })
  async getEmployeeDashboard(@Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    return await this.dashboardService.getEmployeeDashboard(tenantId, userId);
  }
}
