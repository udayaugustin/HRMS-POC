import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { PoliciesService } from './policies.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { PolicyDefinition } from './entities/policy-definition.entity';

@Controller('policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  /**
   * Create a new policy
   * POST /api/v1/policies
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: ExpressRequest,
    @Body() createPolicyDto: CreatePolicyDto,
  ): Promise<PolicyDefinition> {
    const tenantId = (req.user?.tenantId || req.headers['x-tenant-id']) as string;
    return await this.policiesService.create(tenantId, createPolicyDto);
  }

  /**
   * Get all policies for a tenant
   * GET /api/v1/policies
   */
  @Get()
  async findAll(
    @Request() req: ExpressRequest,
    @Query('type') policyType?: string,
  ): Promise<PolicyDefinition[]> {
    const tenantId = (req.user?.tenantId || req.headers['x-tenant-id']) as string;

    if (policyType) {
      return await this.policiesService.findByType(tenantId, policyType);
    }

    return await this.policiesService.findAll(tenantId);
  }

  /**
   * Get a policy by ID
   * GET /api/v1/policies/:id
   */
  @Get(':id')
  async findOne(@Request() req: ExpressRequest, @Param('id') id: string): Promise<PolicyDefinition> {
    const tenantId = (req.user?.tenantId || req.headers['x-tenant-id']) as string;
    return await this.policiesService.findOne(tenantId, id);
  }

  /**
   * Get policies by type
   * GET /api/v1/policies/type/:type
   */
  @Get('type/:type')
  async findByType(
    @Request() req: ExpressRequest,
    @Param('type') policyType: string,
  ): Promise<PolicyDefinition[]> {
    const tenantId = (req.user?.tenantId || req.headers['x-tenant-id']) as string;
    return await this.policiesService.findByType(tenantId, policyType);
  }

  /**
   * Update a policy
   * PATCH /api/v1/policies/:id
   */
  @Patch(':id')
  async update(
    @Request() req: ExpressRequest,
    @Param('id') id: string,
    @Body() updatePolicyDto: UpdatePolicyDto,
  ): Promise<PolicyDefinition> {
    const tenantId = (req.user?.tenantId || req.headers['x-tenant-id']) as string;
    return await this.policiesService.update(tenantId, id, updatePolicyDto);
  }

  /**
   * Soft delete a policy (mark as inactive)
   * DELETE /api/v1/policies/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Request() req: ExpressRequest, @Param('id') id: string): Promise<PolicyDefinition> {
    const tenantId = (req.user?.tenantId || req.headers['x-tenant-id']) as string;
    return await this.policiesService.remove(tenantId, id);
  }

  /**
   * Evaluate a policy against a given context
   * POST /api/v1/policies/:id/evaluate
   */
  @Post(':id/evaluate')
  @HttpCode(HttpStatus.OK)
  async evaluatePolicy(
    @Param('id') id: string,
    @Body() context: Record<string, any>,
  ): Promise<{
    passed: boolean;
    results: Array<{ rule: string; passed: boolean; message?: string }>;
    value?: any;
  }> {
    return await this.policiesService.evaluatePolicy(id, context);
  }

  /**
   * Calculate leave balance for an employee
   * GET /api/v1/policies/leave-balance/:employeeId/:leaveTypeId
   */
  @Get('leave-balance/:employeeId/:leaveTypeId')
  async calculateLeaveBalance(
    @Param('employeeId') employeeId: string,
    @Param('leaveTypeId') leaveTypeId: string,
  ): Promise<{
    entitlement: number;
    accrued: number;
    available: number;
    details: Record<string, any>;
  }> {
    return await this.policiesService.calculateLeaveBalance(employeeId, leaveTypeId);
  }
}
