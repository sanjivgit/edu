import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks';
import { useDeleteSubject, useGetSubjects } from '../services/subjects.service';
import { SubjectsTable } from '../components/SubjectsTable';

export default function SubjectsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'teacher';
  const listQuery = useGetSubjects();
  const deleteMutation = useDeleteSubject();
  const data = listQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subject Management"
        description="Manage subjects and curriculum"
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/subjects/create')} disabled={!canEdit}>
            Add Subject
          </Button>
        }
      />

      <SubjectsTable
        data={data}
        isLoading={listQuery.isLoading}
        onView={(row) => navigate(`/subjects/${row.id}`)}
        onEdit={canEdit ? (row) => navigate(`/subjects/${row.id}/edit`) : undefined}
        onDelete={canEdit ? (row) => deleteMutation.mutate({ id: row.id }) : undefined}
      />
    </div>
  );
}

