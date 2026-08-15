import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  GetTimetableQueryDto,
  AssignTimetableCellDto,
  UpdateTimetableCellDto,
} from './dto/timetable.dto';
import { TimetableDay } from '@prisma/client';

export const TIMETABLE_DAYS: TimetableDay[] = [
  TimetableDay.Monday,
  TimetableDay.Tuesday,
  TimetableDay.Wednesday,
  TimetableDay.Thursday,
  TimetableDay.Friday,
  TimetableDay.Saturday,
];

@Injectable()
export class TimetableService {
  constructor(private prisma: PrismaService) {}

  async findByClass(query: GetTimetableQueryDto) {
    const { classId, section = 'A', week = 0 } = query;

    let timetable = await this.prisma.timetable.findUnique({
      where: {
        classId_section_week: { classId, section, week },
      },
      include: { cells: true },
    });

    // Auto-create empty record when missing (frontend expects a record)
    if (!timetable) {
      timetable = await this.prisma.timetable.create({
        data: { classId, section, week, cells: { create: [] } },
        include: { cells: true },
      });
    }

    const grid: Record<string, Record<number, { subject: string; teacher: string }>> = {};
    for (const day of TIMETABLE_DAYS) {
      grid[day] = {};
      for (let p = 1; p <= 10; p++) {
        const cell = timetable.cells.find((c) => c.day === day && c.periodId === p);
        grid[day][p] = cell
          ? { subject: cell.subjectName, teacher: cell.teacherName }
          : { subject: '', teacher: '' };
      }
    }

    return {
      id: timetable.id,
      classId: timetable.classId,
      section: timetable.section,
      week: timetable.week,
      grid,
      updatedAt: timetable.updatedAt,
    };
  }

  async listAll(classId?: string) {
    return this.prisma.timetable.findMany({
      where: classId ? { classId } : {},
      include: { cells: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async assignCell(dto: AssignTimetableCellDto) {
    const { classId, section = 'A', week = 0 } = dto;
    let timetable = await this.prisma.timetable.findUnique({
      where: { classId_section_week: { classId, section, week } },
    });
    if (!timetable) {
      timetable = await this.prisma.timetable.create({
        data: { classId, section, week },
      });
    }

    let subjectName = dto.subject;
    let teacherName = dto.teacher;
    if (dto.subjectId) {
      const subject = await this.prisma.subject.findUnique({
        where: { id: dto.subjectId },
        include: { teacher: true },
      });
      if (subject) {
        subjectName = subject.name;
        teacherName = subject.teacher?.fullName ?? dto.teacher;
      }
    }

    const existing = await this.prisma.timetableCell.findUnique({
      where: {
        timetableId_day_periodId: {
          timetableId: timetable.id,
          day: dto.day,
          periodId: dto.periodId,
        },
      },
    });

    if (existing) {
      return this.prisma.timetableCell.update({
        where: { id: existing.id },
        data: {
          subjectId: dto.subjectId,
          subjectName: subjectName ?? existing.subjectName,
          teacherName: teacherName ?? existing.teacherName,
        },
      });
    }

    return this.prisma.timetableCell.create({
      data: {
        timetableId: timetable.id,
        day: dto.day,
        periodId: dto.periodId,
        subjectId: dto.subjectId,
        subjectName: subjectName ?? '',
        teacherName: teacherName ?? '',
      },
    });
  }

  async updateCell(id: string, dto: UpdateTimetableCellDto) {
    const cell = await this.prisma.timetableCell.findUnique({ where: { id } });
    if (!cell) throw new NotFoundException('Timetable cell not found');

    let subjectName = dto.subject;
    let teacherName = dto.teacher;
    if (dto.subjectId) {
      const subject = await this.prisma.subject.findUnique({
        where: { id: dto.subjectId },
        include: { teacher: true },
      });
      if (subject) {
        subjectName = subject.name;
        teacherName = subject.teacher?.fullName ?? dto.teacher;
      }
    }

    return this.prisma.timetableCell.update({
      where: { id },
      data: {
        subjectId: dto.subjectId,
        subjectName: subjectName ?? cell.subjectName,
        teacherName: teacherName ?? cell.teacherName,
      },
    });
  }

  async removeCell(id: string) {
    const cell = await this.prisma.timetableCell.findUnique({ where: { id } });
    if (!cell) throw new NotFoundException('Timetable cell not found');
    await this.prisma.timetableCell.delete({ where: { id } });
    return { message: 'Cell removed' };
  }
}
