import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Login endpoint - validates credentials and returns JWT token
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  /**
   * POST /auth/register
   * Register endpoint - creates new user and returns JWT token
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  /**
   * GET /auth/profile
   * Get current user profile - protected route example
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: ExpressRequest) {
    return {
      userId: req.user!.userId,
      email: req.user!.email,
      tenantId: req.user!.tenantId,
      roles: req.user!.roles,
    };
  }
}
