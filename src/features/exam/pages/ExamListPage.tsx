import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks';
import { ExamsTable } from '../components/ExamsTable';
import { useDeleteExam, useGetExams } from '../services/exam.service';

export default function ExamListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'teacher';
  const listQuery = useGetExams();
  const deleteMutation = useDeleteExam();
  const data = listQuery.data ?? [];

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

