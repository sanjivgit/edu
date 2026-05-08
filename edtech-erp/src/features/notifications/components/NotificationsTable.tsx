import { Eye, Pencil, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import type { TableColumn } from '@/types';
import type { NotificationRecord } from '../services/notifications.service';
import { formatNotificationAudience } from '../services/notifications.service';

const CHANNEL_LABEL: Record<string, string> = {
  'in-app': 'In-App',
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
};

export function NotificationsTable({
  data,
  isLoading = false,
  onView,
  onEdit,
  onSendNow,
  onDelete,
}: {
  data: NotificationRecord[];
  isLoading?: boolean;
  onView: (row: NotificationRecord) => void;
  onEdit?: (row: NotificationRecord) => void;
  onSendNow?: (row: NotificationRecord) => void;
  onDelete?: (row: NotificationRecord) => void;
}) {
  const columns: TableColumn<NotificationRecord>[] = [
    { key: 'title', header: 'Notification', sortable: true },
    { key: 'channel', header: 'Channel', render: (_, r) => CHANNEL_LABEL[r.channel] ?? r.channel },
    { key: 'priority', header: 'Priority', render: (_, r) => r.priority.toUpperCase() },
    { key: 'audience', header: 'Audience', render: (_, r) => formatNotificationAudience(r) },
    { key: 'scheduleAt', header: 'Schedule', render: (_, r) => (r.scheduleAt ? new Date(r.scheduleAt).toLocaleDateString('en-IN') : '-') },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search title, channel..."
      actions={(row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button size="icon-sm" variant="ghost" onClick={() => onView(row)} title="View">
            <Eye className="h-4 w-4" />
          </Button>
          {onEdit ? <Button size="icon-sm" variant="ghost" onClick={() => onEdit(row)} title="Edit"><Pencil className="h-4 w-4" /></Button> : null}
          {onSendNow ? <Button size="icon-sm" variant="ghost" onClick={() => onSendNow(row)} title="Send now" disabled={row.status === 'sent'}><Send className="h-4 w-4" /></Button> : null}
          {onDelete ? <Button size="icon-sm" variant="ghost" onClick={() => onDelete(row)} title="Delete"><Trash2 className="h-4 w-4" /></Button> : null}
        </div>
      )}
    />
  );
}

