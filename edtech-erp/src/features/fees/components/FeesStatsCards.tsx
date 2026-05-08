import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { StatCard } from '@/components/ui/Card';
import { formatCurrency } from '@/utils';

export function FeesStatsCards({
  totalCollected,
  totalPending,
  totalOverdue,
  isLoading = false,
}: {
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  isLoading?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        label="Total Collected"
        value={formatCurrency(totalCollected)}
        change={8.4}
        changeType="positive"
        icon={<CheckCircle className="h-5 w-5" />}
        iconBg="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        isLoading={isLoading}
      />
      <StatCard
        label="Pending"
        value={formatCurrency(totalPending)}
        change={-3.2}
        changeType="negative"
        icon={<Clock className="h-5 w-5" />}
        iconBg="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        isLoading={isLoading}
      />
      <StatCard
        label="Overdue"
        value={formatCurrency(totalOverdue)}
        change={1.1}
        changeType="negative"
        icon={<AlertCircle className="h-5 w-5" />}
        iconBg="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
        isLoading={isLoading}
      />
    </div>
  );
}

