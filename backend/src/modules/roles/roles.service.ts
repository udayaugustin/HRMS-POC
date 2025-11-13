import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserRole } from './entities/user-role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  /**
   * Create a new role
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Check if role code already exists for tenant
    const existingRole = await this.roleRepository.findOne({
      where: {
        code: createRoleDto.code,
        tenantId: createRoleDto.tenantId,
      },
    });

    if (existingRole) {
      throw new ConflictException(
        'Role with this code already exists for this tenant',
      );
    }

    // Create role
    const role = this.roleRepository.create({
      name: createRoleDto.name,
      code: createRoleDto.code,
      description: createRoleDto.description,
      tenantId: createRoleDto.tenantId,
      isSystem: createRoleDto.isSystem ?? false,
      isActive: createRoleDto.isActive ?? true,
    });

    const savedRole = await this.roleRepository.save(role);

    // Add permissions if provided
    if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
      await this.addPermissionsToRole(
        savedRole.id,
        createRoleDto.permissions,
      );
    }

    return await this.findOne(savedRole.id, savedRole.tenantId);
  }

  /**
   * Find all roles for a tenant
   */
  async findAll(tenantId: string): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { tenantId },
      relations: ['rolePermissions'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find one role by ID
   */
  async findOne(id: string, tenantId: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id, tenantId },
      relations: ['rolePermissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  /**
   * Update role
   */
  async update(
    id: string,
    tenantId: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    const role = await this.findOne(id, tenantId);

    // Prevent updating system roles
    if (role.isSystem) {
      throw new BadRequestException('System roles cannot be modified');
    }

    // Check if code is being updated and if it conflicts
    if (updateRoleDto.code && updateRoleDto.code !== role.code) {
      const existingRole = await this.roleRepository.findOne({
        where: {
          code: updateRoleDto.code,
          tenantId,
        },
      });

      if (existingRole) {
        throw new ConflictException(
          'Role with this code already exists for this tenant',
        );
      }
    }

    // Update role basic info
    Object.assign(role, {
      name: updateRoleDto.name ?? role.name,
      code: updateRoleDto.code ?? role.code,
      description: updateRoleDto.description ?? role.description,
      isActive: updateRoleDto.isActive ?? role.isActive,
    });

    await this.roleRepository.save(role);

    // Update permissions if provided
    if (updateRoleDto.permissions) {
      // Remove existing permissions
      await this.rolePermissionRepository.delete({ roleId: id });

      // Add new permissions
      if (updateRoleDto.permissions.length > 0) {
        await this.addPermissionsToRole(id, updateRoleDto.permissions);
      }
    }

    return await this.findOne(id, tenantId);
  }

  /**
   * Delete role
   */
  async remove(id: string, tenantId: string): Promise<void> {
    const role = await this.findOne(id, tenantId);

    // Prevent deleting system roles
    if (role.isSystem) {
      throw new BadRequestException('System roles cannot be deleted');
    }

    // Check if role is assigned to any users
    const userRolesCount = await this.userRoleRepository.count({
      where: { roleId: id },
    });

    if (userRolesCount > 0) {
      throw new BadRequestException(
        `Cannot delete role. It is assigned to ${userRolesCount} user(s)`,
      );
    }

    await this.roleRepository.remove(role);
  }

  /**
   * Assign roles to a user
   */
  async assignRolesToUser(
    assignRoleDto: AssignRoleDto,
    tenantId: string,
  ): Promise<void> {
    const { userId, roleIds } = assignRoleDto;

    // Verify all roles exist and belong to tenant
    const roles = await this.roleRepository.find({
      where: {
        id: In(roleIds),
        tenantId,
      },
    });

    if (roles.length !== roleIds.length) {
      throw new NotFoundException('One or more roles not found');
    }

    // Remove existing role assignments
    await this.userRoleRepository.delete({ userId });

    // Create new role assignments
    const userRoles = roleIds.map((roleId) =>
      this.userRoleRepository.create({ userId, roleId }),
    );

    await this.userRoleRepository.save(userRoles);
  }

  /**
   * Get user's roles
   */
  async getUserRoles(userId: string, tenantId: string): Promise<Role[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: ['role', 'role.rolePermissions'],
    });

    return userRoles
      .filter((ur) => ur.role && ur.role.tenantId === tenantId)
      .map((ur) => ur.role);
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(
    userId: string,
    roleId: string,
    tenantId: string,
  ): Promise<void> {
    // Verify role belongs to tenant
    await this.findOne(roleId, tenantId);

    const userRole = await this.userRoleRepository.findOne({
      where: { userId, roleId },
    });

    if (!userRole) {
      throw new NotFoundException('User role assignment not found');
    }

    await this.userRoleRepository.remove(userRole);
  }

  /**
   * Check if user has permission
   */
  async checkPermission(
    userId: string,
    module: string,
    action: string,
  ): Promise<boolean> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
    });

    if (!userRoles || userRoles.length === 0) {
      return false;
    }

    const roleIds = userRoles.map((ur) => ur.roleId);

    const permission = await this.rolePermissionRepository.findOne({
      where: {
        roleId: In(roleIds),
        module,
        action,
      },
    });

    return !!permission;
  }

  /**
   * Add permissions to role
   */
  async addPermissionsToRole(
    roleId: string,
    permissions: { module: string; action: string }[],
  ): Promise<void> {
    const rolePermissions = permissions.map((perm) =>
      this.rolePermissionRepository.create({
        roleId,
        module: perm.module,
        action: perm.action,
      }),
    );

    await this.rolePermissionRepository.save(rolePermissions);
  }

  /**
   * Get role permissions
   */
  async getRolePermissions(
    roleId: string,
    tenantId: string,
  ): Promise<RolePermission[]> {
    const role = await this.findOne(roleId, tenantId);
    return role.rolePermissions || [];
  }

  /**
   * Add permission to role
   */
  async addPermission(
    roleId: string,
    tenantId: string,
    module: string,
    action: string,
  ): Promise<void> {
    const role = await this.findOne(roleId, tenantId);

    if (role.isSystem) {
      throw new BadRequestException(
        'Cannot modify permissions of system roles',
      );
    }

    // Check if permission already exists
    const existingPermission = await this.rolePermissionRepository.findOne({
      where: { roleId, module, action },
    });

    if (existingPermission) {
      throw new ConflictException('Permission already exists for this role');
    }

    const permission = this.rolePermissionRepository.create({
      roleId,
      module,
      action,
    });

    await this.rolePermissionRepository.save(permission);
  }

  /**
   * Remove permission from role
   */
  async removePermission(
    roleId: string,
    tenantId: string,
    module: string,
    action: string,
  ): Promise<void> {
    const role = await this.findOne(roleId, tenantId);

    if (role.isSystem) {
      throw new BadRequestException(
        'Cannot modify permissions of system roles',
      );
    }

    const permission = await this.rolePermissionRepository.findOne({
      where: { roleId, module, action },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found for this role');
    }

    await this.rolePermissionRepository.remove(permission);
  }
}
