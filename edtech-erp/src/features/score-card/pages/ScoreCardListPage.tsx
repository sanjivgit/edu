import { ClipboardCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks';
import { useGetAcademicYears } from '@/features/classes/services/classes.service';
import { useGetExams } from '@/features/exam/services/exam.service';
import type { TableColumn } from '@/types';
import type { ExamRecord } from '@/features/exam/services/exam.service';

const TERM_LABEL: Record<string, string> = {
  'term-1': 'Term 1',
  'term-2': 'Term 2',
  final: 'Final',
};

export default function ScoreCardListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'teacher';

  const examsQuery = useGetExams();
  const { data: academicYears = [] } = useGetAcademicYears();
  const allExams = examsQuery.data ?? [];

  const [academicYearFilter, setAcademicYearFilter] = useState('');

  const data = useMemo(() => {
    return allExams.filter((row) => {
      if (academicYearFilter && row.academicYearId !== academicYearFilter) return false;
      return true;
    });
  }, [allExams, academicYearFilter]);

  const columns: TableColumn<ExamRecord>[] = [
    { key: 'name', header: 'Exam Name', sortable: true },
    { key: 'term', header: 'Term', render: (_, r) => TERM_LABEL[r.term] ?? r.term },
    { key: 'classId', header: 'Class', render: (_, r) => `Class ${r.classId}-${r.section}` },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadge status={r.status} /> },
    { key: 'papers', header: 'Papers', render: (_, r) => <span className="font-mono text-xs">{r.papers.length}</span> },
  ];

  const selectClass = 'rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Score Cards"
        description="Manage exam scores and publish results"
      />

      <DataTable
        columns={columns}
        data={data}
        total={data.length}
        isLoading={examsQuery.isLoading}
        searchPlaceholder="Search exam name..."
        filterBar={
          <select className={selectClass} value={academicYearFilter} onChange={(e) => setAcademicYearFilter(e.target.value)}>
            <option value="">All Years</option>
            {academicYears.map((y) => (
              <option key={y.id} value={y.id}>{y.name}</option>
            ))}
          </select>
        }
        actions={(row) =>
          canManage ? (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<ClipboardCheck className="h-4 w-4" />}
              onClick={() => navigate(`/score-cards/exam/${row.id}`)}
            >
              Manage Scores
            </Button>
          ) : null
        }
      />
    </div>
  );
}
