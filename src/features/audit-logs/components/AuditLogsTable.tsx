import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import type { TableColumn } from '@/types';
import type { AuditLogRecord } from '../services/auditLogs.service';

export function AuditLogsTable({
  data,
  isLoading = false,
  onView,
}: {
  data: AuditLogRecord[];
  isLoading?: boolean;
  onView: (row: AuditLogRecord) => void;
}) {
  const columns: TableColumn<AuditLogRecord>[] = [
    { key: 'at', header: 'Time', sortable: true, render: (_, r) => new Date(r.at).toLocaleString('en-IN') },
    { key: 'severity', header: 'Severity', render: (_, r) => <StatusBadge status={r.severity} /> },
    { key: 'actor', header: 'Actor', sortable: true },
    { key: 'action', header: 'Action', render: (_, r) => <span className="font-mono text-xs">{r.action}</span> },
    { key: 'module', header: 'Module', render: (_, r) => <span className="font-mono text-xs">{r.module}</span> },
    { key: 'summary', header: 'Summary', render: (_, r) => <span className="text-xs text-muted-foreground">{r.summary}</span> },
    { key: 'ip', header: 'IP', render: (_, r) => <span className="font-mono text-xs">{r.ip}</span> },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search actor, action, module..."
      actions={(row) => (
        <Button size="icon-sm" variant="ghost" onClick={() => onView(row)} title="View">
          <Eye className="h-4 w-4" />
        </Button>
      )}
    />
  );
}

