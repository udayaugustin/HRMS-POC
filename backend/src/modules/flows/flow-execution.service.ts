import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlowInstance } from './entities/flow-instance.entity';
import { FlowStepInstance } from './entities/flow-step-instance.entity';
import { FlowVersion } from './entities/flow-version.entity';
import { FlowStepDefinition } from './entities/flow-step-definition.entity';
import { FlowVersionsService } from './flow-versions.service';

@Injectable()
export class FlowExecutionService {
  constructor(
    @InjectRepository(FlowInstance)
    private flowInstanceRepository: Repository<FlowInstance>,
    @InjectRepository(FlowStepInstance)
    private flowStepInstanceRepository: Repository<FlowStepInstance>,
    @InjectRepository(FlowStepDefinition)
    private flowStepDefinitionRepository: Repository<FlowStepDefinition>,
    private flowVersionsService: FlowVersionsService,
  ) {}

  /**
   * Start a new flow instance
   */
  async startFlow(
    tenantId: string,
    flowType: string,
    initiatedBy: string,
    entityId?: string,
    entityType?: string,
  ): Promise<FlowInstance> {
    // Get the active version for this flow type
    const flowVersion = await this.flowVersionsService.getActiveVersionByType(
      flowType,
      tenantId,
    );

    // Check if there are steps defined
    if (!flowVersion.flowStepDefinitions || flowVersion.flowStepDefinitions.length === 0) {
      throw new BadRequestException(
        'Cannot start flow: No steps defined in the active version',
      );
    }

    // Create flow instance
    const flowInstance = this.flowInstanceRepository.create({
      tenantId,
      flowVersionId: flowVersion.id,
      flowType,
      entityId,
      entityType,
      status: 'IN_PROGRESS',
      initiatedById: initiatedBy,
      startedAt: new Date(),
      currentStepOrder: 1,
    });

    const savedFlowInstance = await this.flowInstanceRepository.save(flowInstance);

    // Create step instances for all steps in the flow
    const stepDefinitions = flowVersion.flowStepDefinitions.sort(
      (a, b) => a.stepOrder - b.stepOrder,
    );

    for (const stepDef of stepDefinitions) {
      const stepInstance = this.flowStepInstanceRepository.create({
        flowInstanceId: savedFlowInstance.id,
        stepDefinitionId: stepDef.id,
        stepOrder: stepDef.stepOrder,
        status: stepDef.stepOrder === 1 ? 'IN_PROGRESS' : 'PENDING',
        data: {},
        startedAt: stepDef.stepOrder === 1 ? new Date() : undefined,
      });

      await this.flowStepInstanceRepository.save(stepInstance);
    }

    return await this.getFlowInstance(tenantId, savedFlowInstance.id);
  }

  /**
   * Get a flow instance with all its details
   */
  async getFlowInstance(tenantId: string, flowInstanceId: string): Promise<FlowInstance> {
    const flowInstance = await this.flowInstanceRepository.findOne({
      where: { id: flowInstanceId, tenantId },
      relations: [
        'flowVersion',
        'flowVersion.flowDefinition',
        'initiatedBy',
        'flowStepInstances',
        'flowStepInstances.stepDefinition',
        'flowStepInstances.stepDefinition.formSchema',
        'flowStepInstances.assignedTo',
        'flowStepInstances.completedBy',
      ],
    });

    if (!flowInstance) {
      throw new NotFoundException(`Flow instance with ID ${flowInstanceId} not found`);
    }

    // Sort step instances by order
    if (flowInstance.flowStepInstances) {
      flowInstance.flowStepInstances.sort((a, b) => a.stepOrder - b.stepOrder);
    }

    return flowInstance;
  }

  /**
   * Get all flow instances for a tenant
   */
  async findAll(
    tenantId: string,
    filters?: {
      flowType?: string;
      status?: string;
      initiatedById?: string;
      entityType?: string;
      entityId?: string;
    },
  ): Promise<FlowInstance[]> {
    const where: any = { tenantId };

    if (filters?.flowType) where.flowType = filters.flowType;
    if (filters?.status) where.status = filters.status;
    if (filters?.initiatedById) where.initiatedById = filters.initiatedById;
    if (filters?.entityType) where.entityType = filters.entityType;
    if (filters?.entityId) where.entityId = filters.entityId;

    return await this.flowInstanceRepository.find({
      where,
      relations: [
        'flowVersion',
        'initiatedBy',
        'flowStepInstances',
      ],
      order: { startedAt: 'DESC' },
    });
  }

