import { Eye, Pencil, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import type { TableColumn } from '@/types';
import type { DiaryEntry } from '../services/diary.service';

const VIS_LABEL: Record<string, string> = {
  students: 'Students',
  parents: 'Parents',
  both: 'Both',
};

export function DiaryTable({
  data,
  isLoading = false,
  onView,
  onEdit,
  onPublish,
  onDelete,
}: {
  data: DiaryEntry[];
  isLoading?: boolean;
  onView: (row: DiaryEntry) => void;
  onEdit?: (row: DiaryEntry) => void;
  onPublish?: (row: DiaryEntry) => void;
  onDelete?: (row: DiaryEntry) => void;
}) {
  const columns: TableColumn<DiaryEntry>[] = [
    { key: 'date', header: 'Date', sortable: true, render: (_, r) => new Date(r.date).toLocaleDateString('en-IN') },
    { key: 'title', header: 'Title', sortable: true },
    { key: 'subject', header: 'Subject', sortable: true },
    { key: 'classId', header: 'Class', render: (_, r) => `Class ${r.classId}-${r.section}` },
    { key: 'author', header: 'Author' },
    { key: 'visibility', header: 'Visibility', render: (_, r) => VIS_LABEL[r.visibility] ?? r.visibility },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search title, subject, author..."
      actions={(row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button size="icon-sm" variant="ghost" onClick={() => onView(row)} title="View">
            <Eye className="h-4 w-4" />
          </Button>
          {onEdit ? <Button size="icon-sm" variant="ghost" onClick={() => onEdit(row)} title="Edit"><Pencil className="h-4 w-4" /></Button> : null}
          {onPublish ? <Button size="icon-sm" variant="ghost" onClick={() => onPublish(row)} title="Publish" disabled={row.status === 'published'}><Send className="h-4 w-4" /></Button> : null}
          {onDelete ? <Button size="icon-sm" variant="ghost" onClick={() => onDelete(row)} title="Delete"><Trash2 className="h-4 w-4" /></Button> : null}
        </div>
      )}
    />
  );
}

