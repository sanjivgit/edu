import { Edit, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import type { TableColumn } from '@/types';
import type { AcademicYearItem } from '../services/classes.service';

interface Props {
  data: AcademicYearItem[];
  isLoading?: boolean;
  canManage?: boolean;
  onEdit?: (row: AcademicYearItem) => void;
  onDelete?: (row: AcademicYearItem) => void;
}

export function AcademicYearsTable({ data, isLoading = false, canManage, onEdit, onDelete }: Props) {
  const columns: TableColumn<AcademicYearItem>[] = [
    { key: 'name', header: 'Academic Year', sortable: true },
    { key: 'startDate', header: 'Start Date' },
    { key: 'endDate', header: 'End Date' },
    {
      key: 'status',
      header: 'Status',
      render: (_, row) => (
        <StatusBadge status={row.status === 'planned' ? 'inactive' : row.status === 'closed' ? 'pending' : 'active'} />
      ),
    },
    ...(canManage
      ? [
          {
            key: 'actions' as const,
            header: 'Actions',
            render: (_: unknown, row: AcademicYearItem) => (
              <div className="flex items-center gap-1">
                {onEdit ? (
                  <button
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(row);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                ) : null}
                {onDelete ? (
                  <button
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(row);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            ),
          },
        ]
      : []),
  ];
  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search academic year..."
    />
  );
}
