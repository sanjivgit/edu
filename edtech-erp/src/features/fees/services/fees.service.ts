import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { findStudentIdByName } from '@/features/common/services/lookups.service';

export type FeeStatus = 'paid' | 'pending' | 'overdue';
export type FeeType = 'tuition' | 'transport' | 'lab' | 'library' | 'exam';
export type PaymentMode = 'cash' | 'online' | 'cheque' | 'dd';

export interface FeeRecord {
  id: string;
  studentId?: string;
  studentName: string;
  rollNo: string;
  className: string;
  feeType: FeeType;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: FeeStatus;
  receiptNo?: string;
  paymentMode?: PaymentMode;
  referenceId?: string;
}

const API = '/fees';

interface BackendPayment {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  className: string;
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

export const useGetFees = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      const res = await apiClient
        .get<ApiResponse<BackendPayment[]>>('/fees/payments', { params: { limit: 500 } })
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
        }>>(`/fees/payments/${feeId}`)
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
        .get<ApiResponse<{ studentId: string; feeId: string | null }>>(`/fees/payments/${body.feeId}`)
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
        >('/fees/payments', {
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
        }>>('/fees/payments/create-fee', {
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
