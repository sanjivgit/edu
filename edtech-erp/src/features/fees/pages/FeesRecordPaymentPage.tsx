import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RecordPaymentForm } from '../components/RecordPaymentForm';
import { useCreateFeeAndRecordPayment, useGetFeeById, useRecordPayment } from '../services/fees.service';

export default function FeesRecordPaymentPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const feeId = params.get('feeId') ?? undefined;

  const feeQuery = useGetFeeById({ feeId });
  const recordPayment = useRecordPayment();
  const createAndPay = useCreateFeeAndRecordPayment();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Record Fee Payment"
        description="Record a payment and generate receipt details"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/fees')}>
            Back to List
          </Button>
        }
      />

      <Card className="p-5">
        <RecordPaymentForm
          initialStudent={feeQuery.data ? `${feeQuery.data.studentName} (${feeQuery.data.rollNo})` : undefined}
          initialAmount={feeQuery.data?.amount}
          isLoading={recordPayment.isPending || createAndPay.isPending}
          onSubmit={(payload) => {
            if (feeId) {
              recordPayment.mutate(
                {
                  feeId,
                  paymentMode: payload.paymentMode,
                  paymentDate: payload.paymentDate,
                  referenceId: payload.referenceId || undefined,
                  amount: payload.amount,
                },
                { onSuccess: (updated) => navigate(`/fees/${updated.id}`) }
              );
              return;
            }
            createAndPay.mutate(
              {
                student: payload.student,
                feeType: payload.feeType,
                amount: payload.amount,
                paymentMode: payload.paymentMode,
                paymentDate: payload.paymentDate,
                referenceId: payload.referenceId || undefined,
              },
              { onSuccess: (created) => navigate(`/fees/${created.id}`) }
            );
          }}
        />
      </Card>
    </div>
  );
}

