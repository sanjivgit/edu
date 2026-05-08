import { CreditCard, Eye } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import type { TableColumn } from '@/types';
import { formatCurrency } from '@/utils';
import type { FeeRecord } from '../services/fees.service';

export function FeesTable({
  data,
  isLoading = false,
  onView,
  onPay,
}: {
  data: FeeRecord[];
  isLoading?: boolean;
  onView: (row: FeeRecord) => void;
  onPay: (row: FeeRecord) => void;
}) {
  const columns: TableColumn<FeeRecord>[] = [
    { key: 'receiptNo', header: 'Receipt/ID', render: (_, r) => <span className="font-mono text-xs text-primary">{r.receiptNo ?? r.id}</span> },
    {
      key: 'studentName',
      header: 'Student',
      sortable: true,
      render: (_, r) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={r.studentName} size="sm" />
          <div>
            <p className="font-medium text-sm">{r.studentName}</p>
            <p className="text-xs text-muted-foreground">
              {r.rollNo} · {r.className}
            </p>
          </div>
        </div>
      ),
    },
    { key: 'feeType', header: 'Fee Type', sortable: true, render: (_, r) => r.feeType.toUpperCase() },
    { key: 'amount', header: 'Amount', sortable: true, align: 'right', render: (_, r) => <span className="font-semibold">{formatCurrency(r.amount)}</span> },
    { key: 'dueDate', header: 'Due Date', render: (_, r) => new Date(r.dueDate).toLocaleDateString('en-IN') },
    { key: 'paidDate', header: 'Paid Date', render: (_, r) => (r.paidDate ? new Date(r.paidDate).toLocaleDateString('en-IN') : '—') },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search by student, receipt..."
      actions={(row) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="icon-sm" variant="ghost" onClick={() => onView(row)} title="View">
            <Eye className="h-4 w-4" />
          </Button>
          {row.status !== 'paid' && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onPay(row)}>
              <CreditCard className="h-3 w-3 mr-1" /> Pay Now
            </Button>
          )}
        </div>
      )}
    />
  );
}