  /**
   * Get the current step instance for a flow
   */
  async getCurrentStep(
    tenantId: string,
    flowInstanceId: string,
  ): Promise<FlowStepInstance> {
    const flowInstance = await this.flowInstanceRepository.findOne({
      where: { id: flowInstanceId, tenantId },
    });

    if (!flowInstance) {
      throw new NotFoundException(`Flow instance with ID ${flowInstanceId} not found`);
    }

    const currentStep = await this.flowStepInstanceRepository.findOne({
      where: {
        flowInstanceId,
        stepOrder: flowInstance.currentStepOrder,
      },
      relations: ['stepDefinition', 'stepDefinition.formSchema', 'assignedTo'],
    });

    if (!currentStep) {
      throw new NotFoundException('Current step not found');
    }

    return currentStep;
  }

  /**
   * Submit data for a step
   */
  async submitStep(
    tenantId: string,
    flowInstanceId: string,
    stepInstanceId: string,
    userId: string,
    data: Record<string, any>,
    comments?: string,
  ): Promise<FlowInstance> {
    // Verify flow instance exists
    const flowInstance = await this.flowInstanceRepository.findOne({
      where: { id: flowInstanceId, tenantId },
    });

    if (!flowInstance) {
      throw new NotFoundException(`Flow instance with ID ${flowInstanceId} not found`);
    }

    if (flowInstance.status === 'COMPLETED') {
      throw new BadRequestException('Flow is already completed');
    }

    if (flowInstance.status === 'CANCELLED') {
      throw new BadRequestException('Flow is cancelled');
    }

    // Get the step instance
    const stepInstance = await this.flowStepInstanceRepository.findOne({
      where: { id: stepInstanceId, flowInstanceId },
      relations: ['stepDefinition'],
    });

    if (!stepInstance) {
      throw new NotFoundException(`Step instance with ID ${stepInstanceId} not found`);
    }

    if (stepInstance.status === 'COMPLETED') {
      throw new BadRequestException('Step is already completed');
    }

    // Complete the step
    await this.completeStep(stepInstanceId, userId, data, comments);

    // Move to next step
    await this.moveToNextStep(flowInstanceId);

    return await this.getFlowInstance(tenantId, flowInstanceId);
  }

  /**
   * Complete a step
   */
  async completeStep(
    stepInstanceId: string,
    userId: string,
    data: Record<string, any>,
    comments?: string,
  ): Promise<FlowStepInstance> {
    const stepInstance = await this.flowStepInstanceRepository.findOne({
      where: { id: stepInstanceId },
      relations: ['stepDefinition'],
    });

    if (!stepInstance) {
      throw new NotFoundException(`Step instance with ID ${stepInstanceId} not found`);
    }

    if (stepInstance.status === 'COMPLETED') {
      throw new BadRequestException('Step is already completed');
    }

    // Update step instance
    stepInstance.status = 'COMPLETED';
    stepInstance.data = data;
    stepInstance.completedById = userId;
    stepInstance.completedAt = new Date();
    if (comments) {
      stepInstance.comments = comments;
    }

    return await this.flowStepInstanceRepository.save(stepInstance);
  }

  /**
   * Move to the next step in the flow
   */
  async moveToNextStep(flowInstanceId: string): Promise<void> {
    const flowInstance = await this.flowInstanceRepository.findOne({
      where: { id: flowInstanceId },
      relations: ['flowStepInstances'],
    });

    if (!flowInstance) {
      throw new NotFoundException(`Flow instance with ID ${flowInstanceId} not found`);
    }

    // Get all steps sorted by order
    const steps = flowInstance.flowStepInstances.sort(
      (a, b) => a.stepOrder - b.stepOrder,
    );

    // Find the next pending step
    const nextStep = steps.find(
      step => step.stepOrder > flowInstance.currentStepOrder && step.status === 'PENDING',
    );

    if (nextStep) {
      // Move to next step
      flowInstance.currentStepOrder = nextStep.stepOrder;
      nextStep.status = 'IN_PROGRESS';
      nextStep.startedAt = new Date();
      await this.flowStepInstanceRepository.save(nextStep);
      await this.flowInstanceRepository.save(flowInstance);
    } else {
      // No more steps, complete the flow
      await this.completeFlow(flowInstanceId);
    }
  }

