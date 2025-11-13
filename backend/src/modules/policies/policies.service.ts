import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyDefinition } from './entities/policy-definition.entity';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { PolicyEngineService } from './policy-engine.service';
import { LeaveBalance } from '../leave/entities/leave-balance.entity';

@Injectable()
export class PoliciesService {
  constructor(
    @InjectRepository(PolicyDefinition)
    private readonly policyRepository: Repository<PolicyDefinition>,
    @InjectRepository(LeaveBalance)
    private readonly leaveBalanceRepository: Repository<LeaveBalance>,
    private readonly policyEngineService: PolicyEngineService,
  ) {}

  /**
   * Create a new policy
   * @param tenantId - Tenant ID
   * @param createPolicyDto - Policy creation data
   * @returns Created policy
   */
  async create(tenantId: string, createPolicyDto: CreatePolicyDto): Promise<PolicyDefinition> {
    // Check if code already exists for this tenant
    const existingPolicy = await this.policyRepository.findOne({
      where: { tenantId, code: createPolicyDto.code },
    });

    if (existingPolicy) {
      throw new ConflictException(`Policy with code '${createPolicyDto.code}' already exists`);
    }

    // Validate policy configuration
    this.validatePolicyConfig(createPolicyDto.policyType, createPolicyDto.configJson);

    const policy = this.policyRepository.create({
      ...createPolicyDto,
      tenantId,
      isActive: createPolicyDto.isActive !== undefined ? createPolicyDto.isActive : true,
    });

    return await this.policyRepository.save(policy);
  }

