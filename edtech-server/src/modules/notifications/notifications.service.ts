import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto, BulkNotificationDto } from './dto/notification.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: PaginationDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { message: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, items, unreadCount] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder } : { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      items,
      unreadCount,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async markRead(id: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    return { message: 'Notification marked as read' };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true },
    });
    return { message: 'All notifications marked as read' };
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { unreadCount: count };
  }

  async createForUser(userId: string, dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId,
        title: dto.title,
        message: dto.message,
        type: dto.type ?? 'info',
        channel: dto.channel ?? 'in_app',
        priority: dto.priority ?? 'normal',
        link: dto.link,
        audience: dto.audience ?? 'all',
        status: dto.scheduleAt ? 'queued' : 'sent',
        scheduleAt: dto.scheduleAt ? new Date(dto.scheduleAt) : undefined,
      },
    });
  }

  async bulk(dto: BulkNotificationDto) {
    let targetUsers: string[] = [];
    if (dto.userIds?.length) {
      targetUsers = dto.userIds;
    } else if (dto.roles?.length) {
      const users = await this.prisma.user.findMany({
        where: { role: { in: dto.roles } },
        select: { id: true },
      });
      targetUsers = users.map((u) => u.id);
    }

    if (!targetUsers.length) {
      return { message: 'No recipients found', sent: 0 };
    }

    await this.prisma.notification.createMany({
      data: targetUsers.map((userId) => ({
        userId,
        title: dto.title,
        message: dto.message,
        type: dto.type ?? 'info',
        channel: 'in_app',
        priority: 'normal',
        link: dto.link,
        audience: dto.roles?.join(',') ?? 'all',
        status: 'sent',
      })),
    });

    return { message: `Notification sent to ${targetUsers.length} user(s)`, sent: targetUsers.length };
  }
}
