import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { DesignationsModule } from './modules/designations/designations.module';
import { LocationsModule } from './modules/locations/locations.module';
import { FlowsModule } from './modules/flows/flows.module';
import { FormSchemasModule } from './modules/form-schemas/form-schemas.module';
import { PoliciesModule } from './modules/policies/policies.module';
import { LeaveModule } from './modules/leave/leave.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Feature Modules
    AuthModule,
    TenantsModule,
    UsersModule,
    RolesModule,
    EmployeesModule,
    DepartmentsModule,
    DesignationsModule,
    LocationsModule,
    FlowsModule,
    FormSchemasModule,
    PoliciesModule,
    LeaveModule,
    ApprovalsModule,
    NotificationsModule,
    DashboardModule,
  ],
})
export class AppModule {}
