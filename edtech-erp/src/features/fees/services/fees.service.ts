import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { mockDelay } from '@/shared/utils';

export type FeeStatus = 'paid' | 'pending' | 'overdue';
export type FeeType = 'tuition' | 'transport' | 'lab' | 'library' | 'exam';
export type PaymentMode = 'cash' | 'online' | 'cheque' | 'dd';

export interface FeeRecord {
  id: string;
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

let feeStore: FeeRecord[] = Array.from({ length: 32 }, (_, i) => ({
  id: `FEE-${2000 + i}`,
  studentName: ['Aarav Sharma','Priya Patel','Riya Singh','Arjun Kumar','Sneha Gupta','Rahul Verma','Kavya Nair','Vikram Mehta'][i % 8],
  rollNo: `${(i % 12) + 1}${String(i + 1).padStart(3,'0')}`,
  className: `Class ${(i % 12) + 1}`,
  feeType: ['tuition','transport','lab','library','exam'][i % 5] as FeeType,
  amount: [5000,1500,800,500,1200][i % 5],
  dueDate: new Date(2026, 3, 10).toISOString().split('T')[0],
  paidDate: i % 3 !== 0 ? new Date(2026, 3, (i % 9) + 1).toISOString().split('T')[0] : undefined,
  status: (['paid','paid','pending','overdue','paid'][i % 5] as FeeStatus),
  receiptNo: i % 3 !== 0 ? `RCP-${3000 + i}` : undefined,
  paymentMode: i % 3 !== 0 ? (['cash','online','cheque','dd'][i % 4] as PaymentMode) : undefined,
  referenceId: i % 3 !== 0 ? `TXN-${9000 + i}` : undefined,
}));

export const useGetFees = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      await mockDelay(200);
      return [...feeStore];
    },
  });

export const useGetFeeById = ({ feeId }: { feeId?: string }) =>
  useQuery({
    queryKey: [API, feeId],
    queryFn: async () => {
      await mockDelay(120);
      return feeStore.find((f) => f.id === feeId) ?? null;
    },
    enabled: !!feeId,
  });

export const useRecordPayment = () =>
  useAppMutation({
    mutationFn: async (body: {
      feeId: string;
      paymentMode: PaymentMode;
      paymentDate: string;
      referenceId?: string;
      amount?: number;
    }) => {
      await mockDelay(200);
      feeStore = feeStore.map((f) =>
        f.id === body.feeId
          ? {
              ...f,
              status: 'paid',
              paidDate: body.paymentDate,
              receiptNo: f.receiptNo ?? `RCP-${Math.floor(3000 + Math.random() * 4000)}`,
              paymentMode: body.paymentMode,
              referenceId: body.referenceId,
              amount: body.amount ?? f.amount,
            }
          : f
      );
      return feeStore.find((f) => f.id === body.feeId)!;
    },
    successMsg: 'Payment recorded successfully',
    errorMsg: 'Failed to record payment',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useCreateFeeAndRecordPayment = () =>
  useAppMutation({
    mutationFn: async (body: {
      student: string;
      feeType: FeeType;
      amount: number;
      paymentMode: PaymentMode;
      paymentDate: string;
      referenceId?: string;
    }) => {
      await mockDelay(200);
      const created: FeeRecord = {
        id: `FEE-${2000 + feeStore.length}`,
        studentName: body.student,
        rollNo: body.student.replace(/\s+/g, '').slice(0, 5).toUpperCase(),
        className: 'Class 10',
        feeType: body.feeType,
        amount: body.amount,
        dueDate: body.paymentDate,
        paidDate: body.paymentDate,
        status: 'paid',
        receiptNo: `RCP-${3000 + feeStore.length}`,
        paymentMode: body.paymentMode,
        referenceId: body.referenceId,
      };
      feeStore = [created, ...feeStore];
      return created;
    },
    successMsg: 'Payment recorded successfully',
    errorMsg: 'Failed to record payment',
    invalidateQueryKeys: [[API, 'list']],
  });
