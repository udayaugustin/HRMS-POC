import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Define custom user type for tenant middleware
export interface TenantUser {
  userId: string;
  tenantId: string;
  email: string;
  roles: string[];
}

// Extend Express Request interface to include tenantId
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
    // Extend Express User from Passport to include our custom fields
    interface User {
      userId: string;
      tenantId: string;
      email: string;
      roles: string[];
      employeeId?: string;
    }
  }
}

/**
 * TenantMiddleware
 *
 * Critical middleware that extracts tenantId from JWT token and adds it to request object
 * This ensures multi-tenant isolation by making tenantId available for all subsequent queries
 *
 * Flow:
 * 1. Extract JWT token from Authorization header
 * 2. Verify and decode the token
 * 3. Extract tenantId from token payload
 * 4. Attach tenantId to request.tenantId
 * 5. Attach full user info to request.user
 *
 * Usage:
 * Apply globally in main.ts or app.module.ts to ensure all routes have tenant context
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        // Skip middleware for public routes
        return next();
      }

      const token = authHeader.replace('Bearer ', '');

      if (!token) {
        // Skip middleware if no token provided
        return next();
      }

      // Verify and decode JWT token
      const jwtSecret = this.configService.get<string>('JWT_SECRET');

      try {
        const payload = this.jwtService.verify(token, {
          secret: jwtSecret,
        });

        // Extract tenantId from JWT payload
        if (payload.tenantId) {
          req.tenantId = payload.tenantId;

          // Also attach full user info for convenience
          req.user = {
            userId: payload.userId,
            tenantId: payload.tenantId,
            email: payload.email,
            roles: payload.roles || [],
          } as Express.User;
        }
      } catch (error) {
        // Token verification failed, but don't block the request
        // Let the guards handle authentication errors
        console.warn('Token verification failed in TenantMiddleware:', error.message);
      }

      next();
    } catch (error) {
      console.error('Error in TenantMiddleware:', error);
      next();
    }
  }
}
