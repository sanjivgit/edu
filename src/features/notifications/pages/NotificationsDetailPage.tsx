import { ArrowLeft, Pencil, Send } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { formatNotificationAudience, useGetNotificationById, useSendNowNotification } from '../services/notifications.service';

const CHANNEL_LABEL: Record<string, string> = {
  'in-app': 'In-App',
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
};

export default function NotificationsDetailPage() {
  const navigate = useNavigate();
  const { notificationId } = useParams();
  const detailQuery = useGetNotificationById({ notificationId });
  const notification = detailQuery.data;
  const sendNowMutation = useSendNowNotification();

  if (!notification) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Notification Details"
          description="Notification information"
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Details"
        description="Notification information"
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/notifications')}>
              Back
            </Button>
            <Button size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => navigate(`/notifications/${notification.id}/edit`)}>
              Edit
            </Button>
            {notification.status !== 'sent' && (
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Send className="h-4 w-4" />}
                onClick={() => sendNowMutation.mutate({ id: notification.id })}
                isLoading={sendNowMutation.isPending}
              >
                Send Now
              </Button>
            )}
          </>
        }
      />

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Title</p>
            <p className="text-sm font-semibold">{notification.title}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Channel</p>
            <p className="text-sm font-semibold">{CHANNEL_LABEL[notification.channel] ?? notification.channel}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Audience</p>
            <p className="text-sm font-semibold">{formatNotificationAudience(notification)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <StatusBadge status={notification.status} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Priority</p>
            <p className="text-sm font-semibold">{notification.priority.toUpperCase()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Schedule</p>
            <p className="text-sm font-semibold">{notification.scheduleAt ? new Date(notification.scheduleAt).toLocaleDateString('en-IN') : '-'}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs text-muted-foreground">Message</p>
          <p className="text-sm mt-1 whitespace-pre-line">{notification.message}</p>
        </div>
      </Card>
    </div>
  );
}

