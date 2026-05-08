import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import type { TableColumn } from '@/types';
import type { AssessmentResultRow } from '../services/assessment.service';

export function AssessmentResultsTable({
  data,
  isLoading = false,
}: {
  data: AssessmentResultRow[];
  isLoading?: boolean;
}) {
  const columns: TableColumn<AssessmentResultRow>[] = [
    { key: 'student', header: 'Student', sortable: true },
    { key: 'rollNo', header: 'Roll No', render: (_, r) => <span className="font-mono text-xs">{r.rollNo}</span> },
    { key: 'marks', header: 'Marks', render: (_, r) => <span className="font-mono text-xs">{r.marks}</span> },
    { key: 'grade', header: 'Grade', render: (_, r) => <StatusBadge status={r.grade} /> },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search student..."
    />
  );
}

