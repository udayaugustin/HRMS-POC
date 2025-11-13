import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlowVersion } from './entities/flow-version.entity';
import { FlowDefinition } from './entities/flow-definition.entity';
import { CreateFlowVersionDto } from './dto/create-flow-version.dto';

@Injectable()
export class FlowVersionsService {
  constructor(
    @InjectRepository(FlowVersion)
    private flowVersionRepository: Repository<FlowVersion>,
    @InjectRepository(FlowDefinition)
    private flowDefinitionRepository: Repository<FlowDefinition>,
  ) {}

  /**
   * Create a new flow version
   */
  async create(
    tenantId: string,
    userId: string,
    createFlowVersionDto: CreateFlowVersionDto,
  ): Promise<FlowVersion> {
    // Verify flow definition exists and belongs to tenant
    const flowDefinition = await this.flowDefinitionRepository.findOne({
      where: {
        id: createFlowVersionDto.flowDefinitionId,
        tenantId,
      },
    });

    if (!flowDefinition) {
      throw new NotFoundException('Flow definition not found');
    }

    // Get the next version number
    const latestVersion = await this.flowVersionRepository.findOne({
      where: { flowDefinitionId: createFlowVersionDto.flowDefinitionId },
      order: { versionNumber: 'DESC' },
    });

    const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    const flowVersion = this.flowVersionRepository.create({
      flowDefinitionId: createFlowVersionDto.flowDefinitionId,
      versionNumber: nextVersionNumber,
      status: 'DRAFT',
      createdById: userId,
    });

    return await this.flowVersionRepository.save(flowVersion);
  }

  /**
   * Find all versions for a flow definition
   */
  async findAll(flowDefinitionId: string, tenantId: string): Promise<FlowVersion[]> {
    // Verify flow definition exists and belongs to tenant
    const flowDefinition = await this.flowDefinitionRepository.findOne({
      where: { id: flowDefinitionId, tenantId },
    });

    if (!flowDefinition) {
      throw new NotFoundException('Flow definition not found');
    }

    return await this.flowVersionRepository.find({
      where: { flowDefinitionId },
      relations: ['flowStepDefinitions', 'createdBy'],
      order: { versionNumber: 'DESC' },
    });
  }

  /**
   * Find one version by ID
   */
  async findOne(id: string, tenantId: string): Promise<FlowVersion> {
    const flowVersion = await this.flowVersionRepository.findOne({
      where: { id },
      relations: [
        'flowDefinition',
        'flowStepDefinitions',
        'flowStepDefinitions.formSchema',
        'createdBy',
      ],
    });

    if (!flowVersion) {
      throw new NotFoundException(`Flow version with ID ${id} not found`);
    }

    // Verify it belongs to the tenant
    if (flowVersion.flowDefinition.tenantId !== tenantId) {
      throw new NotFoundException(`Flow version with ID ${id} not found`);
    }

    return flowVersion;
  }

  /**
   * Publish a version (make it active)
   */
  async publish(
    id: string,
    tenantId: string,
    archiveOldVersion: boolean = true,
  ): Promise<FlowVersion> {
    const flowVersion = await this.findOne(id, tenantId);

    if (flowVersion.status === 'PUBLISHED') {
      throw new BadRequestException('This version is already published');
    }

    if (flowVersion.status === 'ARCHIVED') {
      throw new BadRequestException('Cannot publish an archived version');
    }

    // Check if there are any steps defined
    if (!flowVersion.flowStepDefinitions || flowVersion.flowStepDefinitions.length === 0) {
      throw new BadRequestException(
        'Cannot publish a version without any steps defined',
      );
    }

    // Archive the currently published version if requested
    if (archiveOldVersion) {
      const currentPublished = await this.flowVersionRepository.findOne({
        where: {
          flowDefinitionId: flowVersion.flowDefinitionId,
          status: 'PUBLISHED',
        },
      });

      if (currentPublished) {
        currentPublished.status = 'ARCHIVED';
        await this.flowVersionRepository.save(currentPublished);
      }
    }

    flowVersion.status = 'PUBLISHED';
    flowVersion.publishedAt = new Date();
    return await this.flowVersionRepository.save(flowVersion);
  }

  /**
   * Archive a version
   */
  async archive(id: string, tenantId: string): Promise<FlowVersion> {
    const flowVersion = await this.findOne(id, tenantId);

    if (flowVersion.status === 'ARCHIVED') {
      throw new BadRequestException('This version is already archived');
    }

    // Check if this is the only published version
    if (flowVersion.status === 'PUBLISHED') {
      const publishedVersions = await this.flowVersionRepository.find({
        where: {
          flowDefinitionId: flowVersion.flowDefinitionId,
          status: 'PUBLISHED',
        },
      });

      if (publishedVersions.length === 1) {
        throw new BadRequestException(
          'Cannot archive the only published version. Please publish another version first.',
        );
      }
    }

    flowVersion.status = 'ARCHIVED';
    return await this.flowVersionRepository.save(flowVersion);
  }

  /**
   * Get the active (published) version for a flow definition
   */
  async getActiveVersion(
    flowDefinitionId: string,
    tenantId: string,
  ): Promise<FlowVersion> {
    // Verify flow definition exists and belongs to tenant
    const flowDefinition = await this.flowDefinitionRepository.findOne({
      where: { id: flowDefinitionId, tenantId },
    });

    if (!flowDefinition) {
      throw new NotFoundException('Flow definition not found');
    }

    const activeVersion = await this.flowVersionRepository.findOne({
      where: {
        flowDefinitionId,
        status: 'PUBLISHED',
      },
      relations: ['flowStepDefinitions', 'flowStepDefinitions.formSchema'],
      order: { versionNumber: 'DESC' },
    });

    if (!activeVersion) {
      throw new NotFoundException(
        'No published version found for this flow definition',
      );
    }

    return activeVersion;
  }

  /**
   * Get the active version by flow type
   */
  async getActiveVersionByType(
    flowType: string,
    tenantId: string,
  ): Promise<FlowVersion> {
    const flowDefinition = await this.flowDefinitionRepository.findOne({
      where: { flowType, tenantId, isActive: true },
    });

    if (!flowDefinition) {
      throw new NotFoundException(
        `No active flow definition found for type '${flowType}'`,
      );
    }

    return await this.getActiveVersion(flowDefinition.id, tenantId);
  }

  /**
   * Delete a version (only if it's a draft)
   */
  async remove(id: string, tenantId: string): Promise<void> {
    const flowVersion = await this.findOne(id, tenantId);

    if (flowVersion.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only draft versions can be deleted. Archive published versions instead.',
      );
    }

    await this.flowVersionRepository.remove(flowVersion);
  }
}
