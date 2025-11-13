import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@Controller('roles')
@UseGuards(PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @RequirePermissions({ module: 'ROLES', action: 'CREATE' })
  async create(@Body() createRoleDto: CreateRoleDto, @Request() req: ExpressRequest) {
    return await this.rolesService.create(createRoleDto);
  }

  @Get()
  @RequirePermissions({ module: 'ROLES', action: 'READ' })
  async findAll(@Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.rolesService.findAll(tenantId);
  }

  @Get(':id')
  @RequirePermissions({ module: 'ROLES', action: 'READ' })
  async findOne(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.rolesService.findOne(id, tenantId);
  }

  @Get(':id/permissions')
  @RequirePermissions({ module: 'ROLES', action: 'READ' })
  async getRolePermissions(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.rolesService.getRolePermissions(id, tenantId);
  }

  @Patch(':id')
  @RequirePermissions({ module: 'ROLES', action: 'UPDATE' })
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.rolesService.update(id, tenantId, updateRoleDto);
  }

  @Delete(':id')
  @RequirePermissions({ module: 'ROLES', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    await this.rolesService.remove(id, tenantId);
  }

  // User-Role Assignment Endpoints
  @Post('assign')
  @RequirePermissions({ module: 'ROLES', action: 'ASSIGN' })
  @HttpCode(HttpStatus.OK)
  async assignRolesToUser(
    @Body() assignRoleDto: AssignRoleDto,
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    await this.rolesService.assignRolesToUser(assignRoleDto, tenantId);
    return { message: 'Roles assigned successfully' };
  }

  @Get('user/:userId')
  @RequirePermissions({ module: 'ROLES', action: 'READ' })
  async getUserRoles(@Param('userId') userId: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.rolesService.getUserRoles(userId, tenantId);
  }

  @Delete('user/:userId/role/:roleId')
  @RequirePermissions({ module: 'ROLES', action: 'ASSIGN' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeRoleFromUser(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    await this.rolesService.removeRoleFromUser(userId, roleId, tenantId);
  }

  // Permission Management Endpoints
  @Post(':id/permissions')
  @RequirePermissions({ module: 'ROLES', action: 'UPDATE' })
  @HttpCode(HttpStatus.OK)
  async addPermission(
    @Param('id') id: string,
    @Body() body: { module: string; action: string },
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    await this.rolesService.addPermission(
      id,
      tenantId,
      body.module,
      body.action,
    );
    return { message: 'Permission added successfully' };
  }

  @Delete(':id/permissions')
  @RequirePermissions({ module: 'ROLES', action: 'UPDATE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removePermission(
    @Param('id') id: string,
    @Query('module') module: string,
    @Query('action') action: string,
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    await this.rolesService.removePermission(id, tenantId, module, action);
  }

  // Permission Check Endpoint
  @Get('check-permission/:userId')
  @RequirePermissions({ module: 'ROLES', action: 'READ' })
  async checkPermission(
    @Param('userId') userId: string,
    @Query('module') module: string,
    @Query('action') action: string,
  ) {
    const hasPermission = await this.rolesService.checkPermission(
      userId,
      module,
      action,
    );
    return { hasPermission };
  }
}
