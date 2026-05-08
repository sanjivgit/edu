import { Download, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useMemo } from 'react';
import { FeesStatsCards } from '../components/FeesStatsCards';
import { FeesTable } from '../components/FeesTable';
import { useGetFees, type FeeRecord } from '../services/fees.service';

export default function FeesListPage() {
  const navigate = useNavigate();
  const feesQuery = useGetFees();
  const fees = feesQuery.data ?? [];

  const totals = useMemo(() => {
    const totalCollected = fees.filter((f) => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
    const totalPending = fees.filter((f) => f.status === 'pending').reduce((s, f) => s + f.amount, 0);
    const totalOverdue = fees.filter((f) => f.status === 'overdue').reduce((s, f) => s + f.amount, 0);
    return { totalCollected, totalPending, totalOverdue };
  }, [fees]);

  const goToPay = (row: FeeRecord) => {
    navigate(`/fees/record-payment?feeId=${encodeURIComponent(row.id)}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Management"
        description="Track and manage student fee collection"
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
              Export
            </Button>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/fees/record-payment')}>
              Record Payment
            </Button>
          </>
        }
      />

      <FeesStatsCards {...totals} isLoading={feesQuery.isLoading} />

      <FeesTable
        data={fees}
        isLoading={feesQuery.isLoading}
        onView={(row) => navigate(`/fees/${row.id}`)}
        onPay={goToPay}
      />
    </div>
  );
}

