import { ArrowLeft, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { PermissionsMatrix } from '../components/PermissionsMatrix';
import { useGetRoleById } from '../services/roles.service';

export default function RoleDetailPage() {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const detailQuery = useGetRoleById({ roleId });
  const role = detailQuery.data;

  if (!role) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Role Details"
          description="Role information and permissions"
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Details"
        description="Role information and permissions"
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/roles')}>
              Back
            </Button>
            <Button size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => navigate(`/roles/${role.id}/edit`)}>
              Edit
            </Button>
          </>
        }
      />

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Role</p>
            <p className="text-sm font-semibold">{role.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <StatusBadge status={role.isActive ? 'active' : 'inactive'} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Modules</p>
            <p className="text-sm font-semibold font-mono">{role.permissions.length}</p>
          </div>
        </div>
        {role.description && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground">Description</p>
            <p className="text-sm mt-1 whitespace-pre-line">{role.description}</p>
          </div>
        )}
      </Card>

      <PermissionsMatrix value={role.permissions} />
    </div>
  );
}

