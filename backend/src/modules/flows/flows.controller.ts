import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { FlowDefinitionsService } from './flow-definitions.service';
import { FlowVersionsService } from './flow-versions.service';
import { FlowStepsService } from './flow-steps.service';
import { FlowExecutionService } from './flow-execution.service';
import { CreateFlowDefinitionDto } from './dto/create-flow-definition.dto';
import { UpdateFlowDefinitionDto } from './dto/update-flow-definition.dto';
import { CreateFlowVersionDto } from './dto/create-flow-version.dto';
import { PublishFlowVersionDto } from './dto/publish-flow-version.dto';
import { CreateFlowStepDto } from './dto/create-flow-step.dto';
import { UpdateFlowStepDto } from './dto/update-flow-step.dto';
import { ReorderStepsDto } from './dto/reorder-steps.dto';
import { StartFlowDto } from './dto/start-flow.dto';
import { SubmitStepDto } from './dto/submit-step.dto';

@Controller('flows')
export class FlowsController {
  constructor(
    private readonly flowDefinitionsService: FlowDefinitionsService,
    private readonly flowVersionsService: FlowVersionsService,
    private readonly flowStepsService: FlowStepsService,
    private readonly flowExecutionService: FlowExecutionService,
  ) {}

  // ============================================================
  // FLOW DEFINITIONS ENDPOINTS
  // ============================================================

  /**
   * Create a new flow definition
   */
  @Post('definitions')
  async createFlowDefinition(
    @Request() req: ExpressRequest,
    @Body() createFlowDefinitionDto: CreateFlowDefinitionDto,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.flowDefinitionsService.create(tenantId, createFlowDefinitionDto);
  }

  /**
   * Get all flow definitions for the tenant
   */
  @Get('definitions')
  async getAllFlowDefinitions(@Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.flowDefinitionsService.findAll(tenantId);
  }

  /**
   * Get a specific flow definition by ID
   */
  @Get('definitions/:id')
  async getFlowDefinition(@Request() req: ExpressRequest, @Param('id') id: string) {
    const tenantId = req.user!.tenantId;
    return await this.flowDefinitionsService.findOne(id, tenantId);
  }

  /**
   * Get flow definition by type
   */
  @Get('definitions/type/:flowType')
  async getFlowDefinitionByType(
    @Request() req: ExpressRequest,
    @Param('flowType') flowType: string,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.flowDefinitionsService.findByType(flowType, tenantId);
  }

  /**
   * Update a flow definition
   */
  @Put('definitions/:id')
  async updateFlowDefinition(
    @Request() req: ExpressRequest,
    @Param('id') id: string,
    @Body() updateFlowDefinitionDto: UpdateFlowDefinitionDto,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.flowDefinitionsService.update(id, tenantId, updateFlowDefinitionDto);
  }

  /**
   * Delete a flow definition
   */
  @Delete('definitions/:id')
  async deleteFlowDefinition(@Request() req: ExpressRequest, @Param('id') id: string) {
    const tenantId = req.user!.tenantId;
    await this.flowDefinitionsService.remove(id, tenantId);
    return { message: 'Flow definition deleted successfully' };
  }

  /**
   * Deactivate a flow definition
   */
  @Patch('definitions/:id/deactivate')
  async deactivateFlowDefinition(@Request() req: ExpressRequest, @Param('id') id: string) {
    const tenantId = req.user!.tenantId;
    return await this.flowDefinitionsService.deactivate(id, tenantId);
  }

  /**
   * Activate a flow definition
   */
  @Patch('definitions/:id/activate')
  async activateFlowDefinition(@Request() req: ExpressRequest, @Param('id') id: string) {
    const tenantId = req.user!.tenantId;
    return await this.flowDefinitionsService.activate(id, tenantId);
  }

  // ============================================================
  // FLOW VERSIONS ENDPOINTS
  // ============================================================

