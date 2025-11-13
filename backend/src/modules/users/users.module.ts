import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { RolePermission } from '../roles/entities/role-permission.entity';
import { UserRole } from '../roles/entities/user-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, RolePermission, UserRole])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
