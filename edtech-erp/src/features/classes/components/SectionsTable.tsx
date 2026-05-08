import { Eye, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import type { TableColumn } from '@/types';
import type { SectionItem } from '../services/classes.service';

interface SectionsTableProps {
  data: SectionItem[];
  isLoading?: boolean;
  onView: (row: SectionItem) => void;
  onEdit?: (row: SectionItem) => void;
  onDelete?: (row: SectionItem) => void;
}

export function SectionsTable({
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: SectionsTableProps) {
  const columns: TableColumn<SectionItem>[] = [
    { key: 'className', header: 'Class', sortable: true },
    { key: 'name', header: 'Section', sortable: true, render: (_, row) => <span className="font-medium">Section {row.name}</span> },
    { key: 'roomNo', header: 'Room No' },
    { key: 'sectionTeacher', header: 'Section Teacher', sortable: true },
    { key: 'students', header: 'Students', align: 'center' },
    { key: 'status', header: 'Status', render: (_, row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search sections..."
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
