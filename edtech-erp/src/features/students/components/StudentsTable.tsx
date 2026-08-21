import { Eye, Pencil, Trash2, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import type { TableColumn } from '@/types';
import type { StudentRecord } from '../services/students.service';

export function StudentsTable({
  data,
  isLoading = false,
  canPromote = false,
  selectedIds = [],
  onToggleSelect,
  onView,
  onEdit,
  onDelete,
  onPromote,
}: {
  data: StudentRecord[];
  isLoading?: boolean;
  canPromote?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onView: (row: StudentRecord) => void;
  onEdit: (row: StudentRecord) => void;
  onDelete: (row: StudentRecord) => void;
  onPromote?: (row: StudentRecord) => void;
}) {
  const columns: TableColumn<StudentRecord>[] = [
    ...(canPromote && onToggleSelect
      ? [
          {
            key: '_select' as const,
            header: ' ',
            render: (_: unknown, row: StudentRecord) => (
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={selectedIds.includes(row.id)}
                onChange={() => onToggleSelect(row.id)}
              />
            ),
          },
        ]
      : []),
    { key: 'rollNo', header: 'Roll No', sortable: true, render: (_, r) => <span className="font-mono text-xs">{r.rollNo}</span> },
    { key: 'name', header: 'Student', sortable: true },
    {
      key: 'classId',
      header: 'Class',
      render: (_, r) => `Class ${r.classId}${r.section ? `-${r.section}` : ''}`,
    },
    { key: 'gender', header: 'Gender', render: (_, r) => (r.gender ? r.gender.charAt(0).toUpperCase() + r.gender.slice(1) : '-') },
    { key: 'phone', header: 'Phone', render: (_, r) => (r.phone ? <span className="font-mono text-xs">{r.phone}</span> : '-') },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search student, roll no..."
      actions={(row) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="icon-sm" variant="ghost" onClick={() => onView(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={() => onEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          {canPromote && onPromote && row.status === 'active' && (
            <Button size="icon-sm" variant="ghost" onClick={() => onPromote(row)} title="Promote student">
              <GraduationCap className="h-4 w-4" />
            </Button>
          )}
          <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => onDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    />
  );
}
