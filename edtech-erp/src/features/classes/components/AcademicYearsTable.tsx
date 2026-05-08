import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import type { TableColumn } from '@/types';
import type { AcademicYearItem } from '../services/classes.service';

export function AcademicYearsTable({ data, isLoading = false }: { data: AcademicYearItem[]; isLoading?: boolean }) {
  const columns: TableColumn<AcademicYearItem>[] = [
    { key: 'name', header: 'Academic Year', sortable: true },
    { key: 'startDate', header: 'Start Date' },
    { key: 'endDate', header: 'End Date' },
    { key: 'status', header: 'Status', render: (_, row) => <StatusBadge status={row.status === 'planned' ? 'inactive' : row.status === 'closed' ? 'pending' : 'active'} /> },
  ];
  return <DataTable columns={columns} data={data} total={data.length} isLoading={isLoading} searchPlaceholder="Search academic year..." />;
}

