import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import type { TableColumn } from '@/types';
import type { HomeworkRecord } from '../services/homework.service';

export function HomeworkTable({
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: {
  data: HomeworkRecord[];
  isLoading?: boolean;
  onView: (row: HomeworkRecord) => void;
  onEdit?: (row: HomeworkRecord) => void;
  onDelete?: (row: HomeworkRecord) => void;
}) {
  const columns: TableColumn<HomeworkRecord>[] = [
    { key: 'title', header: 'Homework', sortable: true },
    { key: 'subject', header: 'Subject', sortable: true },
    { key: 'classId', header: 'Class', render: (_, r) => `Class ${r.classId}-${r.section}` },
    { key: 'assignedDate', header: 'Assigned', render: (_, r) => new Date(r.assignedDate).toLocaleDateString('en-IN') },
    { key: 'dueDate', header: 'Due', render: (_, r) => new Date(r.dueDate).toLocaleDateString('en-IN') },
    {
      key: 'status',
      header: 'Status',
      render: (_, r) => <StatusBadge status={r.status} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search title, subject..."
      actions={(row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button size="icon-sm" variant="ghost" onClick={() => onView(row)} title="View">
            <Eye className="h-4 w-4" />
          </Button>
          {onEdit ? <Button size="icon-sm" variant="ghost" onClick={() => onEdit(row)} title="Edit"><Pencil className="h-4 w-4" /></Button> : null}
          {onDelete ? <Button size="icon-sm" variant="ghost" onClick={() => onDelete(row)} title="Delete"><Trash2 className="h-4 w-4" /></Button> : null}
        </div>
      )}
    />
  );
}

