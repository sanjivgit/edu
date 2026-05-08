import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks';
import { TeachersTable } from '../components/TeachersTable';
import { useDeleteTeacher, useGetTeachers } from '../services/teachers.service';

export default function TeachersListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'superadmin' || user?.role === 'admin';
  const listQuery = useGetTeachers();
  const deleteMutation = useDeleteTeacher();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Management"
        description="Manage teacher profiles, subjects, and class allocations"
        actions={canEdit ? <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/teachers/create')}>Add Teacher</Button> : undefined}
      />
      <TeachersTable
        data={listQuery.data ?? []}
        isLoading={listQuery.isLoading}
        onView={(row) => navigate(`/teachers/${row.id}`)}
        onEdit={(row) => canEdit && navigate(`/teachers/${row.id}/edit`)}
        onDelete={(row) => canEdit && deleteMutation.mutate({ id: row.id })}
      />
    </div>
  );
}

