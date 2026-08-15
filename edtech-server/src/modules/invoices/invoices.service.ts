import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  RecordInvoicePaymentDto,
} from './dto/invoice.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto, status?: string, studentId?: string) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {
      ...(status ? { status: status as any } : {}),
      ...(studentId ? { studentId } : {}),
      ...(query.search
        ? {
            OR: [
              { invoiceNo: { contains: query.search, mode: 'insensitive' } },
              { student: { name: { contains: query.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.findMany({
        where,
        include: {
          student: { select: { id: true, name: true, rollNo: true } },
          items: true,
          payments: true,
        },
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder } : { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items: items.map((inv) => this.decorate(inv)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, name: true, rollNo: true } },
        items: true,
        payments: true,
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return this.decorate(invoice);
  }

  async create(dto: CreateInvoiceDto) {
    const student = await this.prisma.student.findUnique({ where: { id: dto.studentId } });
    if (!student) throw new NotFoundException('Student not found');

    const count = await this.prisma.invoice.count();
    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNo: `INV-${Date.now().toString().slice(-6)}-${count + 1}`,
        studentId: dto.studentId,
        classId: dto.classId ?? student.classId,
        section: dto.section,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : new Date(),
        dueDate: new Date(dto.dueDate),
        status: dto.status ?? InvoiceStatus.issued,
        notes: dto.notes,
        items: {
          create: dto.items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        },
      },
      include: { items: true, payments: true, student: true },
    });
    return this.decorate(invoice);
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    await this.findOne(id);
    await this.prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        studentId: dto.studentId,
        classId: dto.classId,
        section: dto.section,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
        dueDate: new Date(dto.dueDate),
        status: dto.status,
        notes: dto.notes,
        items: {
          create: dto.items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        },
      },
      include: { items: true, payments: true, student: true },
    });
    return this.decorate(invoice);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.invoice.delete({ where: { id } });
    return { message: 'Invoice deleted successfully' };
  }

  async recordPayment(id: string, dto: RecordInvoicePaymentDto) {
    const invoice = await this.findOne(id);
    await this.prisma.invoicePayment.create({
      data: {
        invoiceId: id,
        amount: dto.amount,
        mode: dto.mode,
        referenceId: dto.referenceId,
        paidDate: dto.paidDate ? new Date(dto.paidDate) : new Date(),
      },
    });

    const paid = invoice.paidAmount + dto.amount;
    const total = invoice.totalAmount;
    const status = paid >= total ? InvoiceStatus.paid : InvoiceStatus.issued;
    await this.prisma.invoice.update({
      where: { id },
      data: { status: status as any },
    });

    return {
      message: `Payment of ${dto.amount} recorded against ${invoice.invoiceNo}`,
      balance: Math.max(0, total - paid),
    };
  }

  private decorate(inv: any) {
    const items = inv.items ?? [];
    const payments = inv.payments ?? [];
    const totalAmount = items.reduce((acc: number, i: any) => acc + i.quantity * Number(i.unitPrice), 0);
    const paidAmount = payments.reduce((acc: number, p: any) => acc + Number(p.amount), 0);
    return {
      id: inv.id,
      invoiceNo: inv.invoiceNo,
      student: inv.student ?? { id: inv.studentId, name: 'Unknown', rollNo: '' },
      studentId: inv.studentId,
      classId: inv.classId,
      section: inv.section,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      status: inv.status,
      notes: inv.notes,
      items,
      payments,
      totalAmount,
      paidAmount,
      balance: totalAmount - paidAmount,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
    };
  }
}
