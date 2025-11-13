import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlowStepDefinition } from './entities/flow-step-definition.entity';
import { FlowVersion } from './entities/flow-version.entity';
import { CreateFlowStepDto } from './dto/create-flow-step.dto';
import { UpdateFlowStepDto } from './dto/update-flow-step.dto';

@Injectable()
export class FlowStepsService {
  constructor(
    @InjectRepository(FlowStepDefinition)
    private flowStepRepository: Repository<FlowStepDefinition>,
    @InjectRepository(FlowVersion)
    private flowVersionRepository: Repository<FlowVersion>,
  ) {}

  /**
   * Create a new step in a flow version
   */
  async createStep(
    tenantId: string,
    createFlowStepDto: CreateFlowStepDto,
  ): Promise<FlowStepDefinition> {
    // Verify flow version exists and belongs to tenant
    const flowVersion = await this.flowVersionRepository.findOne({
      where: { id: createFlowStepDto.flowVersionId },
      relations: ['flowDefinition'],
    });

    if (!flowVersion) {
      throw new NotFoundException('Flow version not found');
    }

    if (flowVersion.flowDefinition.tenantId !== tenantId) {
      throw new NotFoundException('Flow version not found');
    }

    // Only allow adding steps to draft versions
    if (flowVersion.status !== 'DRAFT') {
      throw new BadRequestException(
        'Steps can only be added to draft versions',
      );
    }

    // Check if step order already exists
    const existingStep = await this.flowStepRepository.findOne({
      where: {
        flowVersionId: createFlowStepDto.flowVersionId,
        stepOrder: createFlowStepDto.stepOrder,
      },
    });

    if (existingStep) {
      throw new ConflictException(
        `Step with order ${createFlowStepDto.stepOrder} already exists`,
      );
    }

    const flowStep = this.flowStepRepository.create({
      ...createFlowStepDto,
      isMandatory: createFlowStepDto.isMandatory ?? true,
      config: createFlowStepDto.config ?? {},
    });

    return await this.flowStepRepository.save(flowStep);
  }

  /**
   * Get all steps for a flow version
   */
  async getStepsForVersion(
    flowVersionId: string,
    tenantId: string,
  ): Promise<FlowStepDefinition[]> {
    // Verify flow version exists and belongs to tenant
    const flowVersion = await this.flowVersionRepository.findOne({
      where: { id: flowVersionId },
      relations: ['flowDefinition'],
    });

    if (!flowVersion) {
      throw new NotFoundException('Flow version not found');
    }

    if (flowVersion.flowDefinition.tenantId !== tenantId) {
      throw new NotFoundException('Flow version not found');
    }

    return await this.flowStepRepository.find({
      where: { flowVersionId },
      relations: ['formSchema'],
      order: { stepOrder: 'ASC' },
    });
  }

  /**
   * Get a single step by ID
   */
  async findOne(id: string, tenantId: string): Promise<FlowStepDefinition> {
    const step = await this.flowStepRepository.findOne({
      where: { id },
      relations: ['flowVersion', 'flowVersion.flowDefinition', 'formSchema'],
    });

    if (!step) {
      throw new NotFoundException(`Step with ID ${id} not found`);
    }

    if (step.flowVersion.flowDefinition.tenantId !== tenantId) {
      throw new NotFoundException(`Step with ID ${id} not found`);
    }

    return step;
  }

  /**
   * Update a step
   */
  async updateStep(
    id: string,
    tenantId: string,
    updateFlowStepDto: UpdateFlowStepDto,
  ): Promise<FlowStepDefinition> {
    const step = await this.findOne(id, tenantId);

    // Only allow updating steps in draft versions
    if (step.flowVersion.status !== 'DRAFT') {
      throw new BadRequestException(
        'Steps can only be updated in draft versions',
      );
    }

    // If updating step order, check for conflicts
    if (updateFlowStepDto.stepOrder && updateFlowStepDto.stepOrder !== step.stepOrder) {
      const existingStep = await this.flowStepRepository.findOne({
        where: {
          flowVersionId: step.flowVersionId,
          stepOrder: updateFlowStepDto.stepOrder,
        },
      });

      if (existingStep && existingStep.id !== step.id) {
        throw new ConflictException(
          `Step with order ${updateFlowStepDto.stepOrder} already exists`,
        );
      }
    }

    Object.assign(step, updateFlowStepDto);
    return await this.flowStepRepository.save(step);
  }

  /**
   * Delete a step
   */
  async deleteStep(id: string, tenantId: string): Promise<void> {
    const step = await this.findOne(id, tenantId);

    // Only allow deleting steps in draft versions
    if (step.flowVersion.status !== 'DRAFT') {
      throw new BadRequestException(
        'Steps can only be deleted in draft versions',
      );
    }

    await this.flowStepRepository.remove(step);
  }

  /**
   * Reorder steps in a flow version
   */
  async reorderSteps(
    flowVersionId: string,
    tenantId: string,
    steps: Array<{ stepId: string; order: number }>,
  ): Promise<FlowStepDefinition[]> {
    // Verify flow version exists and belongs to tenant
    const flowVersion = await this.flowVersionRepository.findOne({
      where: { id: flowVersionId },
      relations: ['flowDefinition'],
    });

    if (!flowVersion) {
      throw new NotFoundException('Flow version not found');
    }

    if (flowVersion.flowDefinition.tenantId !== tenantId) {
      throw new NotFoundException('Flow version not found');
    }

    // Only allow reordering steps in draft versions
    if (flowVersion.status !== 'DRAFT') {
      throw new BadRequestException(
        'Steps can only be reordered in draft versions',
      );
    }

    // Get all steps for this version
    const allSteps = await this.flowStepRepository.find({
      where: { flowVersionId },
    });

    // Verify all step IDs exist
    const stepIds = allSteps.map(s => s.id);
    for (const step of steps) {
      if (!stepIds.includes(step.stepId)) {
        throw new NotFoundException(`Step with ID ${step.stepId} not found`);
      }
    }

    // Verify no duplicate orders
    const orders = steps.map(s => s.order);
    if (new Set(orders).size !== orders.length) {
      throw new BadRequestException('Duplicate step orders are not allowed');
    }

    // Update step orders
    const updatedSteps: FlowStepDefinition[] = [];
    for (const step of steps) {
      const stepToUpdate = allSteps.find(s => s.id === step.stepId);
      if (stepToUpdate) {
        stepToUpdate.stepOrder = step.order;
        const updated = await this.flowStepRepository.save(stepToUpdate);
        updatedSteps.push(updated);
      }
    }

    return updatedSteps.sort((a, b) => a.stepOrder - b.stepOrder);
  }

  /**
   * Get the next step order number for a flow version
   */
  async getNextStepOrder(flowVersionId: string, tenantId: string): Promise<number> {
    const steps = await this.getStepsForVersion(flowVersionId, tenantId);

    if (steps.length === 0) {
      return 1;
    }

    const maxOrder = Math.max(...steps.map(s => s.stepOrder));
    return maxOrder + 1;
  }
}
