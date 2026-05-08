import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import type { TableColumn } from '@/types';
import type { HolidayRecord } from '../services/holidays.service';

const TYPE_LABEL: Record<string, string> = {
  holiday: 'Holiday',
  event: 'Event',
  exam: 'Exam',
  closure: 'Closure',
};

export function HolidaysTable({
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: {
  data: HolidayRecord[];
  isLoading?: boolean;
  onView: (row: HolidayRecord) => void;
  onEdit: (row: HolidayRecord) => void;
  onDelete: (row: HolidayRecord) => void;
}) {
  const columns: TableColumn<HolidayRecord>[] = [
    { key: 'title', header: 'Holiday / Event', sortable: true },
    { key: 'type', header: 'Type', render: (_, r) => TYPE_LABEL[r.type] ?? r.type },
    { key: 'startDate', header: 'Start', render: (_, r) => new Date(r.startDate).toLocaleDateString('en-IN') },
    { key: 'endDate', header: 'End', render: (_, r) => new Date(r.endDate).toLocaleDateString('en-IN') },
    { key: 'appliesTo', header: 'Applies To', render: (_, r) => r.appliesTo.toUpperCase() },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search title, type..."
      actions={(row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button size="icon-sm" variant="ghost" onClick={() => onView(row)} title="View">
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={() => onEdit(row)} title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={() => onDelete(row)} title="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    />
  );
}

