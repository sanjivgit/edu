import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import type { TableColumn } from '@/types';
import type { AssessmentRecord } from '../services/assessment.service';

export function AssessmentsTable({
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: {
  data: AssessmentRecord[];
  isLoading?: boolean;
  onView: (row: AssessmentRecord) => void;
  onEdit?: (row: AssessmentRecord) => void;
  onDelete?: (row: AssessmentRecord) => void;
}) {
  const columns: TableColumn<AssessmentRecord>[] = [
    { key: 'title', header: 'Assessment', sortable: true },
    { key: 'type', header: 'Type', render: (_, r) => r.type.replace('-', ' ') },
    { key: 'classId', header: 'Class', render: (_, r) => `Class ${r.classId}-${r.section}` },
    { key: 'subject', header: 'Subject', sortable: true },
    { key: 'date', header: 'Date', render: (_, r) => new Date(r.date).toLocaleDateString('en-IN') },
    { key: 'totalMarks', header: 'Marks', render: (_, r) => <span className="font-mono text-xs">{r.totalMarks}</span> },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadge status={r.status} /> },
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

