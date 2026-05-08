import { Eye, Pencil, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import type { TableColumn } from '@/types';
import type { NoticeRecord } from '../services/noticeboard.service';
import { formatNoticeAudience } from '../services/noticeboard.service';

const CATEGORY_LABEL: Record<string, string> = {
  general: 'General',
  academic: 'Academic',
  event: 'Event',
  urgent: 'Urgent',
};

export function NoticesTable({
  data,
  isLoading = false,
  onView,
  onEdit,
  onPublish,
  onDelete,
}: {
  data: NoticeRecord[];
  isLoading?: boolean;
  onView: (row: NoticeRecord) => void;
  onEdit?: (row: NoticeRecord) => void;
  onPublish?: (row: NoticeRecord) => void;
  onDelete?: (row: NoticeRecord) => void;
}) {
  const columns: TableColumn<NoticeRecord>[] = [
    { key: 'title', header: 'Notice', sortable: true },
    { key: 'category', header: 'Category', render: (_, r) => CATEGORY_LABEL[r.category] ?? r.category },
    { key: 'audience', header: 'Audience', render: (_, r) => formatNoticeAudience(r.audience) },
    { key: 'publishAt', header: 'Publish', render: (_, r) => new Date(r.publishAt).toLocaleDateString('en-IN') },
    { key: 'views', header: 'Views', render: (_, r) => <span className="font-mono text-xs">{r.views}</span> },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search title, category..."
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

