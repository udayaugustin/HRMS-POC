import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { Employee } from './entities/employee.entity';
import { User } from '../users/entities/user.entity';
import { Department } from '../departments/entities/department.entity';
import { Designation } from '../designations/entities/designation.entity';
import { Location } from '../locations/entities/location.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      User,
      Department,
      Designation,
      Location,
    ]),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
