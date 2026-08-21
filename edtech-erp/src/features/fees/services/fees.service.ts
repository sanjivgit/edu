import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { findStudentIdByName } from '@/features/common/services/lookups.service';

export type FeeStatus = 'paid' | 'pending' | 'overdue';
export type FeeType = 'tuition' | 'transport' | 'lab' | 'library' | 'exam';
export type PaymentMode = 'cash' | 'online' | 'cheque' | 'dd' | 'razorpay';

export interface FeeRecord {
  id: string;
  studentId?: string;
  studentName: string;
  rollNo: string;
  className: string;
  classId?: string;
  section?: string;
  feeType: FeeType;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: FeeStatus;
  receiptNo?: string;
  paymentMode?: PaymentMode;
  referenceId?: string;
}

export interface FeeFilters {
  classId?: string;
  section?: string;
  academicYearId?: string;
  status?: string;
}

export interface PaymentHistoryItem {
  id: string;
  feeId?: string;
  feeType: string;
  feeName?: string;
  amount: number;
  dueDate?: string;
  paidDate?: string;
  month?: string;
  status: string;
  receiptNo?: string;
  paymentMode?: string;
  referenceId?: string;
}

export interface StudentPaymentHistory {
  student: {
    id: string;
    name: string;
    rollNo: string;
    className: string;
    section?: string;
    academicYearName?: string;
  };
  summary: {
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
    totalDues: number;
  };
  payments: PaymentHistoryItem[];
  pendingFees: Array<{
    id: string;
    feeId: string;
    feeType: string;
    feeName?: string;
    amount: number;
    dueDate: string;
    status: string;
  }>;
}

export interface ParentChildFee {
  student: {
    id: string;
    name: string;
    rollNo: string;
    className: string;
    section?: string;
    academicYearName?: string;
  };
  summary: {
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
    totalDues: number;
  };
  recentPayments: Array<{
    id: string;
    amount: number;
    paidDate?: string;
    mode?: string;
    receiptNo?: string;
    feeType?: string;
  }>;
  pendingFees: Array<{
    id: string;
    feeId: string;
    feeType: string;
    feeName?: string;
    amount: number;
    dueDate: string;
    status: string;
  }>;
}

const API = '/fees';

interface BackendPayment {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  className: string;
  classId?: string;
  section?: string;
  feeType: string;
  amount: number | string;
  dueDate?: string;
  paidDate?: string;
  status: FeeStatus;
  receiptNo?: string;
  paymentMode?: PaymentMode;
  mode?: PaymentMode;
  referenceId?: string;
}

function toFeeRecord(p: BackendPayment): FeeRecord {
  return {
    id: p.id,
    studentId: p.studentId,
    studentName: p.studentName,
    rollNo: p.rollNo,
    className: p.className ?? '',
    classId: p.classId,
    section: p.section,
    feeType: (p.feeType ?? 'other') as FeeType,
    amount: Number(p.amount),
    dueDate: p.dueDate ?? new Date().toISOString().split('T')[0],
    paidDate: p.paidDate,
    status: p.status,
    receiptNo: p.receiptNo,
    paymentMode: p.paymentMode ?? p.mode,
    referenceId: p.referenceId,
  };
}

export const useGetFees = (filters?: FeeFilters) =>
  useQuery({
    queryKey: [API, 'list', filters],
    queryFn: async () => {
      const params: Record<string, string> = { limit: '500' };
      if (filters?.classId) params.classId = filters.classId;
      if (filters?.section) params.section = filters.section;
      if (filters?.academicYearId) params.academicYearId = filters.academicYearId;
      if (filters?.status) params.status = filters.status;
      const res = await apiClient
        .get<ApiResponse<BackendPayment[]>>(`${API}/payments`, { params })
        .then(unwrapApi);
      return (res ?? []).map(toFeeRecord);
    },
  });

export const useGetFeeById = ({ feeId }: { feeId?: string }) =>
  useQuery({
    queryKey: [API, feeId],
    queryFn: async () => {
      if (!feeId) return null;
      const res = await apiClient
        .get<ApiResponse<{
          id: string;
          student: { id: string; name: string; rollNo: string };
          fee: { type: FeeType; dueDate?: string } | null;
          amount: number | string;
          paidDate?: string;
          status: FeeStatus;
          receiptNo?: string;
          mode?: PaymentMode;
          referenceId?: string;
        }>>(`${API}/payments/${feeId}`)
        .then(unwrapApi);
      return toFeeRecord({
        id: res.id,
        studentId: res.student.id,
        studentName: res.student.name,
        rollNo: res.student.rollNo,
        className: '',
        feeType: res.fee?.type ?? 'other',
        amount: res.amount,
        dueDate: res.fee?.dueDate,
        paidDate: res.paidDate,
        status: res.status,
        receiptNo: res.receiptNo,
        paymentMode: res.mode,
        referenceId: res.referenceId,
      });
    },
    enabled: !!feeId,
  });

export const useGetStudentPaymentHistory = (studentId: string) =>
  useQuery({
    queryKey: [API, 'student-history', studentId],
    queryFn: async () => {
      const res = await apiClient
        .get<ApiResponse<StudentPaymentHistory>>(`${API}/payments/student/${studentId}`)
        .then(unwrapApi);
      return res as StudentPaymentHistory;
    },
    enabled: !!studentId,
  });

