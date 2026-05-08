import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import type { TableColumn } from '@/types';
import type { TeacherRecord } from '../services/teachers.service';

export function TeachersTable({
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: {
  data: TeacherRecord[];
  isLoading?: boolean;
  onView: (row: TeacherRecord) => void;
  onEdit: (row: TeacherRecord) => void;
  onDelete: (row: TeacherRecord) => void;
}) {
  const columns: TableColumn<TeacherRecord>[] = [
    { key: 'fullName', header: 'Teacher', sortable: true },
    { key: 'employeeCode', header: 'Code', render: (_, r) => <span className="font-mono text-xs">{r.employeeCode}</span> },
    { key: 'subject', header: 'Subject' },
    { key: 'phone', header: 'Phone', render: (_, r) => <span className="font-mono text-xs">{r.phone}</span> },
    { key: 'classTeacherOf', header: 'Class Teacher Of', render: (_, r) => r.classTeacherOf || '-' },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadge status={r.status} /> },
  ];
  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search teacher..."
      actions={(row) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="icon-sm" variant="ghost" onClick={() => onView(row)}><Eye className="h-4 w-4" /></Button>
          <Button size="icon-sm" variant="ghost" onClick={() => onEdit(row)}><Pencil className="h-4 w-4" /></Button>
          <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => onDelete(row)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      )}
    />
  );
}

