import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateFeeStructureDto,
  UpdateFeeStructureDto,
  RecordPaymentDto,
  CreateFeeAndPaymentDto,
  GenerateInvoiceDto,
} from './dto/fees.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class FeesService {
  constructor(private prisma: PrismaService) {}

  // ── Fee Structures ───────────────────────────────────────────────────────
  async findStructures(tenantId?: string, classId?: string) {
    return this.prisma.feeStructure.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        ...(classId ? { classId } : {}),
      },
      include: { class_: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findStructure(id: string) {
    const fee = await this.prisma.feeStructure.findUnique({
      where: { id },
      include: { class_: true },
    });
    if (!fee) throw new NotFoundException('Fee structure not found');
    return fee;
  }

  async createStructure(dto: CreateFeeStructureDto, tenantId?: string) {
    return this.prisma.feeStructure.create({
      data: {
        name: dto.name,
        classId: dto.classId,
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
        type: dto.type,
        isRecurring: dto.isRecurring ?? false,
        frequency: dto.frequency,
        tenantId,
      },
    });
  }

  async updateStructure(id: string, dto: UpdateFeeStructureDto) {
    await this.findStructure(id);
    return this.prisma.feeStructure.update({
      where: { id },
      data: {
        name: dto.name,
        classId: dto.classId,
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
        type: dto.type,
        isRecurring: dto.isRecurring,
        frequency: dto.frequency,
      },
    });
  }

  async removeStructure(id: string) {
    await this.findStructure(id);
    await this.prisma.feeStructure.delete({ where: { id } });
    return { message: 'Fee structure deleted' };
  }

  // ── Payments ─────────────────────────────────────────────────────────────
  async findAllPayments(
    query: PaginationDto,
    status?: string,
    studentId?: string,
    classId?: string,
    section?: string,
    academicYearId?: string,
  ) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {
      ...(status ? { status: status as any } : {}),
      ...(studentId ? { studentId } : {}),
      ...(query.search
        ? {
            OR: [
              { receiptNo: { contains: query.search, mode: 'insensitive' } },
              { referenceId: { contains: query.search } },
              { student: { name: { contains: query.search, mode: 'insensitive' } } },
              { student: { rollNo: { contains: query.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    if (classId || section || academicYearId) {
      const studentFilter: Prisma.StudentWhereInput = {};
      if (classId) studentFilter.classId = classId;
      if (section) studentFilter.section = { name: section };
      if (academicYearId) studentFilter.currentAcademicYearId = academicYearId;
      where.student = studentFilter;
    }

    const [total, items] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        include: {
          student: { select: { id: true, name: true, rollNo: true, classId: true, sectionId: true, section: true, class_: { select: { name: true } } } },
          fee: true,
        },
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder } : { paidDate: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items: items.map((p) => ({
        id: p.id,
        studentId: p.studentId,
        studentName: p.student.name,
        rollNo: p.student.rollNo,
        className: p.student.class_?.name ?? '',
        classId: p.student.classId,
        section: p.student.section,
        feeType: p.fee?.type ?? 'other',
        feeName: p.fee?.name,
        amount: Number(p.amount),
        dueDate: p.fee?.dueDate,
        paidDate: p.paidDate,
        status: p.status,
        receiptNo: p.receiptNo,
        paymentMode: p.mode,
        referenceId: p.referenceId,
        remarks: p.remarks,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findStudentPaymentHistory(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { class_: { select: { name: true } }, currentAcademicYear: { select: { name: true } }, section: { select: { name: true } } },
    });
    if (!student) throw new NotFoundException('Student not found');

    const payments = await this.prisma.payment.findMany({
      where: { studentId },
      include: { fee: true },
      orderBy: { paidDate: 'desc' },
    });

    const feeStructures = await this.prisma.feeStructure.findMany({
      where: { classId: student.classId },
      orderBy: { dueDate: 'desc' },
    });

    const paidFeeIds = new Set(payments.filter((p) => p.feeId).map((p) => p.feeId));

    const pendingFees = feeStructures
      .filter((f) => !paidFeeIds.has(f.id))
      .map((f) => ({
        id: `pending-${f.id}-${studentId}`,
        feeId: f.id,
        feeType: f.type,
        feeName: f.name,
        amount: Number(f.amount),
        dueDate: f.dueDate,
        status: f.dueDate < new Date() ? 'overdue' : 'pending',
        paidDate: null,
        receiptNo: null,
        paymentMode: null,
        referenceId: null,
      }));

    const monthWisePayments = payments.map((p) => {
      const paidDate = p.paidDate ? new Date(p.paidDate) : null;
      return {
        id: p.id,
        feeId: p.feeId,
        feeType: p.fee?.type ?? 'other',
        feeName: p.fee?.name,
        amount: Number(p.amount),
        dueDate: p.fee?.dueDate,
        paidDate: p.paidDate,
        month: paidDate ? `${paidDate.getFullYear()}-${String(paidDate.getMonth() + 1).padStart(2, '0')}` : null,
        status: p.status,
        receiptNo: p.receiptNo,
        paymentMode: p.mode,
        referenceId: p.referenceId,
      };
    });

    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalPending = pendingFees.filter((f) => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0);
    const totalOverdue = pendingFees.filter((f) => f.status === 'overdue').reduce((sum, f) => sum + f.amount, 0);

    return {
      student: {
        id: student.id,
        name: student.name,
        rollNo: student.rollNo,
        className: student.class_?.name ?? '',
        section: student.section?.name,
        academicYearName: student.currentAcademicYear?.name,
      },
      summary: {
        totalPaid,
        totalPending,
        totalOverdue,
        totalDues: totalPending + totalOverdue,
      },
      payments: monthWisePayments,
      pendingFees,
    };
  }

  async findParentChildFees(parentId: string) {
    const children = await this.prisma.student.findMany({
      where: { parentId, status: 'active' as any },
      include: { class_: { select: { name: true } }, currentAcademicYear: { select: { name: true } }, section: { select: { name: true } } },
    });

    if (children.length === 0) {
      return { children: [], totalPending: 0, totalOverdue: 0 };
    }

    const results = await Promise.all(
      children.map(async (child) => {
        const payments = await this.prisma.payment.findMany({
          where: { studentId: child.id },
          include: { fee: true },
          orderBy: { paidDate: 'desc' },
        });

        const feeStructures = await this.prisma.feeStructure.findMany({
          where: { classId: child.classId },
        });

        const paidFeeIds = new Set(payments.filter((p) => p.feeId).map((p) => p.feeId));

        const pendingFees = feeStructures
          .filter((f) => !paidFeeIds.has(f.id))
          .map((f) => ({
            id: `pending-${f.id}-${child.id}`,
            feeId: f.id,
            feeType: f.type,
            feeName: f.name,
            amount: Number(f.amount),
            dueDate: f.dueDate,
            status: f.dueDate < new Date() ? 'overdue' : 'pending',
          }));

        const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const totalPending = pendingFees.filter((f) => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0);
        const totalOverdue = pendingFees.filter((f) => f.status === 'overdue').reduce((sum, f) => sum + f.amount, 0);

        return {
          student: {
            id: child.id,
            name: child.name,
            rollNo: child.rollNo,
            className: child.class_?.name ?? '',
            section: child.section?.name,
            academicYearName: child.currentAcademicYear?.name,
          },
          summary: { totalPaid, totalPending, totalOverdue, totalDues: totalPending + totalOverdue },
          recentPayments: payments.slice(0, 5).map((p) => ({
            id: p.id,
            amount: Number(p.amount),
            paidDate: p.paidDate,
            mode: p.mode,
            receiptNo: p.receiptNo,
            feeType: p.fee?.type ?? 'other',
          })),
          pendingFees,
        };
      }),
    );

    const totalPending = results.reduce((sum, r) => sum + r.summary.totalPending, 0);
    const totalOverdue = results.reduce((sum, r) => sum + r.summary.totalOverdue, 0);

    return { children: results, totalPending, totalOverdue };
  }

  async findPayment(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { student: true, fee: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async recordPayment(dto: RecordPaymentDto) {
    const student = await this.prisma.student.findUnique({ where: { id: dto.studentId } });
    if (!student) throw new NotFoundException('Student not found');

    let feeId = dto.feeId;
    if (dto.invoiceId) {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: dto.invoiceId },
        include: { payments: true, items: true },
      });
      if (!invoice) throw new NotFoundException('Invoice not found');
      const paid = invoice.payments.reduce((acc, p) => acc + Number(p.amount), 0);
      const total = invoice.items.reduce((acc, i) => acc + i.quantity * Number(i.unitPrice), 0);
      const newPaid = paid + dto.amount;
      const newStatus = newPaid >= total ? 'paid' : 'issued';
      await this.prisma.invoicePayment.create({
        data: {
          invoiceId: invoice.id,
          amount: dto.amount,
          mode: dto.mode,
          referenceId: dto.referenceId,
          paidDate: dto.paidDate ? new Date(dto.paidDate) : new Date(),
        },
      });
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: newStatus as any },
      });
    }

    const receiptNo = `RCP-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
    const payment = await this.prisma.payment.create({
      data: {
        studentId: dto.studentId,
        feeId,
        amount: dto.amount,
        paidDate: dto.paidDate ? new Date(dto.paidDate) : new Date(),
        mode: dto.mode,
        status: PaymentStatus.paid,
        receiptNo,
        referenceId: dto.referenceId,
        remarks: dto.remarks,
      },
      include: { student: true, fee: true },
    });
    return { ...payment, message: 'Payment recorded successfully' };
  }

  async createFeeAndPayment(dto: CreateFeeAndPaymentDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
      include: { class_: true },
    });
    if (!student) throw new NotFoundException('Student not found');

    const fee = await this.prisma.feeStructure.create({
      data: {
        name: `${dto.feeType} Fee`,
        classId: student.classId,
        amount: dto.amount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : new Date(),
        type: dto.feeType,
        isRecurring: dto.feeType === 'tuition' || dto.feeType === 'transport',
        frequency: dto.feeType === 'tuition' || dto.feeType === 'transport' ? 'monthly' : null,
        tenantId: student.tenantId,
      },
    });

    const receiptNo = `RCP-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
    const payment = await this.prisma.payment.create({
      data: {
        studentId: dto.studentId,
        feeId: fee.id,
        amount: dto.amount,
        paidDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
        mode: dto.paymentMode,
        status: PaymentStatus.paid,
        receiptNo,
        referenceId: dto.referenceId,
      },
    });

    return {
      payment,
      fee,
      student: {
        id: student.id,
        name: student.name,
        rollNo: student.rollNo,
        className: student.class_?.name ?? 'Class 10',
      },
      message: 'Fee created and payment recorded',
    };
  }

  async overduePayments() {
    const overdue = await this.prisma.feeStructure.findMany({
      where: { dueDate: { lt: new Date() } },
      include: {
        payments: true,
        class_: { include: { students: { where: { status: 'active' as any } } } },
      },
    });

    const items = [];
    for (const fee of overdue) {
      const paidStudentIds = new Set(fee.payments.map((p) => p.studentId));
      for (const student of fee.class_?.students ?? []) {
        if (paidStudentIds.has(student.id)) continue;
        items.push({
          id: `${fee.id}-${student.id}`,
          studentId: student.id,
          studentName: student.name,
          rollNo: student.rollNo,
          feeType: fee.type,
          amount: Number(fee.amount),
          dueDate: fee.dueDate,
          status: 'overdue',
        });
      }
    }
    return items;
  }

  async stats() {
    const [collected, pending, overdue] = await Promise.all([
      this.prisma.payment.aggregate({ _sum: { amount: true } }),
      this.prisma.feeStructure.aggregate({ _sum: { amount: true } }),
      this.prisma.feeStructure.count({ where: { dueDate: { lt: new Date() } } }),
    ]);
    const paidCount = await this.prisma.payment.count();
    return {
      totalCollected: Number(collected._sum.amount ?? 0),
      pendingFees: Number(pending._sum.amount ?? 0),
      overdueCount: overdue,
      paidCount,
    };
  }

  async generateInvoice(dto: GenerateInvoiceDto) {
    const student = await this.prisma.student.findUnique({ where: { id: dto.studentId } });
    if (!student) throw new NotFoundException('Student not found');

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNo: `INV-${dto.month.replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        studentId: dto.studentId,
        classId: student.classId,
        section: 'A',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 15 * 24 * 3600 * 1000),
        status: 'issued',
        items: {
          create: [{ description: `Tuition fee for ${dto.month}`, quantity: 1, unitPrice: 2000 }],
        },
      },
    });

    return {
      url: `/invoices/${invoice.id}/pdf`,
      invoiceNo: invoice.invoiceNo,
      message: 'Invoice generated',
    };
  }

  async sendReminder(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { parent: true },
    });
    if (!student) throw new NotFoundException('Student not found');

    const overdue = await this.prisma.feeStructure.findMany({
      where: { dueDate: { lt: new Date() } },
      include: { payments: { where: { studentId } } },
    });
    const pending = overdue.filter((f) => f.payments.length === 0);

    if (student.parentId) {
      await this.prisma.notification.create({
        data: {
          userId: student.parentId,
          title: 'Fee Payment Reminder',
          message: `${pending.length} fee payments are overdue for ${student.name}. Please clear them at the earliest.`,
          type: 'warning',
          channel: 'in_app',
          priority: 'high',
          link: '/fees',
          isRead: false,
          status: 'sent',
        },
      });
    }

    return {
      message: `Reminder sent for ${pending.length} overdue fee item(s)`,
      overdueCount: pending.length,
    };
  }
}
