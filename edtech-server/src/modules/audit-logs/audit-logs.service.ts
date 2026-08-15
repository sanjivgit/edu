import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto & { module?: string }) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {
      ...(query.module ? { module: query.module } : {}),
      ...(query.search
        ? {
            OR: [
              { actor: { contains: query.search, mode: 'insensitive' } },
              { module: { contains: query.search, mode: 'insensitive' } },
              { summary: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder } : { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items: items.map((l) => ({
        id: l.id,
        user: l.actor,
        action: l.action,
        module: l.module,
        entityId: l.entityId,
        description: l.summary,
        metadata: l.meta,
        timestamp: l.createdAt,
        createdAt: l.createdAt,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const log = await this.prisma.auditLog.findUnique({ where: { id } });
    if (!log) throw new NotFoundException('Audit log not found');
    return log;
  }

  async exportCsv() {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5000,
    });
    const header = 'Timestamp,User,Action,Module,Description';
    const rows = logs.map((l) =>
      [
        l.createdAt.toISOString(),
        `"${(l.actor ?? '').replace(/"/g, '""')}"`,
        `"${(l.action ?? '').replace(/"/g, '""')}"`,
        `"${(l.module ?? '').replace(/"/g, '""')}"`,
        `"${(l.summary ?? '').replace(/"/g, '""')}"`,
      ].join(','),
    );
    return [header, ...rows].join('\n');
  }
}
