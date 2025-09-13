import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/user.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('JWT_SECRET', 'JWT_SECRET'),
      });
      const normalizedPayloadRole = (payload.role ?? '')
        .toString()
        .toUpperCase();
      const normalizedAllowedRoles = roles.map((r: string) => r.toUpperCase());
      if (
        !normalizedPayloadRole ||
        !normalizedAllowedRoles.includes(normalizedPayloadRole)
      ) {
        throw new UnauthorizedException(
          'You are not authorized to access this resource',
        );
      }
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException(
        `you don't have permission to access this route`,
      );
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
