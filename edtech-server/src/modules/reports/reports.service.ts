import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

export interface ReportQuery {
  from?: string;
  to?: string;
  classId?: string;
  section?: string;
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private range(query: ReportQuery) {
    const to = query.to ? new Date(query.to) : new Date();
    const from = query.from ? new Date(query.from) : new Date(to.getTime() - 30 * 24 * 3600 * 1000);
    to.setHours(23, 59, 59, 999);
    from.setHours(0, 0, 0, 0);
    return { from, to };
  }

  async attendanceReport(query: ReportQuery) {
    const { from, to } = this.range(query);
    const sessions = await this.prisma.attendanceSession.findMany({
      where: {
        ...(query.classId ? { classId: query.classId } : {}),
        date: { gte: from, lte: to },
      },
      include: { entries: true },
    });

    const students = await this.prisma.student.count({
      where: query.classId ? { classId: query.classId } : {},
    });

    let totalEntries = 0;
    let present = 0;
    let absent = 0;
    let late = 0;
    const byDate = new Map<string, { present: number; total: number }>();

    for (const s of sessions) {
      totalEntries += s.entries.length;
      const key = s.date.toISOString().slice(0, 10);
      const cur = byDate.get(key) ?? { present: 0, total: 0 };
      cur.total += s.entries.length;
      for (const e of s.entries) {
        if (e.status === 'present') { present++; cur.present++; }
        else if (e.status === 'absent') absent++;
        else if (e.status === 'late') { late++; cur.present++; }
      }
      byDate.set(key, cur);
    }

    const avgPercentage = totalEntries
      ? Math.round(((present + late) / totalEntries) * 100)
      : 0;

    const trend = Array.from(byDate.entries())
      .map(([date, v]) => ({
        date,
        value: v.total ? Math.round((v.present / v.total) * 100) : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const topAbsentees = await this.prisma.attendanceEntry.groupBy({
      by: ['studentId'],
      where: {
        session: { date: { gte: from, lte: to } },
        status: 'absent',
      },
      _count: { studentId: true },
      orderBy: { _count: { studentId: 'desc' } },
      take: 5,
    });
    const ids = topAbsentees.map((a) => a.studentId);
    const studentMap = ids.length
      ? await this.prisma.student.findMany({ where: { id: { in: ids } } })
      : [];
    const topRows = topAbsentees.map((a) => {
      const s = studentMap.find((st) => st.id === a.studentId);
      return {
        label: s?.name ?? 'Unknown',
        value: a._count.studentId,
        meta: `Absences · ${s?.rollNo ?? ''}`,
      };
    });

    return {
      summary: {
        totalStudents: students,
        totalSessions: sessions.length,
        avgAttendance: avgPercentage,
        present,
        absent,
        late,
      },
      trend,
      topRows,
    };
  }

  async feesReport(query: ReportQuery) {
    const { from, to } = this.range(query);
    const payments = await this.prisma.payment.findMany({
      where: { paidDate: { gte: from, lte: to } },
      include: { fee: true },
    });

    const totalCollected = payments.reduce((acc, p) => acc + Number(p.amount), 0);
    const feeStructures = await this.prisma.feeStructure.findMany({
      where: query.classId ? { classId: query.classId } : {},
    });
    const pending = feeStructures.reduce((acc, f) => acc + Number(f.amount), 0);
    const overdueCount = await this.prisma.feeStructure.count({
      where: { dueDate: { lt: new Date() } },
    });

    const byMonth = new Map<string, number>();
    for (const p of payments) {
      const key = p.paidDate.toISOString().slice(0, 7);
      byMonth.set(key, (byMonth.get(key) ?? 0) + Number(p.amount));
    }
    const trend = Array.from(byMonth.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const byType = new Map<string, { count: number; total: number }>();
    for (const p of payments) {
      const type = p.fee?.type ?? 'other';
      const cur = byType.get(type) ?? { count: 0, total: 0 };
      cur.count++;
      cur.total += Number(p.amount);
      byType.set(type, cur);
    }
    const topRows = Array.from(byType.entries())
      .map(([label, v]) => ({ label, value: v.total, meta: `${v.count} payments` }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      summary: {
        totalCollected,
        pendingFees: pending,
        overdueCount,
        paymentCount: payments.length,
      },
      trend,
      topRows,
    };
  }

  async academicReport(query: ReportQuery) {
    const { from, to } = this.range(query);
    const [assessments, exams, homework, avgMarks] = await Promise.all([
      this.prisma.assessment.count({
        where: { date: { gte: from, lte: to }, ...(query.classId ? { classId: query.classId } : {}) },
      }),
      this.prisma.exam.count({
        where: { createdAt: { gte: from, lte: to }, ...(query.classId ? { classId: query.classId } : {}) },
      }),
      this.prisma.homework.count({
        where: { dueDate: { gte: from, lte: to }, ...(query.classId ? { classId: query.classId } : {}) },
      }),
      this.prisma.assessmentResult.aggregate({
        _avg: { marks: true },
        _count: true,
      }),
    ]);

    const totalStudents = await this.prisma.student.count({
      where: query.classId ? { classId: query.classId } : {},
    });

    const topPerformers = await this.prisma.assessmentResult.groupBy({
      by: ['studentId'],
      _avg: { marks: true },
      orderBy: { _avg: { marks: 'desc' } },
      take: 5,
    });
    const ids = topPerformers.map((p) => p.studentId);
    const studentMap = ids.length
      ? await this.prisma.student.findMany({ where: { id: { in: ids } } })
      : [];
    const topRows = topPerformers.map((p) => {
      const s = studentMap.find((st) => st.id === p.studentId);
      return {
        label: s?.name ?? 'Unknown',
        value: Math.round(p._avg.marks ?? 0),
        meta: `Avg marks · ${s?.rollNo ?? ''}`,
      };
    });

    return {
      summary: {
        totalStudents,
        totalAssessments: assessments,
        totalExams: exams,
        totalHomework: homework,
        avgScore: Math.round(avgMarks._avg.marks ?? 0),
        resultsCount: avgMarks._count,
      },
      trend: [],
      topRows,
    };
  }

  async export(type: string, format: string, query: ReportQuery) {
    let data: any;
    switch (type) {
      case 'attendance':
        data = await this.attendanceReport(query);
        break;
      case 'fees':
        data = await this.feesReport(query);
        break;
      case 'academic':
        data = await this.academicReport(query);
        break;
      default:
        throw new BadRequestException(`Unsupported report type: ${type}`);
    }

    const lines: string[] = [];
    lines.push(`EduCore Report - ${type.toUpperCase()} (${format.toUpperCase()})`);
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');
    lines.push('SUMMARY');
    for (const [key, value] of Object.entries(data.summary)) {
      lines.push(`${key}: ${value}`);
    }
    lines.push('');
    lines.push('TOP ROWS');
    for (const row of data.topRows) {
      lines.push(`${row.label} | ${row.value} | ${row.meta}`);
    }
    if (data.trend.length) {
      lines.push('');
      lines.push('TREND');
      for (const t of data.trend) {
        lines.push(`${t.date}: ${t.value}`);
      }
    }

    return lines.join('\n');
  }
}
