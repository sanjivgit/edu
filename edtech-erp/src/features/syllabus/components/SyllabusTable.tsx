import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import type { TableColumn } from '@/types';
import type { SyllabusRecord } from '../services/syllabus.service';

const TERM_LABEL: Record<string, string> = {
  'term-1': 'Term 1',
  'term-2': 'Term 2',
  final: 'Final',
};

export function SyllabusTable({
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: {
  data: SyllabusRecord[];
  isLoading?: boolean;
  onView: (row: SyllabusRecord) => void;
  onEdit?: (row: SyllabusRecord) => void;
  onDelete?: (row: SyllabusRecord) => void;
}) {
  const columns: TableColumn<SyllabusRecord>[] = [
    { key: 'title', header: 'Syllabus', sortable: true },
    { key: 'classId', header: 'Class', render: (_, r) => `Class ${r.classId}-${r.section}` },
    { key: 'subject', header: 'Subject', sortable: true },
    { key: 'term', header: 'Term', render: (_, r) => TERM_LABEL[r.term] ?? r.term },
    { key: 'attachments', header: 'Files', render: (_, r) => <span className="font-mono text-xs">{r.attachments.length}</span> },
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

