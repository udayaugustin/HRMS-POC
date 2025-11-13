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
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@Controller('departments')
@UseGuards(PermissionsGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @RequirePermissions({ module: 'DEPARTMENTS', action: 'CREATE' })
  async create(@Body() createDepartmentDto: CreateDepartmentDto, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.departmentsService.create(tenantId, createDepartmentDto);
  }

  @Get()
  @RequirePermissions({ module: 'DEPARTMENTS', action: 'READ' })
  async findAll(@Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.departmentsService.findAll(tenantId);
  }

  @Get(':id')
  @RequirePermissions({ module: 'DEPARTMENTS', action: 'READ' })
  async findOne(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.departmentsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @RequirePermissions({ module: 'DEPARTMENTS', action: 'UPDATE' })
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.departmentsService.update(tenantId, id, updateDepartmentDto);
  }

  @Delete(':id')
  @RequirePermissions({ module: 'DEPARTMENTS', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    await this.departmentsService.remove(tenantId, id);
  }
}
