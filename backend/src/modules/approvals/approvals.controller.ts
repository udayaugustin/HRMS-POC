import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ApprovalsService } from './approvals.service';
import { ApproveDto } from './dto/approve.dto';
import { RejectDto } from './dto/reject.dto';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('approvals')
@UseGuards(PermissionsGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  /**
   * GET /approvals/pending - Get my pending approvals
   */
  @Get('pending')
  @RequirePermissions({ module: 'APPROVALS', action: 'READ' })
  async getPendingApprovals(@Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    return await this.approvalsService.getPendingApprovals(tenantId, userId);
  }

  /**
   * GET /approvals/:id - Get approval by ID
   */
  @Get(':id')
  @RequirePermissions({ module: 'APPROVALS', action: 'READ' })
  async findOne(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.approvalsService.findOne(tenantId, id);
  }

  /**
   * POST /approvals/:id/approve - Approve an approval
   */
  @Post(':id/approve')
  @RequirePermissions({ module: 'APPROVALS', action: 'UPDATE' })
  async approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveDto,
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    return await this.approvalsService.approve(
      tenantId,
      id,
      userId,
      approveDto,
    );
  }

  /**
   * POST /approvals/:id/reject - Reject an approval
   */
  @Post(':id/reject')
  @RequirePermissions({ module: 'APPROVALS', action: 'UPDATE' })
  async reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectDto,
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    return await this.approvalsService.reject(tenantId, id, userId, rejectDto);
  }
}
