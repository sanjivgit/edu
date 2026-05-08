import { CheckCircle, Eye, Pencil, Trash2, XCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import type { TableColumn } from '@/types';
import type { AdmissionRecord, AdmissionStatus } from '../services/admission.service';

interface AdmissionTableProps {
  data: AdmissionRecord[];
  isLoading?: boolean;
  onView: (item: AdmissionRecord) => void;
  onEdit: (item: AdmissionRecord) => void;
  onDelete: (item: AdmissionRecord) => void;
  onStatusUpdate: (item: AdmissionRecord, status: AdmissionStatus) => void;
}

export function AdmissionTable({
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  onStatusUpdate,
}: AdmissionTableProps) {
  const columns: TableColumn<AdmissionRecord>[] = [
    { key: 'id', header: 'Appl. No', render: (_, row) => <span className="font-mono text-xs font-medium text-primary">{row.id}</span> },
    {
      key: 'name',
      header: 'Applicant',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={`${row.firstName} ${row.lastName}`} size="sm" />
          <div>
            <p className="font-medium text-sm">{row.firstName} {row.lastName}</p>
            <p className="text-xs text-muted-foreground">{row.parentEmail || 'No email'}</p>
          </div>
        </div>
      ),
    },
    { key: 'classApplyingFor', header: 'Class', sortable: true },
    { key: 'parentPhone', header: 'Parent Phone' },
    { key: 'fatherName', header: 'Parent/Guardian' },
    { key: 'appliedDate', header: 'Applied', sortable: true, render: (_, row) => new Date(row.appliedDate).toLocaleDateString('en-IN') },
    { key: 'status', header: 'Status', render: (_, row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search applicants..."
      actions={(row) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="icon-sm" variant="ghost" onClick={() => onView(row)} title="View">
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={() => onEdit(row)} title="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {row.status === 'pending' && (
            <>
              <Button size="icon-sm" variant="ghost" className="text-emerald-600" onClick={() => onStatusUpdate(row, 'approved')} title="Approve">
                <CheckCircle className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon-sm" variant="ghost" className="text-red-600" onClick={() => onStatusUpdate(row, 'rejected')} title="Reject">
                <XCircle className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => onDelete(row)} title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    />
  );
}
