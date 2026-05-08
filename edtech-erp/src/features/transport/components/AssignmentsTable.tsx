import { DataTable } from '@/components/ui/DataTable';
import type { TableColumn } from '@/types';
import type { RouteAssignment } from '../services/transport.service';

export function AssignmentsTable({
  data,
  isLoading = false,
}: {
  data: RouteAssignment[];
  isLoading?: boolean;
}) {
  const columns: TableColumn<RouteAssignment>[] = [
    { key: 'student', header: 'Student', sortable: true },
    { key: 'rollNo', header: 'Roll No', render: (_, r) => <span className="font-mono text-xs">{r.rollNo}</span> },
    { key: 'classId', header: 'Class', render: (_, r) => `Class ${r.classId}-${r.section}` },
    { key: 'stopName', header: 'Stop' },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      isLoading={isLoading}
      searchPlaceholder="Search student, stop..."
    />
  );
}

