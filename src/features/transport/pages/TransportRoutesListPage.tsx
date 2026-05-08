import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks';
import { RoutesTable } from '../components/RoutesTable';
import { useDeleteRoute, useGetRoutes } from '../services/transport.service';

export default function TransportRoutesListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'superadmin' || user?.role === 'admin';
  const listQuery = useGetRoutes();
  const deleteMutation = useDeleteRoute();
  const data = listQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transportation"
        description="Manage school transport routes"
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/transport/routes/create')} disabled={!canEdit}>
            Add Route
          </Button>
        }
      />

      <RoutesTable
        data={data}
        isLoading={listQuery.isLoading}
        onView={(row) => navigate(`/transport/routes/${row.id}`)}
        onEdit={canEdit ? (row) => navigate(`/transport/routes/${row.id}/edit`) : undefined}
        onDelete={canEdit ? (row) => deleteMutation.mutate({ id: row.id }) : undefined}
      />
    </div>
  );
}

