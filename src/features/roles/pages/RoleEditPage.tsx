import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RoleForm } from '../components/RoleForm';
import { useGetRoleById, useUpdateRole } from '../services/roles.service';
import type { UpdateRolePayload } from '../validations/roles.schema';
import type { RolePermission } from '../services/roles.service';

export default function RoleEditPage() {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const detailQuery = useGetRoleById({ roleId });
  const role = detailQuery.data;
  const updateMutation = useUpdateRole();

  if (!role) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Role"
          description="Update role and permissions"
          actions={
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/roles')}>
              Back
            </Button>
          }
        />
        <Card>
          <div className="text-sm text-muted-foreground">{detailQuery.isLoading ? 'Loading...' : 'Role not found.'}</div>
        </Card>
      </div>
    );
  }

  const onSubmit = (values: UpdateRolePayload | any, permissions: RolePermission[]) => {
    updateMutation.mutate(
      {
        id: role.id,
        name: values.name,
        description: values.description ?? '',
        isActive: values.isActive,
        permissions,
      },
      { onSuccess: (updated) => navigate(`/roles/${updated.id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Role"
        description="Update role and permissions"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(`/roles/${role.id}`)}>
            Back
          </Button>
        }
      />

      <RoleForm
        mode="edit"
        defaultValues={{ ...role, id: role.id } as any}
        onSubmit={onSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}