  /**
   * Find all policies for a tenant
   * @param tenantId - Tenant ID
   * @returns Array of policies
   */
  async findAll(tenantId: string): Promise<PolicyDefinition[]> {
    return await this.policyRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find a policy by ID
   * @param tenantId - Tenant ID
   * @param id - Policy ID
   * @returns Policy entity
   */
  async findOne(tenantId: string, id: string): Promise<PolicyDefinition> {
    const policy = await this.policyRepository.findOne({
      where: { tenantId, id },
    });

    if (!policy) {
      throw new NotFoundException(`Policy with ID '${id}' not found`);
    }

    return policy;
  }

  /**
   * Find policies by type
   * @param tenantId - Tenant ID
   * @param policyType - Policy type
   * @returns Array of policies
   */
  async findByType(tenantId: string, policyType: string): Promise<PolicyDefinition[]> {
    return await this.policyRepository.find({
      where: { tenantId, policyType },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update a policy
   * @param tenantId - Tenant ID
   * @param id - Policy ID
   * @param updatePolicyDto - Policy update data
   * @returns Updated policy
   */
  async update(tenantId: string, id: string, updatePolicyDto: UpdatePolicyDto): Promise<PolicyDefinition> {
    const policy = await this.findOne(tenantId, id);

    // Check if code is being changed and if it already exists
    if (updatePolicyDto.code && updatePolicyDto.code !== policy.code) {
      const existingPolicy = await this.policyRepository.findOne({
        where: { tenantId, code: updatePolicyDto.code },
      });

      if (existingPolicy) {
        throw new ConflictException(`Policy with code '${updatePolicyDto.code}' already exists`);
      }
    }

    // Validate policy configuration if provided
    if (updatePolicyDto.configJson) {
      this.validatePolicyConfig(
        updatePolicyDto.policyType || policy.policyType,
        updatePolicyDto.configJson,
      );
    }

    Object.assign(policy, updatePolicyDto);

    return await this.policyRepository.save(policy);
  }

  /**
   * Soft delete a policy (mark as inactive)
   * @param tenantId - Tenant ID
   * @param id - Policy ID
   * @returns Deleted policy
   */
  async remove(tenantId: string, id: string): Promise<PolicyDefinition> {
    const policy = await this.findOne(tenantId, id);

    policy.isActive = false;

    return await this.policyRepository.save(policy);
  }

  /**
   * Evaluate a policy against a given context
   * @param policyId - Policy ID
   * @param context - Context data to evaluate against
   * @returns Evaluation result
   */
  async evaluatePolicy(
    policyId: string,
    context: Record<string, any>,
  ): Promise<{
    passed: boolean;
    results: Array<{ rule: string; passed: boolean; message?: string }>;
    value?: any;
  }> {
    const policy = await this.policyRepository.findOne({
      where: { id: policyId },
    });

    if (!policy) {
      throw new NotFoundException(`Policy with ID '${policyId}' not found`);
    }

    if (!policy.isActive) {
      throw new BadRequestException('Policy is not active');
    }

    // Check if policy is within effective date range
    const now = new Date();
    if (policy.effectiveFrom && new Date(policy.effectiveFrom) > now) {
      throw new BadRequestException('Policy is not yet effective');
    }

    if (policy.effectiveTo && new Date(policy.effectiveTo) < now) {
      throw new BadRequestException('Policy has expired');
    }

    return this.policyEngineService.evaluateRules(policy.configJson, context);
  }

  /**
   * Calculate leave balance for an employee based on leave policy
   * @param employeeId - Employee ID
   * @param leaveTypeId - Leave type ID
   * @returns Leave balance calculation
   */
  async calculateLeaveBalance(
    employeeId: string,
    leaveTypeId: string,
  ): Promise<{
    entitlement: number;
    accrued: number;
    available: number;
    details: Record<string, any>;
  }> {
    // Find the leave policy for this leave type
    // This is a simplified implementation - in production, you'd link policies to leave types
    const leavePolicy = await this.policyRepository.findOne({
      where: {
        policyType: 'leave',
        isActive: true,
      },
    });

    if (!leavePolicy) {
      throw new NotFoundException('No active leave policy found');
    }

    // Get current year
    const currentYear = new Date().getFullYear();

    // Get existing leave balance
    const existingBalance = await this.leaveBalanceRepository.findOne({
      where: {
        employeeId,
        leaveTypeId,
        year: currentYear,
      },
      relations: ['employee'],
    });

    if (!existingBalance) {
      throw new NotFoundException('Leave balance not found for employee');
    }

    // Prepare context for calculation
    const context = {
      employmentStartDate: existingBalance.employee.joiningDate || new Date(),
      currentYear,
      existingBalance: Number(existingBalance.openingBalance) || 0,
      usedLeaves: Number(existingBalance.used) || 0,
      pendingLeaves: Number(existingBalance.pending) || 0,
    };

    // Calculate using policy engine
    return this.policyEngineService.calculateLeaveBalance(leavePolicy.configJson, context);
  }

  /**
   * Validate policy configuration based on policy type
   * @param policyType - Type of policy
   * @param configJson - Configuration JSON
   */
  private validatePolicyConfig(policyType: string, configJson: Record<string, any>): void {
    switch (policyType) {
      case 'leave':
        this.validateLeavePolicy(configJson);
        break;

      case 'approval':
        this.validateApprovalPolicy(configJson);
        break;

      case 'attendance':
        this.validateAttendancePolicy(configJson);
        break;

      case 'expense':
        this.validateExpensePolicy(configJson);
        break;

      default:
        // Generic validation
        if (!configJson.rules || !Array.isArray(configJson.rules)) {
          throw new BadRequestException('Policy configuration must contain rules array');
        }
    }
  }

  /**
   * Validate leave policy configuration
   */
  private validateLeavePolicy(configJson: Record<string, any>): void {
    const requiredFields = ['accrualType', 'accrualRate'];

    for (const field of requiredFields) {
      if (!configJson[field]) {
        throw new BadRequestException(`Leave policy must contain '${field}' field`);
      }
    }

    const validAccrualTypes = ['annual', 'monthly', 'prorated'];
    if (!validAccrualTypes.includes(configJson.accrualType)) {
      throw new BadRequestException(
        `Invalid accrual type. Must be one of: ${validAccrualTypes.join(', ')}`,
      );
    }

    if (typeof configJson.accrualRate !== 'number' || configJson.accrualRate < 0) {
      throw new BadRequestException('Accrual rate must be a positive number');
    }
  }

  /**
   * Validate approval policy configuration
   */
  private validateApprovalPolicy(configJson: Record<string, any>): void {
    if (!configJson.approvalLevels || !Array.isArray(configJson.approvalLevels)) {
      throw new BadRequestException('Approval policy must contain approvalLevels array');
    }

    if (configJson.approvalLevels.length === 0) {
      throw new BadRequestException('Approval policy must have at least one approval level');
    }

    for (const level of configJson.approvalLevels) {
      if (!level.level || !level.approverType) {
        throw new BadRequestException(
          'Each approval level must have level and approverType fields',
        );
      }
    }
  }

  /**
   * Validate attendance policy configuration
   */
  private validateAttendancePolicy(configJson: Record<string, any>): void {
    const requiredFields = ['workingHoursPerDay', 'workingDaysPerWeek'];

    for (const field of requiredFields) {
      if (!configJson[field]) {
        throw new BadRequestException(`Attendance policy must contain '${field}' field`);
      }
    }

    if (
      typeof configJson.workingHoursPerDay !== 'number' ||
      configJson.workingHoursPerDay <= 0 ||
      configJson.workingHoursPerDay > 24
    ) {
      throw new BadRequestException('Working hours per day must be between 0 and 24');
    }

    if (
      typeof configJson.workingDaysPerWeek !== 'number' ||
      configJson.workingDaysPerWeek <= 0 ||
      configJson.workingDaysPerWeek > 7
    ) {
      throw new BadRequestException('Working days per week must be between 0 and 7');
    }
  }

  /**
   * Validate expense policy configuration
   */
  private validateExpensePolicy(configJson: Record<string, any>): void {
    if (!configJson.expenseCategories || !Array.isArray(configJson.expenseCategories)) {
      throw new BadRequestException('Expense policy must contain expenseCategories array');
    }

    for (const category of configJson.expenseCategories) {
      if (!category.categoryCode || !category.maxLimit) {
        throw new BadRequestException(
          'Each expense category must have categoryCode and maxLimit fields',
        );
      }

      if (typeof category.maxLimit !== 'number' || category.maxLimit < 0) {
        throw new BadRequestException('Max limit must be a positive number');
      }
    }
  }
}
