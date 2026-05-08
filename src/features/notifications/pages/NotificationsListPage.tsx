import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks';
import { NotificationsTable } from '../components/NotificationsTable';
import { useDeleteNotification, useGetNotifications, useSendNowNotification } from '../services/notifications.service';

export default function NotificationsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'teacher';
  const listQuery = useGetNotifications();
  const sendNowMutation = useSendNowNotification();
  const deleteMutation = useDeleteNotification();
  const data = listQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Center"
        description="View all system notifications"
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/notifications/create')} disabled={!canManage}>
            Create Notification
          </Button>
        }
      />

      <NotificationsTable
        data={data}
        isLoading={listQuery.isLoading}
        onView={(row) => navigate(`/notifications/${row.id}`)}
        onEdit={canManage ? (row) => navigate(`/notifications/${row.id}/edit`) : undefined}
        onSendNow={canManage ? (row) => sendNowMutation.mutate({ id: row.id }) : undefined}
        onDelete={canManage ? (row) => deleteMutation.mutate({ id: row.id }) : undefined}
      />
    </div>
  );
}

