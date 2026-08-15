import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { AttendanceStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SaveAttendanceDto, AttendanceQueryDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async getRoster(classId: string, section?: string) {
    const students = await this.prisma.student.findMany({
      where: {
        classId,
        ...(section ? { section: { name: section } } : {}),
        status: 'active' as any,
      },
      orderBy: { rollNo: 'asc' },
    });
    return students.map((s) => ({ id: s.id, name: s.name, rollNo: s.rollNo }));
  }

  async getByClassAndDate(query: AttendanceQueryDto) {
    if (!query.classId || !query.date) {
      throw new BadRequestException('classId and date are required');
    }
    const date = new Date(query.date);
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const session = await this.prisma.attendanceSession.findFirst({
      where: {
        classId: query.classId,
        section: query.section ?? null,
        date: { gte: date, lt: nextDay },
      },
      include: {
        entries: { include: { student: true } },
      },
    });

    if (!session) {
      return { id: null, classId: query.classId, section: query.section, date: query.date, entries: [] };
    }
    return {
      id: session.id,
      classId: session.classId,
      section: session.section,
      date: session.date,
      markedBy: session.markedBy,
      entries: session.entries.map((e) => ({
        studentId: e.studentId,
        name: e.student.name,
        rollNo: e.student.rollNo,
        status: e.status,
        remarks: e.remarks,
      })),
    };
  }

  async saveSession(dto: SaveAttendanceDto, userId: string) {
    if (!dto.entries?.length) {
      throw new BadRequestException('At least one attendance entry is required');
    }
    const date = new Date(dto.date);
    date.setHours(0, 0, 0, 0);

    const existing = await this.prisma.attendanceSession.findFirst({
      where: { classId: dto.classId, section: dto.section ?? null, date },
    });

    if (existing) {
      // delete existing entries then recreate (upsert per entry instead)
      for (const entry of dto.entries) {
        await this.prisma.attendanceEntry.upsert({
          where: {
            sessionId_studentId: { sessionId: existing.id, studentId: entry.studentId },
          },
          update: { status: entry.status, remarks: entry.remarks },
          create: {
            sessionId: existing.id,
            studentId: entry.studentId,
            status: entry.status,
            remarks: entry.remarks,
          },
        });
      }
      return this.getByClassAndDate({ classId: dto.classId, section: dto.section, date: dto.date });
    }

    const session = await this.prisma.attendanceSession.create({
      data: {
        classId: dto.classId,
        section: dto.section ?? null,
        date,
        markedBy: userId,
        entries: {
          create: dto.entries.map((e) => ({
            studentId: e.studentId,
            status: e.status,
            remarks: e.remarks,
          })),
        },
      },
      include: { entries: true },
    });

    return { ...session, message: 'Attendance saved successfully' };
  }

  async getHistory(classId?: string, section?: string) {
    const where: Prisma.AttendanceSessionWhereInput = {};
    if (classId) where.classId = classId;
    if (section) where.section = section;
    return this.prisma.attendanceSession.findMany({
      where,
      include: {
        entries: { include: { student: { select: { id: true, name: true, rollNo: true } } } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getSessionById(id: string) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id },
      include: { entries: { include: { student: true } } },
    });
    if (!session) throw new NotFoundException('Attendance session not found');
    return session;
  }

  async getStudentSummary(studentId: string, month?: string) {
    const now = new Date();
    const year = month ? Number(month.split('-')[0]) : now.getFullYear();
    const monthNum = month ? Number(month.split('-')[1]) : now.getMonth() + 1;
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 1);

    const sessions = await this.prisma.attendanceSession.findMany({
      where: { date: { gte: start, lt: end } },
      include: { entries: { where: { studentId } } },
    });

    let present = 0;
    let absent = 0;
    let late = 0;
    let halfDay = 0;
    for (const s of sessions) {
      const entry = s.entries[0];
      if (!entry) continue;
      if (entry.status === 'present') present++;
      else if (entry.status === 'absent') absent++;
      else if (entry.status === 'late') late++;
      else if (entry.status === 'half_day') halfDay++;
    }

    const total = present + absent + late + halfDay;
    const percentage = total > 0 ? Math.round(((present + late + halfDay * 0.5) / total) * 100) : 0;

    return { present, absent, late, halfDay, total, percentage };
  }

  async getReport(classId?: string, from?: string, to?: string) {
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const toDate = to ? new Date(to) : new Date();
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);

    const sessions = await this.prisma.attendanceSession.findMany({
      where: {
        ...(classId ? { classId } : {}),
        date: { gte: fromDate, lte: toDate },
      },
      include: { entries: true },
    });

    const studentTotals = new Map<
      string,
      { present: number; absent: number; late: number; total: number }
    >();
    for (const s of sessions) {
      for (const e of s.entries) {
        const cur = studentTotals.get(e.studentId) ?? { present: 0, absent: 0, late: 0, total: 0 };
        cur.total++;
        if (e.status === 'present') cur.present++;
        else if (e.status === 'absent') cur.absent++;
        else if (e.status === 'late') cur.late++;
        studentTotals.set(e.studentId, cur);
      }
    }

    const students = await this.prisma.student.findMany({
      where: classId ? { classId } : {},
    });

    const rows = students.map((s) => {
      const t = studentTotals.get(s.id) ?? { present: 0, absent: 0, late: 0, total: 0 };
      return {
        studentId: s.id,
        name: s.name,
        rollNo: s.rollNo,
        present: t.present,
        absent: t.absent,
        late: t.late,
        percentage: t.total ? Math.round(((t.present + t.late) / t.total) * 100) : 0,
      };
    });

    const total = sessions.reduce((acc, s) => acc + s.entries.length, 0);
    const present = rows.reduce((acc, r) => acc + r.present, 0);
    return {
      rows,
      summary: {
        totalSessions: sessions.length,
        totalEntries: total,
        present,
        absent: total - present,
        averagePercentage: rows.length
          ? Math.round(rows.reduce((acc, r) => acc + r.percentage, 0) / rows.length)
          : 0,
      },
    };
  }
}
