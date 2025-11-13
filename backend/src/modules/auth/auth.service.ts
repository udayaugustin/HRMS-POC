import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import { Role } from '../roles/entities/role.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compare plain password with hashed password
   */
  async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await this.comparePasswords(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Get user roles (role codes)
   */
  private async getUserRoles(userId: string): Promise<string[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: ['role'],
    });

    return userRoles
      .filter((ur) => ur.role && ur.role.isActive)
      .map((ur) => ur.role.code);
  }

  /**
   * Generate JWT token for user
   */
  async generateToken(user: User): Promise<string> {
    const roles = await this.getUserRoles(user.id);

    const payload: JwtPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      roles,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.generateToken(user);
    const roles = await this.getUserRoles(user.id);

    // Update last login timestamp
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId,
        roles,
      },
    };
  }

  /**
   * Register new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: {
        email: registerDto.email,
        tenantId: registerDto.tenantId,
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email already exists in this tenant',
      );
    }

    // Hash password
    const passwordHash = await this.hashPassword(registerDto.password);

    // Create new user
    const newUser = this.userRepository.create({
      email: registerDto.email,
      passwordHash,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      tenantId: registerDto.tenantId,
      isActive: true,
    });

    try {
      const savedUser = await this.userRepository.save(newUser);

      // Generate token
      const accessToken = await this.generateToken(savedUser);
      const roles = await this.getUserRoles(savedUser.id);

      return {
        accessToken,
        user: {
          id: savedUser.id,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          tenantId: savedUser.tenantId,
          roles,
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to create user');
    }
  }
}
