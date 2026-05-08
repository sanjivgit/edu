import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks';
import { AssessmentsTable } from '../components/AssessmentsTable';
import { useDeleteAssessment, useGetAssessments } from '../services/assessment.service';

export default function AssessmentListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'teacher';
  const listQuery = useGetAssessments();
  const deleteMutation = useDeleteAssessment();
  const data = listQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessment Management"
        description="Create and manage assessments"
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/assessment/create')} disabled={!canEdit}>
            Create Assessment
          </Button>
        }
      />

      <AssessmentsTable
        data={data}
        isLoading={listQuery.isLoading}
        onView={(row) => navigate(`/assessment/${row.id}`)}
        onEdit={canEdit ? (row) => navigate(`/assessment/${row.id}/edit`) : undefined}
        onDelete={canEdit ? (row) => deleteMutation.mutate({ id: row.id }) : undefined}
      />
    </div>
  );
}

