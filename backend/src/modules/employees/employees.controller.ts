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
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeFiltersDto } from './dto/employee-filters.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@Controller('employees')
@UseGuards(PermissionsGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @RequirePermissions({ module: 'EMPLOYEES', action: 'CREATE' })
  async create(@Body() createEmployeeDto: CreateEmployeeDto, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.employeesService.create(tenantId, createEmployeeDto);
  }

  @Get()
  @RequirePermissions({ module: 'EMPLOYEES', action: 'READ' })
  async findAll(@Query() filters: EmployeeFiltersDto, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.employeesService.findAll(tenantId, filters);
  }

  @Get(':id')
  @RequirePermissions({ module: 'EMPLOYEES', action: 'READ' })
  async findOne(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.employeesService.findOne(tenantId, id);
  }

  @Get('user/:userId')
  @RequirePermissions({ module: 'EMPLOYEES', action: 'READ' })
  async findByUser(@Param('userId') userId: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.employeesService.findByUser(tenantId, userId);
  }

  @Get(':id/subordinates')
  @RequirePermissions({ module: 'EMPLOYEES', action: 'READ' })
  async getSubordinates(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.employeesService.getSubordinates(tenantId, id);
  }

  @Patch(':id')
  @RequirePermissions({ module: 'EMPLOYEES', action: 'UPDATE' })
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.employeesService.update(tenantId, id, updateEmployeeDto);
  }

  @Delete(':id')
  @RequirePermissions({ module: 'EMPLOYEES', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    await this.employeesService.deactivate(tenantId, id);
  }
}
