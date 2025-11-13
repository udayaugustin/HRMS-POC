import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import { Role } from '../roles/entities/role.entity';

@Module({
  imports: [
    // Passport for authentication strategies
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT module configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRY') || '24h',
        },
      }),
      inject: [ConfigService],
    }),

    // TypeORM entities
    TypeOrmModule.forFeature([User, UserRole, Role]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
