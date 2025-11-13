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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@Controller('users')
@UseGuards(PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions({ module: 'USERS', action: 'CREATE' })
  async create(@Body() createUserDto: CreateUserDto, @Request() req: ExpressRequest) {
    const user = await this.usersService.create(createUserDto);
    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Get()
  @RequirePermissions({ module: 'USERS', action: 'READ' })
  async findAll(@Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    const users = await this.usersService.findAll(tenantId);
    // Remove password hashes from response
    return users.map((user) => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  @Get(':id')
  @RequirePermissions({ module: 'USERS', action: 'READ' })
  async findOne(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    const user = await this.usersService.findOne(id, tenantId);
    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Get(':id/permissions')
  @RequirePermissions({ module: 'USERS', action: 'READ' })
  async getUserPermissions(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    return await this.usersService.getUserPermissions(id, tenantId);
  }

  @Patch(':id')
  @RequirePermissions({ module: 'USERS', action: 'UPDATE' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: ExpressRequest,
  ) {
    const tenantId = req.user!.tenantId;
    const user = await this.usersService.update(id, tenantId, updateUserDto);
    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Delete(':id')
  @RequirePermissions({ module: 'USERS', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    await this.usersService.remove(id, tenantId);
  }

  @Delete(':id/hard')
  @RequirePermissions({ module: 'USERS', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async hardDelete(@Param('id') id: string, @Request() req: ExpressRequest) {
    const tenantId = req.user!.tenantId;
    await this.usersService.hardDelete(id, tenantId);
  }
}
