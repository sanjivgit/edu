import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { BillingService } from '../../modules/billing/billing.service';
import { SKIP_SUBSCRIPTION_KEY } from '../decorators/skip-subscription-check.decorator';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly billingService: BillingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_SUBSCRIPTION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    // Public routes / unauthenticated requests / superadmin are never gated.
    if (!user || user.role === UserRole.superadmin || !user.tenantId) {
      return true;
    }

    const status = await this.billingService.getTenantStatus(user.tenantId);
    if (!status.active) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          error: 'Subscription required',
          message:
            status.status === 'expired'
              ? 'Your subscription has expired. Please renew to continue using the platform.'
              : 'No active subscription. Please contact your administrator to activate the subscription.',
          code: 'SUBSCRIPTION_REQUIRED',
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
    return true;
  }
}