  /**
   * Complete the entire flow
   */
  async completeFlow(flowInstanceId: string): Promise<FlowInstance> {
    const flowInstance = await this.flowInstanceRepository.findOne({
      where: { id: flowInstanceId },
    });

    if (!flowInstance) {
      throw new NotFoundException(`Flow instance with ID ${flowInstanceId} not found`);
    }

    if (flowInstance.status === 'COMPLETED') {
      throw new BadRequestException('Flow is already completed');
    }

    flowInstance.status = 'COMPLETED';
    flowInstance.completedAt = new Date();

    return await this.flowInstanceRepository.save(flowInstance);
  }

  /**
   * Cancel a flow
   */
  async cancelFlow(
    tenantId: string,
    flowInstanceId: string,
    userId: string,
  ): Promise<FlowInstance> {
    const flowInstance = await this.flowInstanceRepository.findOne({
      where: { id: flowInstanceId, tenantId },
    });

    if (!flowInstance) {
      throw new NotFoundException(`Flow instance with ID ${flowInstanceId} not found`);
    }

    if (flowInstance.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel a completed flow');
    }

    if (flowInstance.status === 'CANCELLED') {
      throw new BadRequestException('Flow is already cancelled');
    }

    flowInstance.status = 'CANCELLED';
    flowInstance.completedAt = new Date();

    return await this.flowInstanceRepository.save(flowInstance);
  }

  /**
   * Assign a step to a user
   */
  async assignStep(
    tenantId: string,
    stepInstanceId: string,
    assignedToId: string,
  ): Promise<FlowStepInstance> {
    const stepInstance = await this.flowStepInstanceRepository.findOne({
      where: { id: stepInstanceId },
      relations: ['flowInstance'],
    });

    if (!stepInstance) {
      throw new NotFoundException(`Step instance with ID ${stepInstanceId} not found`);
    }

    if (stepInstance.flowInstance.tenantId !== tenantId) {
      throw new NotFoundException(`Step instance with ID ${stepInstanceId} not found`);
    }

    if (stepInstance.status === 'COMPLETED') {
      throw new BadRequestException('Cannot assign a completed step');
    }

    stepInstance.assignedToId = assignedToId;
    return await this.flowStepInstanceRepository.save(stepInstance);
  }

  /**
   * Get step instance by ID
   */
  async getStepInstance(
    tenantId: string,
    stepInstanceId: string,
  ): Promise<FlowStepInstance> {
    const stepInstance = await this.flowStepInstanceRepository.findOne({
      where: { id: stepInstanceId },
      relations: [
        'flowInstance',
        'stepDefinition',
        'stepDefinition.formSchema',
        'assignedTo',
        'completedBy',
      ],
    });

    if (!stepInstance) {
      throw new NotFoundException(`Step instance with ID ${stepInstanceId} not found`);
    }

    if (stepInstance.flowInstance.tenantId !== tenantId) {
      throw new NotFoundException(`Step instance with ID ${stepInstanceId} not found`);
    }

    return stepInstance;
  }

  /**
   * Get all steps for a flow instance
   */
  async getFlowSteps(
    tenantId: string,
    flowInstanceId: string,
  ): Promise<FlowStepInstance[]> {
    const flowInstance = await this.flowInstanceRepository.findOne({
      where: { id: flowInstanceId, tenantId },
    });

    if (!flowInstance) {
      throw new NotFoundException(`Flow instance with ID ${flowInstanceId} not found`);
    }

    return await this.flowStepInstanceRepository.find({
      where: { flowInstanceId },
      relations: [
        'stepDefinition',
        'stepDefinition.formSchema',
        'assignedTo',
        'completedBy',
      ],
      order: { stepOrder: 'ASC' },
    });
  }
}
