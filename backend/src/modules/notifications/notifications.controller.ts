import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { NotificationsService } from './notifications.service';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('notifications')
@UseGuards(PermissionsGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /notifications - Get my notifications
   */
  @Get()
  @RequirePermissions({ module: 'NOTIFICATIONS', action: 'READ' })
  async findAll(@Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    return await this.notificationsService.findAll(tenantId, userId);
  }

  /**
   * GET /notifications/unread-count - Get unread count
   */
  @Get('unread-count')
  @RequirePermissions({ module: 'NOTIFICATIONS', action: 'READ' })
  async getUnreadCount(@Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    const count = await this.notificationsService.getUnreadCount(
      tenantId,
      userId,
    );
    return { count };
  }

  /**
   * PATCH /notifications/:id/read - Mark notification as read
   */
  @Patch(':id/read')
  @RequirePermissions({ module: 'NOTIFICATIONS', action: 'UPDATE' })
  async markAsRead(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    return await this.notificationsService.markAsRead(tenantId, id, userId);
  }

  /**
   * PATCH /notifications/read-all - Mark all notifications as read
   */
  @Patch('read-all')
  @RequirePermissions({ module: 'NOTIFICATIONS', action: 'UPDATE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAllAsRead(@Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    await this.notificationsService.markAllAsRead(tenantId, userId);
  }

  /**
   * DELETE /notifications/:id - Delete notification
   */
  @Delete(':id')
  @RequirePermissions({ module: 'NOTIFICATIONS', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    await this.notificationsService.delete(tenantId, id, userId);
  }
}
