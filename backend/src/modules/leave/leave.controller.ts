import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { LeaveTypesService } from './services/leave-types.service';
import { LeaveBalancesService } from './services/leave-balances.service';
import { LeaveRequestsService } from './services/leave-requests.service';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { CreateLeaveBalanceDto } from './dto/create-leave-balance.dto';
import { UpdateLeaveBalanceDto } from './dto/update-leave-balance.dto';
import { ApplyLeaveDto } from './dto/apply-leave.dto';
import { RejectLeaveDto } from './dto/reject-leave.dto';
import { ApproveLeaveDto } from './dto/approve-leave.dto';
import { LeaveRequestFiltersDto } from './dto/leave-request-filters.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@Controller('leave')
@UseGuards(PermissionsGuard)
export class LeaveController {
  constructor(
    private readonly leaveTypesService: LeaveTypesService,
    private readonly leaveBalancesService: LeaveBalancesService,
    private readonly leaveRequestsService: LeaveRequestsService,
  ) {}

  // ============ LEAVE TYPES ENDPOINTS ============

  @Post('types')
  @RequirePermissions({ module: 'LEAVE', action: 'CREATE' })
  async createLeaveType(
    @Body() createLeaveTypeDto: CreateLeaveTypeDto,
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.leaveTypesService.create(tenantId, createLeaveTypeDto);
  }

  @Get('types')
  @RequirePermissions({ module: 'LEAVE', action: 'READ' })
  async getAllLeaveTypes(
    @Request() req: ExpressRequest,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.leaveTypesService.findAll(
      tenantId,
      includeInactive === 'true',
    );
  }

  @Get('types/:id')
  @RequirePermissions({ module: 'LEAVE', action: 'READ' })
  async getLeaveType(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.leaveTypesService.findOne(tenantId, id);
  }

  @Patch('types/:id')
  @RequirePermissions({ module: 'LEAVE', action: 'UPDATE' })
  async updateLeaveType(
    @Param('id') id: string,
    @Body() updateLeaveTypeDto: UpdateLeaveTypeDto,
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.leaveTypesService.update(tenantId, id, updateLeaveTypeDto);
  }

