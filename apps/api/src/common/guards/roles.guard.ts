import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const ROLES_HIERARCHY: Record<string, number> = { SUPER_ADMIN: 100, PASTOR: 80, ADMIN: 60, LEADER: 40, MEMBER: 20 };

export const Roles = (...roles: string[]) =>
  (target: any, key?: string, descriptor?: any) => {
    Reflect.defineMetadata('roles', roles, descriptor?.value ?? target);
    return descriptor ?? target;
  };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user?.role) return false;

    const userLevel = ROLES_HIERARCHY[user.role] ?? 0;
    return requiredRoles.some((role) => userLevel >= (ROLES_HIERARCHY[role] ?? 999));
  }
}
