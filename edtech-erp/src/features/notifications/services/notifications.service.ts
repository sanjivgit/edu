import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import { useToast } from '@/hooks';
import type { ApiResponse } from '@/types';

export type NotificationChannel = 'in-app' | 'email' | 'sms' | 'whatsapp';
export type NotificationPriority = 'low' | 'normal' | 'high';
export type NotificationAudience = 'all' | 'class' | 'staff' | 'parents';
export type NotificationStatus = 'queued' | 'sent' | 'failed' | 'cancelled';

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  audience: NotificationAudience;
  classId?: string;
  section?: string;
  scheduleAt?: string; // yyyy-mm-dd
  status: NotificationStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Backend wire types & mapping ───────────────────────────────────────────────

interface ApiNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  channel: 'in_app' | 'email' | 'sms' | 'whatsapp';
  priority: NotificationPriority;
  audience: string;
  link?: string | null;
  actor?: string | null;
  isRead: boolean;
  status: NotificationStatus;
  scheduleAt?: string | null;
  tenantId?: string | null;
  createdAt: string;
}

function mapNotification(n: ApiNotification): NotificationRecord {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    channel: n.channel === 'in_app' ? 'in-app' : n.channel,
    priority: n.priority,
    audience: (['all', 'class', 'staff', 'parents'] as const).includes(n.audience as NotificationAudience)
      ? (n.audience as NotificationAudience)
      : 'all',
    scheduleAt: n.scheduleAt ? new Date(n.scheduleAt).toISOString().split('T')[0] : '',
    status: n.status,
    createdAt: n.createdAt,
    updatedAt: n.createdAt,
  };
}

const Q = {
  list: ['notifications', 'list'] as const,
  unread: ['notifications', 'unread'] as const,
};

function useNotificationMutation<TVars, TData>({
  mutationFn,
  successMsg,
  invalidate = [Q.list, Q.unread],
}: {
  mutationFn: (vars: TVars) => Promise<TData>;
  successMsg: string;
  invalidate?: ReadonlyArray<readonly unknown[]>;
}) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      success('Success', successMsg);
      invalidate.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [...key] });
      });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e?.response?.data?.message;
      error('Failed', Array.isArray(msg) ? msg.join(', ') : msg ?? 'Something went wrong');
    },
  });
}

// ─── Queries ────────────────────────────────────────────────────────────────────

export const useGetNotifications = () =>
  useQuery({
    queryKey: Q.list,
    queryFn: () =>
      apiClient
        .get<ApiResponse<ApiNotification[]>>('/notifications', { params: { limit: 100 } })
        .then(unwrapApi)
        .then((items) => items.map(mapNotification)),
  });

export const useGetUnreadCount = () =>
  useQuery({
    queryKey: Q.unread,
    queryFn: () =>
      apiClient
        .get<ApiResponse<{ unreadCount: number }>>('/notifications/unread-count')
        .then(unwrapApi),
    refetchInterval: 30_000,
  });

// There is no GET /notifications/:id on the backend — derive from the list.
export const useGetNotificationById = ({ notificationId }: { notificationId?: string }) =>
  useQuery({
    queryKey: [Q.list, 'detail', notificationId],
    queryFn: async () => {
      const items = await apiClient
        .get<ApiResponse<ApiNotification[]>>('/notifications', { params: { limit: 500 } })
        .then(unwrapApi);
      const found = items.find((n) => n.id === notificationId);
      return found ? mapNotification(found) : null;
    },
    enabled: !!notificationId,
  });

// ─── Mutations ──────────────────────────────────────────────────────────────────

export const useCreateNotification = () =>
  useNotificationMutation<
    Omit<NotificationRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'> & { status?: NotificationStatus },
    NotificationRecord
  >({
    mutationFn: (body) =>
      apiClient
        .post<ApiResponse<ApiNotification>>('/notifications', {
          title: body.title,
          message: body.message,
          channel: body.channel === 'in-app' ? 'in_app' : body.channel,
          priority: body.priority,
          audience: body.audience,
          scheduleAt: body.scheduleAt || undefined,
        })
        .then(unwrapApi)
        .then(mapNotification),
    successMsg: 'Notification created successfully',
  });

export const useBulkNotification = () =>
  useNotificationMutation<
    { title: string; message: string; roles?: string[]; userIds?: string[]; type?: string; link?: string },
    { message: string; sent: number }
  >({
    mutationFn: (body) =>
      apiClient
        .post<ApiResponse<{ message: string; sent: number }>>('/notifications/bulk', body)
        .then(unwrapApi),
    successMsg: 'Notification broadcast sent',
  });

export const useMarkNotificationRead = () =>
  useNotificationMutation<{ id: string }, { message: string }>({
    mutationFn: ({ id }) =>
      apiClient.patch<ApiResponse<{ message: string }>>(`/notifications/${id}/read`).then(unwrapApi),
    successMsg: 'Notification marked as read',
  });

export const useMarkAllNotificationsRead = () =>
  useNotificationMutation<undefined, { message: string }>({
    mutationFn: () =>
      apiClient.patch<ApiResponse<{ message: string }>>('/notifications/read-all').then(unwrapApi),
    successMsg: 'All notifications marked as read',
  });

// The backend exposes no update / delete / send-now endpoints for notifications.
// These hooks preserve the UI contract but surface that limitation explicitly.
const unsupported = (op: string) => () => {
  throw new Error(`${op} notifications is not supported by the API`);
};

export const useUpdateNotification = () =>
  useNotificationMutation<
    { id: string } & Partial<Omit<NotificationRecord, 'id' | 'createdAt'>>,
    NotificationRecord
  >({
    mutationFn: unsupported('Updating'),
    successMsg: 'Notification updated',
  });

export const useDeleteNotification = () =>
  useNotificationMutation<{ id: string }, { id: string }>({
    mutationFn: unsupported('Deleting'),
    successMsg: 'Notification deleted',
    invalidate: [Q.list],
  });

export const useSendNowNotification = () =>
  useNotificationMutation<{ id: string }, NotificationRecord>({
    mutationFn: unsupported('Sending'),
    successMsg: 'Notification sent',
  });

export function formatNotificationAudience(n: NotificationRecord) {
  if (n.audience === 'all') return 'All';
  if (n.audience === 'staff') return 'Staff';
  if (n.audience === 'parents') return 'Parents';
  if (n.audience === 'class') return `Class ${n.classId ?? '-'}-${n.section ?? '-'}`;
  return n.audience;
}