  /**
   * Create a new flow version
   */
  @Post('versions')
  async createFlowVersion(
    @Request() req: ExpressRequest,
    @Body() createFlowVersionDto: CreateFlowVersionDto,
  ) {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    return await this.flowVersionsService.create(tenantId, userId, createFlowVersionDto);
  }

  /**
   * Get all versions for a flow definition
   */
  @Get('definitions/:flowDefinitionId/versions')
  async getAllFlowVersions(
    @Request() req: ExpressRequest,
    @Param('flowDefinitionId') flowDefinitionId: string,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.flowVersionsService.findAll(flowDefinitionId, tenantId);
  }

  /**
   * Get a specific flow version by ID
   */
  @Get('versions/:id')
  async getFlowVersion(@Request() req: ExpressRequest, @Param('id') id: string) {
    const tenantId = req.user!.tenantId;
    return await this.flowVersionsService.findOne(id, tenantId);
  }

  /**
   * Get the active (published) version for a flow definition
   */
  @Get('definitions/:flowDefinitionId/active-version')
  async getActiveVersion(
    @Request() req: ExpressRequest,
    @Param('flowDefinitionId') flowDefinitionId: string,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.flowVersionsService.getActiveVersion(flowDefinitionId, tenantId);
  }

  /**
   * Publish a flow version
   */
  @Patch('versions/:id/publish')
  async publishFlowVersion(
    @Request() req: ExpressRequest,
    @Param('id') id: string,
    @Body() publishDto: PublishFlowVersionDto,
  ) {
    const tenantId = req.user!.tenantId;
    const archiveOldVersion = publishDto.archiveOldVersion ?? true;
    return await this.flowVersionsService.publish(id, tenantId, archiveOldVersion);
  }

  /**
   * Archive a flow version
   */
  @Patch('versions/:id/archive')
  async archiveFlowVersion(@Request() req: ExpressRequest, @Param('id') id: string) {
    const tenantId = req.user!.tenantId;
    return await this.flowVersionsService.archive(id, tenantId);
  }

  /**
   * Delete a flow version (only drafts)
   */
  @Delete('versions/:id')
  async deleteFlowVersion(@Request() req: ExpressRequest, @Param('id') id: string) {
    const tenantId = req.user!.tenantId;
    await this.flowVersionsService.remove(id, tenantId);
    return { message: 'Flow version deleted successfully' };
  }

  // ============================================================
  // FLOW STEPS ENDPOINTS
  // ============================================================

  /**
   * Create a new step in a flow version
   */
  @Post('steps')
  async createFlowStep(
    @Request() req: ExpressRequest,
    @Body() createFlowStepDto: CreateFlowStepDto,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.flowStepsService.createStep(tenantId, createFlowStepDto);
  }

  /**
   * Get all steps for a flow version
   */
  @Get('versions/:flowVersionId/steps')
  async getFlowSteps(
    @Request() req: ExpressRequest,
    @Param('flowVersionId') flowVersionId: string,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.flowStepsService.getStepsForVersion(flowVersionId, tenantId);
  }

  /**
   * Get a specific step by ID
   */
  @Get('steps/:id')
  async getFlowStep(@Request() req: ExpressRequest, @Param('id') id: string) {
    const tenantId = req.user!.tenantId;
    return await this.flowStepsService.findOne(id, tenantId);
  }

  /**
   * Update a flow step
   */
  @Put('steps/:id')
  async updateFlowStep(
    @Request() req: ExpressRequest,
    @Param('id') id: string,
    @Body() updateFlowStepDto: UpdateFlowStepDto,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.flowStepsService.updateStep(id, tenantId, updateFlowStepDto);
  }

  /**
   * Delete a flow step
   */
  @Delete('steps/:id')
  async deleteFlowStep(@Request() req: ExpressRequest, @Param('id') id: string) {
    const tenantId = req.user!.tenantId;
    await this.flowStepsService.deleteStep(id, tenantId);
    return { message: 'Flow step deleted successfully' };
  }

