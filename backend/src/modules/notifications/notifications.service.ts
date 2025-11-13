import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  /**
   * Create a new notification
   */
  async create(
    tenantId: string,
    userId: string,
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    // Validate tenant ID and user ID match
    if (createNotificationDto.tenantId !== tenantId) {
      throw new BadRequestException('Tenant ID mismatch');
    }
    if (createNotificationDto.userId !== userId) {
      throw new BadRequestException('User ID mismatch');
    }

    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      isRead: false,
    });

    return await this.notificationRepository.save(notification);
  }

  /**
   * Find all notifications for a user
   */
  async findAll(tenantId: string, userId: string): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: {
        tenantId,
        userId,
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(
    tenantId: string,
    id: string,
    userId: string,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, tenantId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    // Check if the user owns this notification
    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this notification',
      );
    }

    // Mark as read
    notification.isRead = true;
    notification.readAt = new Date();

    return await this.notificationRepository.save(notification);
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(tenantId: string, userId: string): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true, readAt: new Date() })
      .where('tenantId = :tenantId', { tenantId })
      .andWhere('userId = :userId', { userId })
      .andWhere('isRead = :isRead', { isRead: false })
      .execute();
  }

  /**
   * Delete a notification
   */
  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id, tenantId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    // Check if the user owns this notification
    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this notification',
      );
    }

    await this.notificationRepository.remove(notification);
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(tenantId: string, userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: {
        tenantId,
        userId,
        isRead: false,
      },
    });
  }

  /**
   * Helper: Notify approver when approval is pending
   */
  async notifyApprovalPending(
    tenantId: string,
    approverId: string,
    entityType: string,
    entityId: string,
    message: string,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      tenantId,
      userId: approverId,
      title: 'New Approval Request',
      message,
      notificationType: 'APPROVAL_PENDING',
      entityType,
      entityId,
      isRead: false,
    });

    return await this.notificationRepository.save(notification);
  }

  /**
   * Helper: Notify requester when approval is complete
   */
  async notifyApprovalComplete(
    tenantId: string,
    requesterId: string,
    status: string,
    message: string,
  ): Promise<Notification> {
    const notificationType =
      status === 'APPROVED' ? 'APPROVAL_APPROVED' : 'APPROVAL_REJECTED';

    const notification = this.notificationRepository.create({
      tenantId,
      userId: requesterId,
      title: `Request ${status}`,
      message,
      notificationType,
      isRead: false,
    });

    return await this.notificationRepository.save(notification);
  }
}
