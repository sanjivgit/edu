import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/Button';
import { Input, SelectInput } from '@/components/ui/Input';
import { recordPaymentSchema, type RecordPaymentPayload } from '../validations/fees.schema';

export function RecordPaymentForm({
  initialStudent,
  initialAmount,
  onSubmit,
  isLoading = false,
}: {
  initialStudent?: string;
  initialAmount?: number;
  onSubmit: (payload: RecordPaymentPayload) => void;
  isLoading?: boolean;
}) {
  const form = useForm<RecordPaymentPayload>({
    resolver: yupResolver(recordPaymentSchema),
    defaultValues: {
      student: '',
      feeType: 'tuition',
      amount: 0,
      paymentMode: 'cash',
      paymentDate: new Date().toISOString().split('T')[0],
      referenceId: '',
    },
  });

  useEffect(() => {
    if (initialStudent) form.setValue('student', initialStudent);
    if (initialAmount !== undefined) form.setValue('amount', initialAmount);
  }, [initialStudent, initialAmount, form]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Student Roll No / Name" placeholder="Search student..." required {...form.register('student')} error={form.formState.errors.student?.message} />
      <SelectInput
        label="Fee Type"
        options={[
          { label: 'Tuition', value: 'tuition' },
          { label: 'Transport', value: 'transport' },
          { label: 'Lab', value: 'lab' },
          { label: 'Library', value: 'library' },
          { label: 'Exam', value: 'exam' },
        ]}
        value={form.watch('feeType')}
        onChange={(e) => form.setValue('feeType', e.target.value as RecordPaymentPayload['feeType'])}
        error={form.formState.errors.feeType?.message}
      />
      <Input label="Amount" type="number" required {...form.register('amount', { valueAsNumber: true })} error={form.formState.errors.amount?.message} />
      <SelectInput
        label="Payment Mode"
        options={[
          { label: 'Cash', value: 'cash' },
          { label: 'Online Transfer', value: 'online' },
          { label: 'Cheque', value: 'cheque' },
          { label: 'Demand Draft', value: 'dd' },
        ]}
        value={form.watch('paymentMode')}
        onChange={(e) => form.setValue('paymentMode', e.target.value as RecordPaymentPayload['paymentMode'])}
        error={form.formState.errors.paymentMode?.message}
      />
      <Input label="Payment Date" type="date" required {...form.register('paymentDate')} error={form.formState.errors.paymentDate?.message} />
      <Input label="Reference / Transaction ID" placeholder="Optional" {...form.register('referenceId')} error={form.formState.errors.referenceId?.message} />
      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          Record Payment
        </Button>
      </div>
    </form>
  );
}

