import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { RolesTable } from '../components/RolesTable';
import { useDeleteRole, useGetRoles } from '../services/roles.service';

export default function RolesListPage() {
  const navigate = useNavigate();
  const listQuery = useGetRoles();
  const deleteMutation = useDeleteRole();
  const data = listQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Manage user roles and access control"
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/roles/create')}>
            Create Role
          </Button>
        }
      />

      <RolesTable
        data={data}
        isLoading={listQuery.isLoading}
        onView={(row) => navigate(`/roles/${row.id}`)}
        onEdit={(row) => navigate(`/roles/${row.id}/edit`)}
        onDelete={(row) => deleteMutation.mutate({ id: row.id })}
      />
    </div>
  );
}

