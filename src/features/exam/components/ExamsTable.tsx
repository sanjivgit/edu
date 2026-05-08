import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import type { TableColumn } from '@/types';
import type { ExamRecord } from '../services/exam.service';

const TERM_LABEL: Record<string, string> = {
  'term-1': 'Term 1',
  'term-2': 'Term 2',
  final: 'Final',
};

export function ExamsTable({
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: {
  data: ExamRecord[];
  isLoading?: boolean;
  onView: (row: ExamRecord) => void;
  onEdit?: (row: ExamRecord) => void;
  onDelete?: (row: ExamRecord) => void;
}) {
  const columns: TableColumn<ExamRecord>[] = [
    { key: 'name', header: 'Exam', sortable: true },
    { key: 'term', header: 'Term', render: (_, r) => TERM_LABEL[r.term] ?? r.term },
    { key: 'classId', header: 'Class', render: (_, r) => `Class ${r.classId}-${r.section}` },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadge status={r.status} /> },
    { key: 'papers', header: 'Papers', render: (_, r) => <span className="font-mono text-xs">{r.papers.length}</span> },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search exam name..."
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

