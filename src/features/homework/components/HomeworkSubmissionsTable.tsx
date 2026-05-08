import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import type { TableColumn } from '@/types';
import type { HomeworkSubmission } from '../services/homework.service';

export function HomeworkSubmissionsTable({
  data,
  isLoading = false,
}: {
  data: HomeworkSubmission[];
  isLoading?: boolean;
}) {
  const columns: TableColumn<HomeworkSubmission>[] = [
    { key: 'student', header: 'Student', sortable: true },
    { key: 'rollNo', header: 'Roll No', render: (_, r) => <span className="font-mono text-xs">{r.rollNo}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (_, r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'submittedAt',
      header: 'Submitted At',
      render: (_, r) => (r.submittedAt ? new Date(r.submittedAt).toLocaleString('en-IN') : '-'),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search student, roll no..."
    />
  );
}

