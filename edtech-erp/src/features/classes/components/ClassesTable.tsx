import { Eye, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import type { TableColumn } from '@/types';
import type { ClassItem } from '../services/classes.service';

interface ClassesTableProps {
  data: ClassItem[];
  isLoading?: boolean;
  onView: (row: ClassItem) => void;
  onEdit?: (row: ClassItem) => void;
  onDelete?: (row: ClassItem) => void;
}

export function ClassesTable({
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: ClassesTableProps) {
  const columns: TableColumn<ClassItem>[] = [
    { key: 'name', header: 'Class', sortable: true, render: (_, row) => <span className="font-medium">{row.name}</span> },
    { key: 'code', header: 'Code' },
    { key: 'classTeacher', header: 'Class Teacher', sortable: true },
    { key: 'sections', header: 'Sections', align: 'center' },
    { key: 'students', header: 'Students', align: 'center' },
    { key: 'capacity', header: 'Capacity', align: 'center' },
    { key: 'status', header: 'Status', render: (_, row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search classes..."
      actions={(row) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="icon-sm" variant="ghost" onClick={() => onView(row)} title="View">
            <Eye className="h-4 w-4" />
          </Button>
          {onEdit ? <Button size="icon-sm" variant="ghost" onClick={() => onEdit(row)} title="Edit"><Pencil className="h-4 w-4" /></Button> : null}
          {onDelete ? <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => onDelete(row)} title="Delete"><Trash2 className="h-4 w-4" /></Button> : null}
        </div>
      )}
    />
  );
}
