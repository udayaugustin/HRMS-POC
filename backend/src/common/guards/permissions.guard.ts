import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PERMISSIONS_KEY,
  PermissionRequirement,
} from '../decorators/permissions.decorator';
import { RolePermission } from '../../modules/roles/entities/role-permission.entity';
import { UserRole } from '../../modules/roles/entities/user-role.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permissions from decorator metadata
    const requiredPermission = this.reflector.getAllAndOverride<PermissionRequirement>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions are required, allow access
    if (!requiredPermission) {
      return true;
    }

    // Get user from request (should be set by JWT auth guard)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Get user's roles
    const userRoles = await this.userRoleRepository.find({
      where: { userId: user.userId },
      relations: ['role'],
    });

    if (!userRoles || userRoles.length === 0) {
      throw new ForbiddenException('User has no roles assigned');
    }

    // Get role IDs
    const roleIds = userRoles.map((ur) => ur.roleId);

    // Check if any of the user's roles have the required permission
    const hasPermission = await this.rolePermissionRepository
      .createQueryBuilder('rp')
      .where('rp.roleId IN (:...roleIds)', { roleIds })
      .andWhere('rp.module = :module', { module: requiredPermission.module })
      .andWhere('rp.action = :action', { action: requiredPermission.action })
      .getOne();

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied. Required permission: ${requiredPermission.module}:${requiredPermission.action}`,
      );
    }

    return true;
  }
}
