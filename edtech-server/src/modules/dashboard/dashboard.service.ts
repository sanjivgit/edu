import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(role: string, userId: string, tenantId?: string) {
    const base = {
      superadmin: () => this.adminStats(tenantId),
      admin: () => this.adminStats(tenantId),
      teacher: () => this.teacherStats(userId, tenantId),
      student: () => this.studentStats(userId),
      parent: () => this.parentStats(userId, tenantId),
    };
    const fn = base[role] ?? base.admin;
    return fn();
  }

  private async adminStats(tenantId?: string) {
    const [students, teachers, classes, fees, admissions, pendingAdmissions, overduePayments] =
      await Promise.all([
        this.prisma.student.count({ where: tenantId ? { tenantId } : {} }),
        this.prisma.teacher.count({ where: tenantId ? { tenantId } : {} }),
        this.prisma.class.count({ where: tenantId ? { tenantId } : {} }),
        this.prisma.payment.aggregate({ _sum: { amount: true } }),
        this.prisma.admission.count(),
        this.prisma.admission.count({ where: { status: 'pending' } }),
        this.prisma.payment.count({ where: { status: 'overdue' } }),
      ]);

    return {
      stats: [
        { id: 'students', label: 'Total Students', value: students, icon: 'Users', color: 'blue' },
        { id: 'teachers', label: 'Teachers', value: teachers, icon: 'UserCheck', color: 'green' },
        { id: 'classes', label: 'Classes', value: classes, icon: 'School', color: 'purple' },
        {
          id: 'fees',
          label: 'Fees Collected',
          value: Number(fees._sum.amount ?? 0),
          prefix: '₹',
          icon: 'CreditCard',
          color: 'amber',
        },
        { id: 'admissions', label: 'Admissions', value: admissions, icon: 'UserPlus', color: 'cyan' },
        {
          id: 'pendingAdmissions',
          label: 'Pending Admissions',
          value: pendingAdmissions,
          icon: 'Clock',
          color: 'orange',
        },
        { id: 'overduePayments', label: 'Overdue Payments', value: overduePayments, icon: 'AlertCircle', color: 'red' },
      ],
    };
  }

  private async teacherStats(userId: string, tenantId?: string) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId } });
    const [homework, assessments, exams, notices] = await Promise.all([
      this.prisma.homework.count({ where: { authorId: userId } }),
      this.prisma.assessment.count({ where: { authorId: userId } }),
      this.prisma.exam.count({ where: { authorId: userId } }),
      this.prisma.notice.count({ where: { authorId: userId } }),
    ]);
    const classTaught = teacher
      ? await this.prisma.class.findMany({ where: { classTeacherId: teacher.id } })
      : [];
    return {
      stats: [
        { id: 'homework', label: 'Homework Assigned', value: homework, icon: 'BookMarked', color: 'blue' },
        { id: 'assessments', label: 'Assessments', value: assessments, icon: 'PenLine', color: 'green' },
        { id: 'exams', label: 'Exams', value: exams, icon: 'GraduationCap', color: 'purple' },
        { id: 'notices', label: 'Notices', value: notices, icon: 'Bell', color: 'amber' },
        { id: 'classes', label: 'Classes Taught', value: classTaught.length, icon: 'School', color: 'cyan' },
      ],
    };
  }

  private async studentStats(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: { class_: true, section: true },
    });
    if (!student) {
      return { stats: [{ id: 'noData', label: 'No student profile linked', value: 0, icon: 'AlertCircle', color: 'gray' }] };
    }
    const [present, absent, homework, assessments] = await Promise.all([
      this.prisma.attendanceEntry.count({
        where: { studentId: student.id, status: 'present' },
      }),
      this.prisma.attendanceEntry.count({
        where: { studentId: student.id, status: 'absent' },
      }),
      this.prisma.homework.count({ where: { classId: student.classId } }),
      this.prisma.assessment.count({ where: { classId: student.classId } }),
    ]);
    return {
      stats: [
        { id: 'present', label: 'Days Present', value: present, icon: 'CheckCircle', color: 'green' },
        { id: 'absent', label: 'Days Absent', value: absent, icon: 'XCircle', color: 'red' },
        { id: 'homework', label: 'Homework', value: homework, icon: 'BookMarked', color: 'blue' },
        { id: 'assessments', label: 'Assessments', value: assessments, icon: 'PenLine', color: 'purple' },
      ],
      className: student.class_?.name,
      section: student.section?.name,
    };
  }

  private async parentStats(userId: string, tenantId?: string) {
    const children = await this.prisma.student.findMany({
      where: { parentId: userId },
      include: { class_: true },
    });
    const feesPending = await this.prisma.feeStructure.count({
      where: { classId: { in: children.map((c) => c.classId) }, dueDate: { lt: new Date() } },
    });
    const notices = await this.prisma.notice.count({ where: { status: 'published' } });
    return {
      stats: [
        { id: 'children', label: 'Children', value: children.length, icon: 'Users', color: 'blue' },
        { id: 'fees', label: 'Pending Fees', value: feesPending, icon: 'CreditCard', color: 'amber' },
        { id: 'notices', label: 'Notices', value: notices, icon: 'Bell', color: 'purple' },
      ],
      children: children.map((c) => ({ id: c.id, name: c.name, className: c.class_?.name })),
    };
  }

  async getEnrollmentTrend(year?: number) {
    const targetYear = year ?? new Date().getFullYear();
    const start = new Date(targetYear, 3, 1);
    const end = new Date(targetYear + 1, 2, 31);
    const students = await this.prisma.student.findMany({
      where: { admissionDate: { gte: start, lte: end } },
      select: { admissionDate: true },
    });

    const months: { month: string; students: number; target: number }[] = [];
    for (let m = 3; m <= 14; m++) {
      const monthIndex = m > 11 ? m - 12 : m;
      const label = new Date(targetYear, monthIndex - 1, 1).toLocaleString('en', { month: 'short' });
      const count = students.filter((s) => {
        const d = s.admissionDate;
        return d.getFullYear() === (m > 11 ? targetYear + 1 : targetYear) && d.getMonth() === monthIndex - 1;
      }).length;
      months.push({ month: label, students: count, target: 20 + Math.floor(count * 1.2) });
    }
    return months;
  }

  async getAttendanceSummary(classId?: string) {
    const from = new Date();
    from.setDate(from.getDate() - 30);
    const sessions = await this.prisma.attendanceSession.findMany({
      where: { ...(classId ? { classId } : {}), date: { gte: from } },
      include: { entries: true },
    });
    const byDate = new Map<string, { present: number; total: number }>();
    for (const s of sessions) {
      const key = s.date.toISOString().slice(0, 10);
      const cur = byDate.get(key) ?? { present: 0, total: 0 };
      cur.total += s.entries.length;
      cur.present += s.entries.filter((e) => e.status === 'present' || e.status === 'late').length;
      byDate.set(key, cur);
    }
    return Array.from(byDate.entries()).map(([date, v]) => ({
      date,
      present: v.present,
      total: v.total,
      percentage: v.total ? Math.round((v.present / v.total) * 100) : 0,
    }));
  }

  async getRecentActivity(tenantId?: string) {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return logs.map((l) => ({
      id: l.id,
      user: l.actor,
      action: l.action,
      module: l.module,
      timestamp: l.createdAt,
      type: l.action,
    }));
  }
}
