import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks';
import { RoutesTable } from '../components/RoutesTable';
import { useDeleteRoute, useGetRoutes } from '../services/transport.service';

export default function TransportRoutesListPage() {
  const navigate = useNavigate();
  const { isManagement } = useAuth();
  const listQuery = useGetRoutes();
  const deleteMutation = useDeleteRoute();
  const data = listQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transportation"
        description={isManagement ? 'Manage school transport routes' : 'View school transport routes'}
        actions={
          isManagement ? (
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/transport/routes/create')}>
              Add Route
            </Button>
          ) : undefined
        }
      />

      <RoutesTable
        data={data}
        isLoading={listQuery.isLoading}
        onView={(row) => navigate(`/transport/routes/${row.id}`)}
        onEdit={isManagement ? (row) => navigate(`/transport/routes/${row.id}/edit`) : undefined}
        onDelete={isManagement ? (row) => deleteMutation.mutate({ id: row.id }) : undefined}
      />
    </div>
  );
}

