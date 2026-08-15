import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHolidayDto, UpdateHolidayDto } from './dto/holiday.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class HolidaysService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto, year?: number) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 100);
    const skip = (page - 1) * limit;

    const where: Prisma.HolidayWhereInput = {
      ...(year
        ? {
            startDate: {
              gte: new Date(year, 0, 1),
              lt: new Date(year + 1, 0, 1),
            },
          }
        : {}),
      ...(query.search
        ? { OR: [{ title: { contains: query.search, mode: 'insensitive' } }] }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.holiday.count({ where }),
      this.prisma.holiday.findMany({
        where,
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder } : { startDate: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const holiday = await this.prisma.holiday.findUnique({ where: { id } });
    if (!holiday) throw new NotFoundException('Holiday not found');
    return holiday;
  }

  async create(dto: CreateHolidayDto) {
    return this.prisma.holiday.create({
      data: {
        title: dto.title,
        type: dto.type ?? 'holiday',
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        isFullDay: dto.isFullDay ?? true,
        appliesTo: dto.appliesTo ?? 'all',
        status: dto.status ?? 'announced',
        description: dto.description,
      },
    });
  }

  async update(id: string, dto: UpdateHolidayDto) {
    await this.findOne(id);
    return this.prisma.holiday.update({
      where: { id },
      data: {
        title: dto.title,
        type: dto.type,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        isFullDay: dto.isFullDay,
        appliesTo: dto.appliesTo,
        status: dto.status,
        description: dto.description,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.holiday.delete({ where: { id } });
    return { message: 'Holiday deleted successfully' };
  }
}
