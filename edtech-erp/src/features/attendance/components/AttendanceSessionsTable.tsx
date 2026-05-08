import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import type { TableColumn } from '@/types';
import type { AttendanceSession } from '../services/attendance.service';

function countStatuses(entries: AttendanceSession['entries']) {
  return entries.reduce(
    (acc, e) => {
      acc[e.status] += 1;
      return acc;
    },
    { present: 0, absent: 0, late: 0 }
  );
}

export function AttendanceSessionsTable({
  data,
  isLoading = false,
  onView,
}: {
  data: AttendanceSession[];
  isLoading?: boolean;
  onView: (session: AttendanceSession) => void;
}) {
  const columns: TableColumn<AttendanceSession>[] = [
    { key: 'date', header: 'Date', sortable: true, render: (_, r) => new Date(r.date).toLocaleDateString('en-IN') },
    { key: 'classId', header: 'Class', render: (_, r) => `Class ${r.classId}` },
    { key: 'section', header: 'Section' },
    {
      key: 'entries',
      header: 'Summary',
      render: (_, r) => {
        const c = countStatuses(r.entries);
        return (
          <span className="text-xs text-muted-foreground">
            <span className="text-emerald-600 font-medium">{c.present} P</span>
            {' · '}
            <span className="text-red-600 font-medium">{c.absent} A</span>
            {' · '}
            <span className="text-amber-600 font-medium">{c.late} L</span>
          </span>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search by date, class, section..."
      actions={(row) => (
        <Button size="icon-sm" variant="ghost" onClick={() => onView(row)} title="View session">
          <Eye className="h-4 w-4" />
        </Button>
      )}
    />
  );
}

