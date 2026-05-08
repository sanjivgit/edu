import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, SelectInput } from '@/components/ui/Input';
import { useRecordInvoicePayment } from '../services/invoice.service';

const recordPaymentSchema = yup.object({
  amount: yup.number().typeError('Amount must be a number').min(1, 'Amount must be at least 1').required('Amount is required'),
  mode: yup.string().oneOf(['cash', 'online', 'cheque', 'dd']).required('Payment mode is required'),
  referenceId: yup.string().trim().nullable().default(''),
});

type RecordInvoicePaymentPayload = yup.InferType<typeof recordPaymentSchema>;

export function RecordInvoicePaymentForm({ invoiceId, maxAmount }: { invoiceId: string; maxAmount: number }) {
  const mutation = useRecordInvoicePayment();
  const form = useForm<RecordInvoicePaymentPayload>({
    resolver: yupResolver(recordPaymentSchema),
    defaultValues: { amount: Math.max(1, Math.min(500, Math.floor(maxAmount))), mode: 'cash', referenceId: '' },
  });

  const onSubmit = (values: RecordInvoicePaymentPayload) => {
    mutation.mutate({
      id: invoiceId,
      amount: Number(values.amount),
      mode: values.mode as 'cash' | 'online' | 'cheque' | 'dd',
      referenceId: values.referenceId ?? '',
    });
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">Record Payment</p>
        <p className="text-xs text-muted-foreground">Balance: <span className="font-mono">₹{Math.max(0, maxAmount)}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Amount" type="number" {...form.register('amount')} />
        <SelectInput
          label="Payment Mode"
          options={[
            { label: 'Cash', value: 'cash' },
            { label: 'Online', value: 'online' },
            { label: 'Cheque', value: 'cheque' },
            { label: 'DD', value: 'dd' },
          ]}
          value={form.watch('mode')}
          onChange={(e) => form.setValue('mode', e.target.value as RecordInvoicePaymentPayload['mode'], { shouldValidate: true })}
        />
        <Input label="Reference ID (optional)" {...form.register('referenceId')} />
      </div>

      {(form.formState.errors.amount?.message || form.formState.errors.mode?.message) && (
        <div className="mt-3 text-sm text-red-600">
          {form.formState.errors.amount?.message ?? form.formState.errors.mode?.message}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button onClick={form.handleSubmit(onSubmit)} isLoading={mutation.isPending}>
          Save Payment
        </Button>
      </div>
    </Card>
  );
}

