import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlowDefinition } from './entities/flow-definition.entity';
import { CreateFlowDefinitionDto } from './dto/create-flow-definition.dto';
import { UpdateFlowDefinitionDto } from './dto/update-flow-definition.dto';

@Injectable()
export class FlowDefinitionsService {
  constructor(
    @InjectRepository(FlowDefinition)
    private flowDefinitionRepository: Repository<FlowDefinition>,
  ) {}

  /**
   * Create a new flow definition
   */
  async create(
    tenantId: string,
    createFlowDefinitionDto: CreateFlowDefinitionDto,
  ): Promise<FlowDefinition> {
    // Check if flow definition with this type already exists for tenant
    const existing = await this.flowDefinitionRepository.findOne({
      where: {
        tenantId,
        flowType: createFlowDefinitionDto.flowType,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Flow definition with type '${createFlowDefinitionDto.flowType}' already exists for this tenant`,
      );
    }

    const flowDefinition = this.flowDefinitionRepository.create({
      ...createFlowDefinitionDto,
      tenantId,
      isActive: createFlowDefinitionDto.isActive ?? true,
    });

    return await this.flowDefinitionRepository.save(flowDefinition);
  }

  /**
   * Find all flow definitions for a tenant
   */
  async findAll(tenantId: string): Promise<FlowDefinition[]> {
    return await this.flowDefinitionRepository.find({
      where: { tenantId },
      relations: ['flowVersions'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find one flow definition by ID
   */
  async findOne(id: string, tenantId: string): Promise<FlowDefinition> {
    const flowDefinition = await this.flowDefinitionRepository.findOne({
      where: { id, tenantId },
      relations: ['flowVersions'],
    });

    if (!flowDefinition) {
      throw new NotFoundException(`Flow definition with ID ${id} not found`);
    }

    return flowDefinition;
  }

  /**
   * Find flow definition by type
   */
  async findByType(
    flowType: string,
    tenantId: string,
  ): Promise<FlowDefinition> {
    const flowDefinition = await this.flowDefinitionRepository.findOne({
      where: { flowType, tenantId },
      relations: ['flowVersions'],
    });

    if (!flowDefinition) {
      throw new NotFoundException(
        `Flow definition with type '${flowType}' not found`,
      );
    }

    return flowDefinition;
  }

  /**
   * Update a flow definition
   */
  async update(
    id: string,
    tenantId: string,
    updateFlowDefinitionDto: UpdateFlowDefinitionDto,
  ): Promise<FlowDefinition> {
    const flowDefinition = await this.findOne(id, tenantId);

    // Check if flow type is being updated and if it conflicts
    if (
      updateFlowDefinitionDto.flowType &&
      updateFlowDefinitionDto.flowType !== flowDefinition.flowType
    ) {
      const existing = await this.flowDefinitionRepository.findOne({
        where: {
          tenantId,
          flowType: updateFlowDefinitionDto.flowType,
        },
      });

      if (existing) {
        throw new ConflictException(
          `Flow definition with type '${updateFlowDefinitionDto.flowType}' already exists`,
        );
      }
    }

    Object.assign(flowDefinition, updateFlowDefinitionDto);
    return await this.flowDefinitionRepository.save(flowDefinition);
  }

  /**
   * Delete a flow definition
   */
  async remove(id: string, tenantId: string): Promise<void> {
    const flowDefinition = await this.findOne(id, tenantId);
    await this.flowDefinitionRepository.remove(flowDefinition);
  }

  /**
   * Deactivate a flow definition
   */
  async deactivate(id: string, tenantId: string): Promise<FlowDefinition> {
    const flowDefinition = await this.findOne(id, tenantId);
    flowDefinition.isActive = false;
    return await this.flowDefinitionRepository.save(flowDefinition);
  }

  /**
   * Activate a flow definition
   */
  async activate(id: string, tenantId: string): Promise<FlowDefinition> {
    const flowDefinition = await this.findOne(id, tenantId);
    flowDefinition.isActive = true;
    return await this.flowDefinitionRepository.save(flowDefinition);
  }
}
