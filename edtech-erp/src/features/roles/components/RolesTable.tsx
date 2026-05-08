import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import type { TableColumn } from '@/types';
import type { RoleRecord } from '../services/roles.service';

export function RolesTable({
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: {
  data: RoleRecord[];
  isLoading?: boolean;
  onView: (row: RoleRecord) => void;
  onEdit: (row: RoleRecord) => void;
  onDelete: (row: RoleRecord) => void;
}) {
  const columns: TableColumn<RoleRecord>[] = [
    { key: 'name', header: 'Role', sortable: true },
    { key: 'description', header: 'Description', render: (_, r) => <span className="text-xs text-muted-foreground">{r.description ?? '-'}</span> },
    { key: 'permissions', header: 'Modules', render: (_, r) => <span className="font-mono text-xs">{r.permissions.length}</span> },
    { key: 'isActive', header: 'Status', render: (_, r) => <StatusBadge status={r.isActive ? 'active' : 'inactive'} /> },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search role..."
      actions={(row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button size="icon-sm" variant="ghost" onClick={() => onView(row)} title="View">
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={() => onEdit(row)} title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={() => onDelete(row)} title="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    />
  );
}