  /**
   * Reorder steps in a flow version
   */
  @Patch('versions/:flowVersionId/reorder-steps')
  async reorderSteps(
    @Request() req: ExpressRequest,
    @Param('flowVersionId') flowVersionId: string,
    @Body() reorderStepsDto: ReorderStepsDto,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.flowStepsService.reorderSteps(
      flowVersionId,
      tenantId,
      reorderStepsDto.steps,
    );
  }

  /**
   * Get the next step order number for a flow version
   */
  @Get('versions/:flowVersionId/next-step-order')
  async getNextStepOrder(
    @Request() req: ExpressRequest,
    @Param('flowVersionId') flowVersionId: string,
  ) {
    const tenantId = req.user!.tenantId;
    const nextOrder = await this.flowStepsService.getNextStepOrder(flowVersionId, tenantId);
    return { nextOrder };
  }

  // ============================================================
  // FLOW EXECUTION ENDPOINTS
  // ============================================================

  /**
   * Start a new flow instance
   */
  @Post('execute/start')
  async startFlow(@Request() req: ExpressRequest, @Body() startFlowDto: StartFlowDto) {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    return await this.flowExecutionService.startFlow(
      tenantId,
      startFlowDto.flowType,
      userId,
      startFlowDto.entityId,
      startFlowDto.entityType,
    );
  }

  /**
   * Get all flow instances with optional filters
   */
  @Get('instances')
  async getAllFlowInstances(
    @Request() req: ExpressRequest,
    @Query('flowType') flowType?: string,
    @Query('status') status?: string,
    @Query('initiatedById') initiatedById?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.flowExecutionService.findAll(tenantId, {
      flowType,
      status,
      initiatedById,
      entityType,
      entityId,
    });
  }

  /**
   * Get a specific flow instance
   */
  @Get('instances/:id')
  async getFlowInstance(@Request() req: ExpressRequest, @Param('id') id: string) {
    const tenantId = req.user!.tenantId;
    return await this.flowExecutionService.getFlowInstance(tenantId, id);
  }

  /**
   * Get the current step for a flow instance
   */
  @Get('instances/:id/current-step')
  async getCurrentStep(@Request() req: ExpressRequest, @Param('id') id: string) {
    const tenantId = req.user!.tenantId;
    return await this.flowExecutionService.getCurrentStep(tenantId, id);
  }

  /**
   * Get all steps for a flow instance
   */
  @Get('instances/:id/steps')
  async getFlowInstanceSteps(@Request() req: ExpressRequest, @Param('id') id: string) {
    const tenantId = req.user!.tenantId;
    return await this.flowExecutionService.getFlowSteps(tenantId, id);
  }

  /**
   * Submit data for a step
   */
  @Post('instances/:flowInstanceId/submit-step')
  async submitStep(
    @Request() req: ExpressRequest,
    @Param('flowInstanceId') flowInstanceId: string,
    @Body() submitStepDto: SubmitStepDto,
  ) {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    return await this.flowExecutionService.submitStep(
      tenantId,
      flowInstanceId,
      submitStepDto.stepInstanceId,
      userId,
      submitStepDto.data,
      submitStepDto.comments,
    );
  }

  /**
   * Cancel a flow instance
   */
  @Patch('instances/:id/cancel')
  async cancelFlow(@Request() req: ExpressRequest, @Param('id') id: string) {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    return await this.flowExecutionService.cancelFlow(tenantId, id, userId);
  }

  /**
   * Assign a step to a user
   */
  @Patch('step-instances/:stepInstanceId/assign')
  async assignStep(
    @Request() req: ExpressRequest,
    @Param('stepInstanceId') stepInstanceId: string,
    @Body('assignedToId') assignedToId: string,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.flowExecutionService.assignStep(
      tenantId,
      stepInstanceId,
      assignedToId,
    );
  }

  /**
   * Get a specific step instance
   */
  @Get('step-instances/:id')
  async getStepInstance(@Request() req: ExpressRequest, @Param('id') id: string) {
    const tenantId = req.user!.tenantId;
    return await this.flowExecutionService.getStepInstance(tenantId, id);
  }
}
