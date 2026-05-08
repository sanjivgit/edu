import { ArrowLeft } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils';
import { useGetFeeById } from '../services/fees.service';

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value ?? '—'}</p>
    </div>
  );
}

export default function FeeDetailPage() {
  const navigate = useNavigate();
  const { feeId } = useParams();
  const feeQuery = useGetFeeById({ feeId });

  if (!feeId) return <Navigate to="/fees" replace />;
  if (!feeQuery.isLoading && !feeQuery.data) return <Navigate to="/fees" replace />;
  const fee = feeQuery.data;
  if (!fee) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Receipt — ${fee.receiptNo ?? fee.id}`}
        description={`${fee.studentName} · ${fee.rollNo} · ${fee.className}`}
        badge={<StatusBadge status={fee.status} />}
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/fees')}>
            Back to List
          </Button>
        }
      />

      <Card className="p-5 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Fee Type" value={fee.feeType.toUpperCase()} />
          <Field label="Amount" value={formatCurrency(fee.amount)} />
          <Field label="Due Date" value={new Date(fee.dueDate).toLocaleDateString('en-IN')} />
          <Field label="Paid Date" value={fee.paidDate ? new Date(fee.paidDate).toLocaleDateString('en-IN') : '—'} />
          <Field label="Payment Mode" value={fee.paymentMode?.toUpperCase() ?? '—'} />
          <Field label="Reference ID" value={fee.referenceId ?? '—'} />
        </div>
      </Card>
    </div>
  );
}

