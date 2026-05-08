import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NotificationForm } from '../components/NotificationForm';
import { useGetNotificationById, useUpdateNotification } from '../services/notifications.service';
import type { NotificationUpdatePayload } from '../validations/notifications.schema';

export default function NotificationsEditPage() {
  const navigate = useNavigate();
  const { notificationId } = useParams();
  const detailQuery = useGetNotificationById({ notificationId });
  const notification = detailQuery.data;
  const updateMutation = useUpdateNotification();

  if (!notification) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Notification"
          description="Update notification details"
          actions={
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/notifications')}>
              Back
            </Button>
          }
        />
        <Card>
          <div className="text-sm text-muted-foreground">{detailQuery.isLoading ? 'Loading...' : 'Notification not found.'}</div>
        </Card>
      </div>
    );
  }

  const onSubmit = (values: NotificationUpdatePayload | any) => {
    updateMutation.mutate(
      {
        id: notification.id,
        title: values.title,
        message: values.message,
        channel: values.channel,
        priority: values.priority,
        audience: values.audience,
        classId: values.classId ?? '',
        section: values.section ?? '',
        scheduleAt: values.scheduleAt ?? '',
        status: values.status ?? notification.status,
      },
      { onSuccess: (updated) => navigate(`/notifications/${updated.id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Notification"
        description="Update notification details"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(`/notifications/${notification.id}`)}>
            Back
          </Button>
        }
      />

      <NotificationForm
        mode="edit"
        defaultValues={{ ...notification, id: notification.id, status: notification.status } as any}
        onSubmit={onSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}

