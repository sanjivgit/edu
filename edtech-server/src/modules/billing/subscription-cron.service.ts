import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionCronService {
  private readonly logger = new Logger(SubscriptionCronService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireSubscriptions() {
    const now = new Date();
    const result = await this.prisma.subscription.updateMany({
      where: {
        status: { in: [SubscriptionStatus.active, SubscriptionStatus.trial] },
        expiresAt: { lt: now },
      },
      data: { status: SubscriptionStatus.expired },
    });
    if (result.count > 0) {
      this.logger.log(`Marked ${result.count} subscription(s) as expired`);
    }
  }
}
