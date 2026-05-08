import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { RoleForm } from '../components/RoleForm';
import { useCreateRole } from '../services/roles.service';
import type { CreateRolePayload } from '../validations/roles.schema';
import type { RolePermission } from '../services/roles.service';

export default function RoleCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateRole();

  const onSubmit = (values: CreateRolePayload, permissions: RolePermission[]) => {
    createMutation.mutate(
      {
        name: values.name,
        description: values.description ?? '',
        isActive: values.isActive,
        permissions,
      },
      { onSuccess: (created) => navigate(`/roles/${created.id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Role"
        description="Define a new role and permissions"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/roles')}>
            Back
          </Button>
        }
      />

      <RoleForm mode="create" onSubmit={onSubmit} isSubmitting={createMutation.isPending} />
    </div>
  );
}

