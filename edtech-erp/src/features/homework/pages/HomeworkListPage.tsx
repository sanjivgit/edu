import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks';
import { HomeworkTable } from '../components/HomeworkTable';
import { useDeleteHomework, useGetHomework } from '../services/homework.service';

export default function HomeworkListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'teacher';
  const listQuery = useGetHomework();
  const deleteMutation = useDeleteHomework();
  const data = listQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homework Management"
        description="Assign and track student homework"
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/homework/create')} disabled={!canEdit}>
            Create Homework
          </Button>
        }
      />

      <HomeworkTable
        data={data}
        isLoading={listQuery.isLoading}
        onView={(row) => navigate(`/homework/${row.id}`)}
        onEdit={canEdit ? (row) => navigate(`/homework/${row.id}/edit`) : undefined}
        onDelete={canEdit ? (row) => deleteMutation.mutate({ id: row.id }) : undefined}
      />
    </div>
  );
}

