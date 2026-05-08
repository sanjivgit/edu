import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import type { TableColumn } from '@/types';
import type { SubjectRecord } from '../services/subjects.service';

const CATEGORY_LABEL: Record<string, string> = {
  core: 'Core',
  language: 'Language',
  elective: 'Elective',
  lab: 'Lab',
  sports: 'Sports',
  arts: 'Arts',
};

export function SubjectsTable({
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: {
  data: SubjectRecord[];
  isLoading?: boolean;
  onView: (row: SubjectRecord) => void;
  onEdit?: (row: SubjectRecord) => void;
  onDelete?: (row: SubjectRecord) => void;
}) {
  const columns: TableColumn<SubjectRecord>[] = [
    { key: 'name', header: 'Subject', sortable: true },
    { key: 'code', header: 'Code', sortable: true, render: (_, r) => <span className="font-mono text-xs">{r.code}</span> },
    { key: 'category', header: 'Category', render: (_, r) => CATEGORY_LABEL[r.category] ?? r.category },
    { key: 'classId', header: 'Class', render: (_, r) => `Class ${r.classId}` },
    { key: 'weeklyPeriods', header: 'Weekly Periods', render: (_, r) => <span className="font-mono text-xs">{r.weeklyPeriods}</span> },
    { key: 'teacher', header: 'Teacher' },
    {
      key: 'isActive',
      header: 'Status',
      render: (_, r) => <StatusBadge status={r.isActive ? 'active' : 'inactive'} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search subject, code, teacher..."
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

