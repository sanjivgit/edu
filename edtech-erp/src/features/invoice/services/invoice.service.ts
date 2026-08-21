import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { findStudentIdByName, resolveClassDisplayMap, resolveClassId } from '@/features/common/services/lookups.service';

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMode = 'cash' | 'online' | 'cheque' | 'dd';

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

interface BackendInvoice {
  id: string;
  invoiceNo: string;
  student: { id: string; name: string; rollNo: string } | null;
  studentId: string;
  classId: string;
  section: string | null;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  notes: string | null;
  items: InvoiceItem[];
  paidAmount: number;
  createdAt: string;
  updatedAt: string;
}

function calcTotal(items: InvoiceItem[]) {
  return items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
}

function toInvoiceRecord(inv: BackendInvoice, classMap: Map<string, string>): InvoiceRecord {
  const student = inv.student ?? { name: 'Unknown', rollNo: '' };
  return {
    id: inv.id,
    invoiceNo: inv.invoiceNo,
    student: `${student.name} (${student.rollNo})`,
    classId: classMap.get(inv.classId) ?? inv.classId,
    section: inv.section ?? '',
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    status: inv.status,
    items: inv.items ?? [],
    notes: inv.notes ?? '',
    createdAt: inv.createdAt,
    updatedAt: inv.updatedAt,
    paidAmount: Number(inv.paidAmount ?? 0),
  };
}

export const useGetInvoices = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<BackendInvoice[]>>('/invoices', { params: { limit: 500 } }).then(unwrapApi);
      const items = res ?? [];
      const classMap = await resolveClassDisplayMap(items.map((i) => i.classId));
      return items.map((i) => toInvoiceRecord(i, classMap)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
  });

export const useGetInvoiceById = ({ invoiceId }: { invoiceId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      const res = await apiClient.get<ApiResponse<BackendInvoice>>(`/invoices/${invoiceId}`).then(unwrapApi);
      const classMap = await resolveClassDisplayMap([res.classId]);
      return toInvoiceRecord(res, classMap);
    },
    enabled: !!invoiceId,
  });

export const useCreateInvoice = () =>
  useAppMutation<
    InvoiceRecord,
    {
      student: string;
      classId: string;
      section: string;
      issueDate: string;
      dueDate: string;
      items: InvoiceItem[];
      notes?: string | null;
    }
  >({
    mutationFn: async (body) => {
      const studentId = await findStudentIdByName(body.student);
      if (!studentId) throw new Error('Student not found. Use a registered student name or roll number.');
      const classId = await resolveClassId(body.classId);
      const res = await apiClient
        .post<ApiResponse<BackendInvoice>>('/invoices', {
          studentId,
          classId,
          section: body.section || undefined,
          issueDate: body.issueDate,
          dueDate: body.dueDate,
          notes: body.notes ?? undefined,
          items: body.items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice })),
        })
        .then(unwrapApi);
      return toInvoiceRecord(res, new Map());
    },
    successMsg: 'Invoice created successfully',
    errorMsg: 'Failed to create invoice',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateInvoice = () =>
  useAppMutation<
    InvoiceRecord,
    {
      id: string;
      student: string;
      classId: string;
      section: string;
      issueDate: string;
      dueDate: string;
      status: InvoiceStatus;
      items: InvoiceItem[];
      notes?: string | null;
    }
  >({
    mutationFn: async (body) => {
      const studentId = await findStudentIdByName(body.student);
      if (!studentId) throw new Error('Student not found. Use a registered student name or roll number.');
      const classId = await resolveClassId(body.classId);
      const res = await apiClient
        .put<ApiResponse<BackendInvoice>>(`/invoices/${body.id}`, {
          studentId,
          classId,
          section: body.section || undefined,
          issueDate: body.issueDate,
          dueDate: body.dueDate,
          status: body.status,
          notes: body.notes ?? undefined,
          items: body.items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice })),
        })
        .then(unwrapApi);
      const classMap = await resolveClassDisplayMap([res.classId]);
      return toInvoiceRecord(res, classMap);
    },
    successMsg: 'Invoice updated successfully',
    errorMsg: 'Failed to update invoice',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

export const useDeleteInvoice = () =>
  useAppMutation<{ id: string }, { id: string }>({
    mutationFn: async (body) => {
      await apiClient.delete(`/invoices/${body.id}`);
      return { id: body.id };
    },
    successMsg: 'Invoice deleted successfully',
    errorMsg: 'Failed to delete invoice',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useRecordInvoicePayment = () =>
  useAppMutation<InvoiceRecord, { id: string; amount: number; mode: PaymentMode; referenceId?: string }>({
    mutationFn: async (body) => {
      await apiClient
        .post(`/invoices/${body.id}/payments`, {
          amount: body.amount,
          mode: body.mode,
          referenceId: body.referenceId ?? undefined,
        })
        .then(unwrapApi);
      const res = await apiClient.get<ApiResponse<BackendInvoice>>(`/invoices/${body.id}`).then(unwrapApi);
      const classMap = await resolveClassDisplayMap([res.classId]);
      return toInvoiceRecord(res, classMap);
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
