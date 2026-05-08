import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks';
import { SyllabusTable } from '../components/SyllabusTable';
import { useDeleteSyllabus, useGetSyllabus } from '../services/syllabus.service';

export default function SyllabusListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = user?.role === 'superadmin' || user?.role === 'admin';
  const listQuery = useGetSyllabus();
  const deleteMutation = useDeleteSyllabus();
  const data = listQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Syllabus Management"
        description="Manage course curriculum and syllabus"
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/syllabus/create')} disabled={!canManage}>
            Add Syllabus
          </Button>
        }
      />

      <SyllabusTable
        data={data}
        isLoading={listQuery.isLoading}
        onView={(row) => navigate(`/syllabus/${row.id}`)}
        onEdit={canManage ? (row) => navigate(`/syllabus/${row.id}/edit`) : undefined}
        onDelete={canManage ? (row) => deleteMutation.mutate({ id: row.id }) : undefined}
      />
    </div>
  );
}