export const useGetParentFees = () =>
  useQuery({
    queryKey: [API, 'parent-fees'],
    queryFn: async () => {
      const res = await apiClient
        .get<ApiResponse<{ children: ParentChildFee[]; totalPending: number; totalOverdue: number }>>(`${API}/parent/child-fees`)
        .then(unwrapApi);
      return res as { children: ParentChildFee[]; totalPending: number; totalOverdue: number };
    },
  });

export const useRecordPayment = () =>
  useAppMutation<
    FeeRecord,
    {
      feeId: string;
      paymentMode: PaymentMode;
      paymentDate: string;
      referenceId?: string;
      amount?: number;
    }
  >({
    mutationFn: async (body) => {
      const existing = await apiClient
        .get<ApiResponse<{ studentId: string; feeId: string | null }>>(`${API}/payments/${body.feeId}`)
        .then(unwrapApi);
      const res = await apiClient
        .post<
          ApiResponse<
            BackendPayment & {
              student?: { name: string; rollNo: string };
              fee?: { type: FeeType; dueDate?: string } | null;
              mode?: PaymentMode;
            }
          >
        >(`${API}/payments`, {
          studentId: existing.studentId,
          feeId: existing.feeId ?? undefined,
          amount: body.amount,
          paidDate: body.paymentDate,
          mode: body.paymentMode,
          referenceId: body.referenceId,
        })
        .then(unwrapApi);
      return toFeeRecord({
        id: res.id,
        studentId: res.studentId,
        studentName: res.student?.name ?? res.studentName,
        rollNo: res.student?.rollNo ?? res.rollNo,
        className: res.className ?? '',
        feeType: res.fee?.type ?? res.feeType,
        amount: res.amount,
        dueDate: res.fee?.dueDate ?? res.dueDate,
        paidDate: res.paidDate,
        status: res.status,
        receiptNo: res.receiptNo,
        paymentMode: res.mode ?? res.paymentMode,
        referenceId: res.referenceId,
      });
    },
    successMsg: 'Payment recorded successfully',
    errorMsg: 'Failed to record payment',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useRecordDirectPayment = () =>
  useAppMutation<
    FeeRecord,
    {
      studentId: string;
      feeId?: string;
      amount: number;
      paymentMode: PaymentMode;
      paymentDate: string;
      referenceId?: string;
      remarks?: string;
    }
  >({
    mutationFn: async (body) => {
      const res = await apiClient
        .post<ApiResponse<BackendPayment>>(`${API}/payments`, {
          studentId: body.studentId,
          feeId: body.feeId,
          amount: body.amount,
          paidDate: body.paymentDate,
          mode: body.paymentMode,
          referenceId: body.referenceId,
          remarks: body.remarks,
        })
        .then(unwrapApi);
      return toFeeRecord({
        id: res.id,
        studentId: res.studentId,
        studentName: res.studentName ?? '',
        rollNo: res.rollNo ?? '',
        className: res.className ?? '',
        feeType: res.feeType ?? 'other',
        amount: res.amount,
        dueDate: res.dueDate,
        paidDate: res.paidDate,
        status: res.status,
        receiptNo: res.receiptNo,
        paymentMode: res.paymentMode ?? res.mode,
        referenceId: res.referenceId,
      });
    },
    successMsg: 'Payment recorded successfully',
    errorMsg: 'Failed to record payment',
    invalidateQueryKeys: [[API, 'list'], [API, 'student-history']],
  });

export const useCreateFeeAndRecordPayment = () =>
  useAppMutation<
    FeeRecord,
    {
      student: string;
      feeType: FeeType;
      amount: number;
      paymentMode: PaymentMode;
      paymentDate: string;
      referenceId?: string;
    }
  >({
    mutationFn: async (body) => {
      const studentId = await findStudentIdByName(body.student);
      if (!studentId) throw new Error('Student not found. Use a registered student name or roll number.');
      const res = await apiClient
        .post<ApiResponse<{
          payment: {
            id: string;
            amount: number | string;
            paidDate: string;
            mode: PaymentMode;
            receiptNo: string;
            referenceId?: string;
          };
          fee: { type: FeeType };
          student: { id: string; name: string; rollNo: string; className: string };
        }>>(`${API}/payments/create-fee`, {
          studentId,
          feeType: body.feeType,
          amount: body.amount,
          paymentMode: body.paymentMode,
          paymentDate: body.paymentDate,
          referenceId: body.referenceId,
        })
        .then(unwrapApi);
      return {
        id: res.payment.id,
        studentId: res.student.id,
        studentName: res.student.name,
        rollNo: res.student.rollNo,
        className: res.student.className,
        feeType: res.fee.type,
        amount: Number(res.payment.amount),
        dueDate: res.payment.paidDate ?? new Date().toISOString().split('T')[0],
        paidDate: res.payment.paidDate,
        status: 'paid',
        receiptNo: res.payment.receiptNo,
        paymentMode: res.payment.mode,
        referenceId: res.payment.referenceId,
      };
    },
    successMsg: 'Payment recorded successfully',
    errorMsg: 'Failed to record payment',
    invalidateQueryKeys: [[API, 'list']],
  });
