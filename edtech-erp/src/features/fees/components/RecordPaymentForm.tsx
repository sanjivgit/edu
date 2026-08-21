import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, SelectInput } from '@/components/ui/Input';
import { useToast } from '@/hooks';
import { recordPaymentSchema, type RecordPaymentPayload } from '../validations/fees.schema';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name?: string; email?: string; contact?: string };
  theme: { color: string };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: { error: { description: string } }) => void) => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RecordPaymentForm({
  initialStudent,
  initialAmount,
  initialStudentName,
  onSubmit,
  isLoading = false,
}: {
  initialStudent?: string;
  initialAmount?: number;
  initialStudentName?: string;
  onSubmit: (payload: RecordPaymentPayload) => void;
  isLoading?: boolean;
}) {
  const { error: showError } = useToast();
  const [razorpayLoading, setRazorpayLoading] = useState(false);

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

  const paymentMode = form.watch('paymentMode');

  const handleRazorpayPayment = async () => {
    if (!RAZORPAY_KEY) {
      showError('Razorpay key not configured. Add VITE_RAZORPAY_KEY_ID to your environment.');
      return;
    }

    const values = form.getValues();
    if (!values.student || values.amount <= 0) {
      form.trigger(['student', 'amount']);
      return;
    }

    setRazorpayLoading(true);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      showError('Failed to load Razorpay SDK. Check your internet connection.');
      setRazorpayLoading(false);
      return;
    }

    const amountPaise = Math.round(values.amount * 100);

    const options: RazorpayOptions = {
      key: RAZORPAY_KEY,
      amount: amountPaise,
      currency: 'INR',
      name: 'School ERP',
      description: `${values.feeType} fee - ${values.student}`,
      handler: (response: RazorpayResponse) => {
        form.setValue('paymentMode', 'online');
        form.setValue('referenceId', response.razorpay_payment_id);
        onSubmit({
          ...values,
          paymentMode: 'online',
          referenceId: response.razorpay_payment_id,
        });
        setRazorpayLoading(false);
      },
      prefill: {
        name: initialStudentName || values.student,
      },
      theme: { color: '#6366f1' },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response: { error: { description: string } }) => {
      showError(`Payment failed: ${response.error.description}`);
      setRazorpayLoading(false);
    });
    rzp.open();
  };

  return (
    <div className="space-y-4">
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
            { label: 'Razorpay', value: 'razorpay' },
          ]}
          value={paymentMode}
          onChange={(e) => form.setValue('paymentMode', e.target.value as RecordPaymentPayload['paymentMode'])}
          error={form.formState.errors.paymentMode?.message}
        />
        <Input label="Payment Date" type="date" required {...form.register('paymentDate')} error={form.formState.errors.paymentDate?.message} />
        {paymentMode !== 'razorpay' && (
          <Input label="Reference / Transaction ID" placeholder="Optional" {...form.register('referenceId')} error={form.formState.errors.referenceId?.message} />
        )}
        {paymentMode === 'razorpay' && (
          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            Click "Pay with Razorpay" below to open the payment gateway. The transaction ID will be recorded automatically.
          </div>
        )}
        <div className="flex justify-end gap-2">
          {paymentMode === 'razorpay' ? (
            <Button type="button" onClick={handleRazorpayPayment} isLoading={razorpayLoading} leftIcon={<CreditCard className="h-4 w-4" />}>
              Pay with Razorpay
            </Button>
          ) : (
            <Button type="submit" isLoading={isLoading}>
              Record Payment
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
