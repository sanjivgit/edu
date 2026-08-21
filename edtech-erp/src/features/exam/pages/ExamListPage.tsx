import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks';
import { useGetAcademicYears } from '@/features/classes/services/classes.service';
import { ExamsTable } from '../components/ExamsTable';
import { useDeleteExam, useGetExams } from '../services/exam.service';

export default function ExamListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'teacher';
  const listQuery = useGetExams();
  const deleteMutation = useDeleteExam();
  const { data: academicYears = [] } = useGetAcademicYears();
  const allData = listQuery.data ?? [];

  const [academicYearFilter, setAcademicYearFilter] = useState('');

  const data = useMemo(() => {
    return allData.filter((row) => {
      if (academicYearFilter && row.academicYearId !== academicYearFilter) return false;
      return true;
    });
  }, [allData, academicYearFilter]);

  const selectClass = 'rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Management"
        description="Schedule and manage examinations"
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/exam/create')} disabled={!canEdit}>
            Schedule Exam
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Academic Year</span>
          <select className={selectClass} value={academicYearFilter} onChange={(e) => setAcademicYearFilter(e.target.value)}>
            <option value="">All Years</option>
            {academicYears.map((y) => (
              <option key={y.id} value={y.id}>{y.name}</option>
            ))}
          </select>
        </label>
      </div>

      <ExamsTable
        data={data}
        isLoading={listQuery.isLoading}
        onView={(row) => navigate(`/exam/${row.id}`)}
        onEdit={canEdit ? (row) => navigate(`/exam/${row.id}/edit`) : undefined}
        onDelete={canEdit ? (row) => deleteMutation.mutate({ id: row.id }) : undefined}
      />
    </div>
  );
}

