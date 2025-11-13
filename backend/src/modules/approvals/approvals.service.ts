import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Approval } from './entities/approval.entity';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { ApproveDto } from './dto/approve.dto';
import { RejectDto } from './dto/reject.dto';

@Injectable()
export class ApprovalsService {
  constructor(
    @InjectRepository(Approval)
    private approvalRepository: Repository<Approval>,
  ) {}

  /**
   * Create a new approval
   */
  async createApproval(
    tenantId: string,
    createApprovalDto: CreateApprovalDto,
  ): Promise<Approval> {
    // Validate tenant ID matches
    if (createApprovalDto.tenantId !== tenantId) {
      throw new BadRequestException('Tenant ID mismatch');
    }

    const approval = this.approvalRepository.create({
      ...createApprovalDto,
      status: 'PENDING',
    });

    return await this.approvalRepository.save(approval);
  }

  /**
   * Get pending approvals assigned to a user
   */
  async getPendingApprovals(
    tenantId: string,
    userId: string,
  ): Promise<Approval[]> {
    return await this.approvalRepository.find({
      where: {
        tenantId,
        approverId: userId,
        status: 'PENDING',
      },
      relations: ['approver'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Approve an approval request
   */
  async approve(
    tenantId: string,
    approvalId: string,
    userId: string,
    approveDto: ApproveDto,
  ): Promise<Approval> {
    const approval = await this.approvalRepository.findOne({
      where: { id: approvalId, tenantId },
      relations: ['approver'],
    });

    if (!approval) {
      throw new NotFoundException(`Approval with ID ${approvalId} not found`);
    }

    // Check if the user is the assigned approver
    if (approval.approverId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to approve this request',
      );
    }

    // Check if approval is still pending
    if (approval.status !== 'PENDING') {
      throw new BadRequestException(
        `Approval is already ${approval.status.toLowerCase()}`,
      );
    }

    // Update approval
    approval.status = 'APPROVED';
    approval.comments = approveDto.comments || approval.comments;
    approval.approvedAt = new Date();

    return await this.approvalRepository.save(approval);
  }

  /**
   * Reject an approval request
   */
  async reject(
    tenantId: string,
    approvalId: string,
    userId: string,
    rejectDto: RejectDto,
  ): Promise<Approval> {
    const approval = await this.approvalRepository.findOne({
      where: { id: approvalId, tenantId },
      relations: ['approver'],
    });

    if (!approval) {
      throw new NotFoundException(`Approval with ID ${approvalId} not found`);
    }

    // Check if the user is the assigned approver
    if (approval.approverId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to reject this request',
      );
    }

    // Check if approval is still pending
    if (approval.status !== 'PENDING') {
      throw new BadRequestException(
        `Approval is already ${approval.status.toLowerCase()}`,
      );
    }

    // Update approval with rejection
    approval.status = 'REJECTED';
    approval.comments = rejectDto.reason;
    if (rejectDto.comments) {
      approval.comments = `${rejectDto.reason}. ${rejectDto.comments}`;
    }
    approval.approvedAt = new Date();

    return await this.approvalRepository.save(approval);
  }

  /**
   * Find one approval by ID
   */
  async findOne(tenantId: string, id: string): Promise<Approval> {
    const approval = await this.approvalRepository.findOne({
      where: { id, tenantId },
      relations: ['approver', 'flowStepInstance'],
    });

    if (!approval) {
      throw new NotFoundException(`Approval with ID ${id} not found`);
    }

    return approval;
  }

  /**
   * Find approvals by entity
   */
  async findByEntity(
    tenantId: string,
    entityType: string,
    entityId: string,
  ): Promise<Approval[]> {
    return await this.approvalRepository.find({
      where: {
        tenantId,
        entityType,
        entityId,
      },
      relations: ['approver'],
      order: { createdAt: 'DESC' },
    });
  }
}
