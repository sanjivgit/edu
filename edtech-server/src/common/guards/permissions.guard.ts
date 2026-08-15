import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

interface PermissionEntry {
  module: string;
  actions: string[];
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    if (user.role === 'superadmin') return true;

    const granted = new Set<string>(user.permissions ?? []);
    let explicitPermissions: string[] = [];

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { role_: true },
    });
    if (dbUser) {
      explicitPermissions = (dbUser.permissions as string[]) ?? [];
      explicitPermissions.forEach((p) => granted.add(p));
      const rolePermissions = (dbUser.role_?.permissions as unknown as PermissionEntry[]) ?? [];
      rolePermissions.forEach((entry) => {
        entry.actions.forEach((action) => granted.add(`${entry.module}.${action}`));
      });
    }

    const hasAll = requiredPermissions.every((p) => granted.has(p));
    if (!hasAll) {
      throw new ForbiddenException(`Requires permission(s): ${requiredPermissions.join(', ')}`);
    }
    return true;
  }
}
