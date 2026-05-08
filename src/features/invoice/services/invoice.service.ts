import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { mockDelay } from '@/shared/utils';

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceRecord {
  id: string;
  invoiceNo: string;
  student: string;
  classId: string;
  section: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  paidAmount: number;
}

const API = '/invoice';
let invoiceStore: InvoiceRecord[] = [];

function calcTotal(items: InvoiceItem[]) {
  return items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
}

function ensureSeed() {
  if (invoiceStore.length) return;
  const today = new Date();
  const iso = (d: Date) => d.toISOString().split('T')[0];
  const d1 = iso(today);
  const d2 = iso(new Date(today.getTime() - 1000 * 60 * 60 * 24 * 7));
  const due1 = iso(new Date(today.getTime() + 1000 * 60 * 60 * 24 * 10));
  const due2 = iso(new Date(today.getTime() + 1000 * 60 * 60 * 24 * 3));

  invoiceStore = [
    {
      id: 'INV-1',
      invoiceNo: 'INV-2026-0001',
      student: 'Aarav Sharma (010)',
      classId: '10',
      section: 'A',
      issueDate: d2,
      dueDate: due2,
      status: 'issued',
      items: [
        { description: 'Tuition Fee - April', quantity: 1, unitPrice: 2500 },
        { description: 'Lab Fee', quantity: 1, unitPrice: 500 },
      ],
      notes: 'Pay before due date to avoid late fee.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paidAmount: 0,
    },
    {
      id: 'INV-2',
      invoiceNo: 'INV-2026-0002',
      student: 'Priya Patel (011)',
      classId: '10',
      section: 'A',
      issueDate: d1,
      dueDate: due1,
      status: 'paid',
      items: [{ description: 'Tuition Fee - April', quantity: 1, unitPrice: 2500 }],
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paidAmount: 2500,
    },
  ];
}

export const useGetInvoices = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      await mockDelay(150);
      ensureSeed();
      return [...invoiceStore].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
  });

export const useGetInvoiceById = ({ invoiceId }: { invoiceId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', invoiceId],
    queryFn: async () => {
      await mockDelay(120);
      ensureSeed();
      return invoiceStore.find((i) => i.id === invoiceId) ?? null;
    },
    enabled: !!invoiceId,
  });

export const useCreateInvoice = () =>
  useAppMutation({
    mutationFn: async (body: {
      student: string;
      classId: string;
      section: string;
      issueDate: string;
      dueDate: string;
      items: InvoiceItem[];
      notes?: string | null;
    }) => {
      await mockDelay(220);
      ensureSeed();
      const nextNum = invoiceStore.length + 1;
      const created: InvoiceRecord = {
        id: `INV-${nextNum}`,
        invoiceNo: `INV-2026-${String(nextNum).padStart(4, '0')}`,
        student: body.student,
        classId: body.classId,
        section: body.section,
        issueDate: body.issueDate,
        dueDate: body.dueDate,
        status: 'issued',
        items: body.items,
        notes: body.notes ?? '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paidAmount: 0,
      };
      invoiceStore = [created, ...invoiceStore];
      return created;
    },
    successMsg: 'Invoice created successfully',
    errorMsg: 'Failed to create invoice',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateInvoice = () =>
  useAppMutation({
    mutationFn: async (body: { id: string } & Partial<Omit<InvoiceRecord, 'id' | 'invoiceNo' | 'createdAt'>>) => {
      await mockDelay(200);
      ensureSeed();
      const current = invoiceStore.find((i) => i.id === body.id);
      if (!current) throw new Error('Invoice not found');
      const next: InvoiceRecord = {
        ...current,
        ...body,
        items: body.items ?? current.items,
        updatedAt: new Date().toISOString(),
      };
      invoiceStore = invoiceStore.map((i) => (i.id === body.id ? next : i));
      return next;
    },
    successMsg: 'Invoice updated successfully',
    errorMsg: 'Failed to update invoice',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

export const useDeleteInvoice = () =>
  useAppMutation({
    mutationFn: async (body: { id: string }) => {
      await mockDelay(180);
      ensureSeed();
      invoiceStore = invoiceStore.filter((i) => i.id !== body.id);
      return { id: body.id };
    },
    successMsg: 'Invoice deleted successfully',
    errorMsg: 'Failed to delete invoice',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useRecordInvoicePayment = () =>
  useAppMutation({
    mutationFn: async (body: { id: string; amount: number; mode: 'cash' | 'online' | 'cheque' | 'dd'; referenceId?: string }) => {
      await mockDelay(200);
      ensureSeed();
      const current = invoiceStore.find((i) => i.id === body.id);
      if (!current) throw new Error('Invoice not found');
      const total = calcTotal(current.items);
      const paid = Math.min(total, Math.max(0, current.paidAmount + body.amount));
      const nextStatus: InvoiceStatus = paid >= total ? 'paid' : current.status;
      const next: InvoiceRecord = { ...current, paidAmount: paid, status: nextStatus, updatedAt: new Date().toISOString() };
      invoiceStore = invoiceStore.map((i) => (i.id === body.id ? next : i));
      return next;
    },
    successMsg: 'Payment recorded successfully',
    errorMsg: 'Failed to record payment',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

export function getInvoiceTotals(inv: InvoiceRecord) {
  const total = calcTotal(inv.items);
  const paid = inv.paidAmount ?? 0;
  const balance = Math.max(0, total - paid);
  return { total, paid, balance };
}

