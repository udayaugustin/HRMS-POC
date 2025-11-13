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
import { DesignationsService } from './designations.service';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@Controller('designations')
@UseGuards(PermissionsGuard)
export class DesignationsController {
  constructor(private readonly designationsService: DesignationsService) {}

  @Post()
  @RequirePermissions({ module: 'DESIGNATIONS', action: 'CREATE' })
  async create(@Body() createDesignationDto: CreateDesignationDto, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.designationsService.create(tenantId, createDesignationDto);
  }

  @Get()
  @RequirePermissions({ module: 'DESIGNATIONS', action: 'READ' })
  async findAll(@Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.designationsService.findAll(tenantId);
  }

  @Get(':id')
  @RequirePermissions({ module: 'DESIGNATIONS', action: 'READ' })
  async findOne(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.designationsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @RequirePermissions({ module: 'DESIGNATIONS', action: 'UPDATE' })
  async update(
    @Param('id') id: string,
    @Body() updateDesignationDto: UpdateDesignationDto,
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.designationsService.update(tenantId, id, updateDesignationDto);
  }

  @Delete(':id')
  @RequirePermissions({ module: 'DESIGNATIONS', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    await this.designationsService.remove(tenantId, id);
  }
}
