import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import type { TableColumn } from '@/types';
import type { TransportRoute } from '../services/transport.service';

export function RoutesTable({
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: {
  data: TransportRoute[];
  isLoading?: boolean;
  onView: (row: TransportRoute) => void;
  onEdit?: (row: TransportRoute) => void;
  onDelete?: (row: TransportRoute) => void;
}) {
  const columns: TableColumn<TransportRoute>[] = [
    { key: 'name', header: 'Route', sortable: true },
    { key: 'vehicleNo', header: 'Vehicle', render: (_, r) => <span className="font-mono text-xs">{r.vehicleNo}</span> },
    { key: 'driverName', header: 'Driver' },
    { key: 'startsAt', header: 'Start', render: (_, r) => <span className="font-mono text-xs">{r.startsAt}</span> },
    { key: 'stops', header: 'Stops', render: (_, r) => <span className="font-mono text-xs">{r.stops.length}</span> },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search route, vehicle, driver..."
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

