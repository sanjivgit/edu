import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { NotificationForm } from '../components/NotificationForm';
import { useCreateNotification } from '../services/notifications.service';
import type { NotificationCreatePayload } from '../validations/notifications.schema';

export default function NotificationsCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateNotification();

  const onSubmit = (values: NotificationCreatePayload) => {
    createMutation.mutate(
      {
        title: values.title,
        message: values.message,
        channel: values.channel,
        priority: values.priority,
        audience: values.audience,
        classId: values.classId ?? '',
        section: values.section ?? '',
        scheduleAt: values.scheduleAt ?? '',
      },
      { onSuccess: (created) => navigate(`/notifications/${created.id}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Notification"
        description="Create and send a notification"
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/notifications')}>
            Back
          </Button>
        }
      />

      <NotificationForm mode="create" onSubmit={onSubmit} isSubmitting={createMutation.isPending} />
    </div>
  );
}

