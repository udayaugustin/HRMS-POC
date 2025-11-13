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
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@Controller('locations')
@UseGuards(PermissionsGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @RequirePermissions({ module: 'LOCATIONS', action: 'CREATE' })
  async create(@Body() createLocationDto: CreateLocationDto, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.locationsService.create(tenantId, createLocationDto);
  }

  @Get()
  @RequirePermissions({ module: 'LOCATIONS', action: 'READ' })
  async findAll(@Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.locationsService.findAll(tenantId);
  }

  @Get(':id')
  @RequirePermissions({ module: 'LOCATIONS', action: 'READ' })
  async findOne(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.locationsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @RequirePermissions({ module: 'LOCATIONS', action: 'UPDATE' })
  async update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    return await this.locationsService.update(tenantId, id, updateLocationDto);
  }

  @Delete(':id')
  @RequirePermissions({ module: 'LOCATIONS', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    await this.locationsService.remove(tenantId, id);
  }
}