  @Delete('types/:id')
  @RequirePermissions({ module: 'LEAVE', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLeaveType(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    await this.leaveTypesService.remove(tenantId, id);
  }

  // ============ LEAVE BALANCES ENDPOINTS ============

  @Post('balances')
  @RequirePermissions({ module: 'LEAVE', action: 'CREATE' })
  async createLeaveBalance(
    @Body() createLeaveBalanceDto: CreateLeaveBalanceDto,
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.leaveBalancesService.create(tenantId, createLeaveBalanceDto);
  }

  @Get('balances/employee/:employeeId')
  @RequirePermissions({ module: 'LEAVE', action: 'READ' })
  async getEmployeeBalances(
    @Param('employeeId') employeeId: string,
    @Query('year') year: string,
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    const balanceYear = year ? parseInt(year, 10) : new Date().getFullYear();
    return await this.leaveBalancesService.getEmployeeBalances(
      tenantId,
      employeeId,
      balanceYear,
    );
  }

  @Get('balances/:employeeId/:leaveTypeId/:year')
  @RequirePermissions({ module: 'LEAVE', action: 'READ' })
  async getBalance(
    @Param('employeeId') employeeId: string,
    @Param('leaveTypeId') leaveTypeId: string,
    @Param('year') year: string,
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.leaveBalancesService.getBalance(
      tenantId,
      employeeId,
      leaveTypeId,
      parseInt(year, 10),
    );
  }

  @Patch('balances/:employeeId/:leaveTypeId/:year')
  @RequirePermissions({ module: 'LEAVE', action: 'UPDATE' })
  async updateBalance(
    @Param('employeeId') employeeId: string,
    @Param('leaveTypeId') leaveTypeId: string,
    @Param('year') year: string,
    @Body() updateLeaveBalanceDto: UpdateLeaveBalanceDto,
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.leaveBalancesService.updateBalance(
      tenantId,
      employeeId,
      leaveTypeId,
      parseInt(year, 10),
      updateLeaveBalanceDto,
    );
  }

  @Post('balances/initialize/:employeeId/:year')
  @RequirePermissions({ module: 'LEAVE', action: 'CREATE' })
  async initializeBalances(
    @Param('employeeId') employeeId: string,
    @Param('year') year: string,
    @Body() body: { leaveTypeIds: string[]; openingBalance?: number },
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.leaveBalancesService.initializeBalances(
      tenantId,
      employeeId,
      parseInt(year, 10),
      body.leaveTypeIds,
      body.openingBalance,
    );
  }

  @Post('balances/accrue')
  @RequirePermissions({ module: 'LEAVE', action: 'UPDATE' })
  async accrueLeave(
    @Body()
    body: {
      employeeId: string;
      leaveTypeId: string;
      year: number;
      days: number;
    },
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.leaveBalancesService.accrueLeave(
      tenantId,
      body.employeeId,
      body.leaveTypeId,
      body.year,
      body.days,
    );
  }

  // ============ LEAVE REQUESTS ENDPOINTS ============

  @Post('requests/apply')
  @RequirePermissions({ module: 'LEAVE', action: 'CREATE' })
  async applyLeave(@Body() applyLeaveDto: ApplyLeaveDto, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    const employeeId = req.user!.employeeId;
    const userId = req.user!.userId;

    if (!employeeId) {
      throw new Error('Employee ID not found in user context');
    }

    return await this.leaveRequestsService.apply(
      tenantId,
      employeeId,
      userId,
      applyLeaveDto,
    );
  }

  @Get('requests')
  @RequirePermissions({ module: 'LEAVE', action: 'READ' })
  async getAllLeaveRequests(
    @Query() filters: LeaveRequestFiltersDto,
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.leaveRequestsService.findAll(tenantId, filters);
  }

  @Get('requests/:id')
  @RequirePermissions({ module: 'LEAVE', action: 'READ' })
  async getLeaveRequest(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.leaveRequestsService.findOne(tenantId, id);
  }

  @Get('requests/employee/:employeeId')
  @RequirePermissions({ module: 'LEAVE', action: 'READ' })
  async getEmployeeLeaveRequests(
    @Param('employeeId') employeeId: string,
    @Query('year') year: string,
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    const requestYear = year ? parseInt(year, 10) : undefined;
    return await this.leaveRequestsService.getEmployeeLeaves(
      tenantId,
      employeeId,
      requestYear,
    );
  }

  @Patch('requests/:id/approve')
  @RequirePermissions({ module: 'LEAVE', action: 'APPROVE' })
  async approveLeaveRequest(
    @Param('id') id: string,
    @Body() approveLeaveDto: ApproveLeaveDto,
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    return await this.leaveRequestsService.approve(
      tenantId,
      id,
      userId,
      approveLeaveDto.comments,
    );
  }

  @Patch('requests/:id/reject')
  @RequirePermissions({ module: 'LEAVE', action: 'APPROVE' })
  async rejectLeaveRequest(
    @Param('id') id: string,
    @Body() rejectLeaveDto: RejectLeaveDto,
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    return await this.leaveRequestsService.reject(
      tenantId,
      id,
      userId,
      rejectLeaveDto.reason,
    );
  }

  @Delete('requests/:id')
  @RequirePermissions({ module: 'LEAVE', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelLeaveRequest(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    await this.leaveRequestsService.cancel(tenantId, id, userId);
  }

  @Get('summary/:employeeId/:year')
  @RequirePermissions({ module: 'LEAVE', action: 'READ' })
  async getLeaveSummary(
    @Param('employeeId') employeeId: string,
    @Param('year') year: string,
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.leaveRequestsService.getLeaveSummary(
      tenantId,
      employeeId,
      parseInt(year, 10),
    );
  }
}
