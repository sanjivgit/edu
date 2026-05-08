import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { StatCard } from '@/components/ui/Card';

export function AttendanceStatsCards({
  present,
  absent,
  late,
  isLoading = false,
}: {
  present: number;
  absent: number;
  late: number;
  isLoading?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        label="Present"
        value={present}
        icon={<CheckCircle className="h-5 w-5" />}
        iconBg="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        isLoading={isLoading}
      />
      <StatCard
        label="Absent"
        value={absent}
        icon={<XCircle className="h-5 w-5" />}
        iconBg="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
        isLoading={isLoading}
      />
      <StatCard
        label="Late"
        value={late}
        icon={<Clock className="h-5 w-5" />}
        iconBg="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        isLoading={isLoading}
      />
    </div>
  );
}

