import { StatCard } from '@/components/ui/Card';
import { BarChart3, ClipboardCheck, IndianRupee, UserPlus } from 'lucide-react';

export function ReportsStatsCards({
  totalStudents,
  avgAttendance,
  totalCollected,
  newAdmissions,
  isLoading = false,
}: {
  totalStudents: number;
  avgAttendance: number;
  totalCollected: number;
  newAdmissions: number;
  isLoading?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Students"
        value={totalStudents}
        icon={<BarChart3 className="h-5 w-5" />}
        iconBg="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        isLoading={isLoading}
      />
      <StatCard
        label="Avg Attendance"
        value={`${avgAttendance}%`}
        icon={<ClipboardCheck className="h-5 w-5" />}
        iconBg="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        isLoading={isLoading}
      />
      <StatCard
        label="Fees Collected"
        value={`₹${totalCollected}`}
        icon={<IndianRupee className="h-5 w-5" />}
        iconBg="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        isLoading={isLoading}
      />
      <StatCard
        label="New Admissions"
        value={newAdmissions}
        icon={<UserPlus className="h-5 w-5" />}
        iconBg="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
        isLoading={isLoading}
      />
    </div>
  );
}

