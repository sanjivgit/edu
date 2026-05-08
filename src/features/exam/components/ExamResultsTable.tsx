import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import type { TableColumn } from '@/types';
import type { ExamResultRow } from '../services/exam.service';

export function ExamResultsTable({
  data,
  isLoading = false,
}: {
  data: ExamResultRow[];
  isLoading?: boolean;
}) {
  const columns: TableColumn<ExamResultRow>[] = [
    { key: 'student', header: 'Student', sortable: true },
    { key: 'rollNo', header: 'Roll No', render: (_, r) => <span className="font-mono text-xs">{r.rollNo}</span> },
    { key: 'total', header: 'Total', render: (_, r) => <span className="font-mono text-xs">{r.total}</span> },
    { key: 'grade', header: 'Grade', render: (_, r) => <StatusBadge status={r.grade} /> },
  ];

  return (
    <DataTable columns={columns} data={data} total={data.length} isLoading={isLoading} searchPlaceholder="Search student..." />
  );
}

