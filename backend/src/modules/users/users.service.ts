import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
        tenantId: createUserDto.tenantId,
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email already exists for this tenant',
      );
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      ...createUserDto,
      passwordHash,
      isActive: createUserDto.isActive ?? true,
    });

    return await this.userRepository.save(user);
  }

  /**
   * Find all users for a tenant
   */
  async findAll(tenantId: string): Promise<User[]> {
    return await this.userRepository.find({
      where: { tenantId },
      relations: ['userRoles', 'userRoles.role'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find one user by ID
   */
  async findOne(id: string, tenantId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, tenantId },
      relations: ['userRoles', 'userRoles.role', 'userRoles.role.rolePermissions'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string, tenantId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email, tenantId },
      relations: ['userRoles', 'userRoles.role', 'userRoles.role.rolePermissions'],
    });
  }

  /**
   * Update user
   */
  async update(
    id: string,
    tenantId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findOne(id, tenantId);

    // Check if email is being updated and if it conflicts
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: {
          email: updateUserDto.email,
          tenantId,
        },
      });

      if (existingUser) {
        throw new ConflictException(
          'User with this email already exists for this tenant',
        );
      }
    }

    // Hash new password if provided
    if (updateUserDto.password) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(updateUserDto.password, saltRounds);
      Object.assign(user, { ...updateUserDto, passwordHash });
      delete updateUserDto.password;
    } else {
      Object.assign(user, updateUserDto);
    }

    return await this.userRepository.save(user);
  }

  /**
   * Soft delete user (deactivate)
   */
  async remove(id: string, tenantId: string): Promise<void> {
    const user = await this.findOne(id, tenantId);
    user.isActive = false;
    await this.userRepository.save(user);
  }

  /**
   * Hard delete user
   */
  async hardDelete(id: string, tenantId: string): Promise<void> {
    const user = await this.findOne(id, tenantId);
    await this.userRepository.remove(user);
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLoginAt: new Date() });
  }

  /**
   * Get user's permissions
   */
  async getUserPermissions(
    userId: string,
    tenantId: string,
  ): Promise<{ module: string; action: string }[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId, tenantId },
      relations: ['userRoles', 'userRoles.role', 'userRoles.role.rolePermissions'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const permissions: { module: string; action: string }[] = [];
    const permissionSet = new Set<string>();

    user.userRoles?.forEach((userRole) => {
      userRole.role?.rolePermissions?.forEach((permission) => {
        const key = `${permission.module}:${permission.action}`;
        if (!permissionSet.has(key)) {
          permissionSet.add(key);
          permissions.push({
            module: permission.module,
            action: permission.action,
          });
        }
      });
    });

    return permissions;
  }

  /**
   * Validate user password
   */
  async validatePassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.passwordHash);
  }
}
