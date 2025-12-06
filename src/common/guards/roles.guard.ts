import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // No roles required, allow access
    }
    const { user }: { user: User } = context.switchToHttp().getRequest();

    if (!user) {
      // This should ideally be caught by the JwtAuthGuard, but as a safeguard:
      throw new ForbiddenException('You need to be logged in to access this resource');
    }

    const hasRole = () => requiredRoles.some((role) => user.role?.includes(role));

    if (!hasRole()) {
      throw new ForbiddenException(`You do not have permission. Required roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
