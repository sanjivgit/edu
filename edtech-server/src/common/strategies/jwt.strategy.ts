import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.accessSecret', 'educore_dev_access_secret_change_me'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role_: true },
    });
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User is not active');
    }
    const rolePermissions: { module: string; actions: string[] }[] =
      (user.role_?.permissions as any) ?? [];
    const rolePermissionStrings = (rolePermissions ?? [])
      .flatMap((entry) => entry.actions.map((action) => `${entry.module}.${action}`));
    const explicitPermissions = (user.permissions as string[]) ?? [];
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      permissions: [...new Set([...explicitPermissions, ...rolePermissionStrings])],
    };
  }
}
