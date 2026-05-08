import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import type { TableColumn } from '@/types';
import type { InvoiceRecord } from '../services/invoice.service';
import { getInvoiceTotals } from '../services/invoice.service';

export function InvoiceTable({
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: {
  data: InvoiceRecord[];
  isLoading?: boolean;
  onView: (row: InvoiceRecord) => void;
  onEdit: (row: InvoiceRecord) => void;
  onDelete: (row: InvoiceRecord) => void;
}) {
  const columns: TableColumn<InvoiceRecord>[] = [
    { key: 'invoiceNo', header: 'Invoice No', sortable: true },
    { key: 'student', header: 'Student', sortable: true },
    { key: 'classId', header: 'Class', render: (_, r) => `Class ${r.classId}-${r.section}` },
    { key: 'issueDate', header: 'Issue', render: (_, r) => new Date(r.issueDate).toLocaleDateString('en-IN') },
    { key: 'dueDate', header: 'Due', render: (_, r) => new Date(r.dueDate).toLocaleDateString('en-IN') },
    {
      key: 'status',
      header: 'Status',
      render: (_, r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'items',
      header: 'Total',
      render: (_, r) => {
        const t = getInvoiceTotals(r);
        return <span className="font-mono text-xs">₹{t.total}</span>;
      },
    },
    {
      key: 'paidAmount',
      header: 'Balance',
      render: (_, r) => {
        const t = getInvoiceTotals(r);
        return <span className="font-mono text-xs">₹{t.balance}</span>;
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search invoice no, student..."
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

