import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { mockDelay } from '@/shared/utils';

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

const API = '/notifications';
let notifStore: NotificationRecord[] = [];

function ensureSeed() {
  if (notifStore.length) return;
  const now = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];
  notifStore = [
    {
      id: 'N-1',
      title: 'Welcome to EduCore',
      message: 'Your dashboard is ready. Explore modules and start managing your campus.',
      channel: 'in-app',
      priority: 'normal',
      audience: 'all',
      scheduleAt: '',
      status: 'sent',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'N-2',
      title: 'Fee Reminder',
      message: 'Please complete fee payment by the due date to avoid late fee.',
      channel: 'sms',
      priority: 'high',
      audience: 'parents',
      scheduleAt: today,
      status: 'queued',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'N-3',
      title: 'Class 10A: Homework Posted',
      message: 'New homework has been assigned for Mathematics. Check details in Homework module.',
      channel: 'in-app',
      priority: 'normal',
      audience: 'class',
      classId: '10',
      section: 'A',
      scheduleAt: '',
      status: 'sent',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export const useGetNotifications = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      await mockDelay(150);
      ensureSeed();
      return [...notifStore].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
  });

export const useGetNotificationById = ({ notificationId }: { notificationId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', notificationId],
    queryFn: async () => {
      await mockDelay(120);
      ensureSeed();
      return notifStore.find((n) => n.id === notificationId) ?? null;
    },
    enabled: !!notificationId,
  });

export const useCreateNotification = () =>
  useAppMutation({
    mutationFn: async (body: Omit<NotificationRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'> & { status?: NotificationStatus }) => {
      await mockDelay(220);
      ensureSeed();
      const now = new Date().toISOString();
      const created: NotificationRecord = {
        id: `N-${notifStore.length + 1}`,
        status: body.status ?? (body.scheduleAt ? 'queued' : 'sent'),
        createdAt: now,
        updatedAt: now,
        ...body,
      };
      notifStore = [created, ...notifStore];
      return created;
    },
    successMsg: 'Notification created successfully',
    errorMsg: 'Failed to create notification',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateNotification = () =>
  useAppMutation({
    mutationFn: async (body: { id: string } & Partial<Omit<NotificationRecord, 'id' | 'createdAt'>>) => {
      await mockDelay(200);
      ensureSeed();
      const current = notifStore.find((n) => n.id === body.id);
      if (!current) throw new Error('Notification not found');
      const next: NotificationRecord = { ...current, ...body, updatedAt: new Date().toISOString() };
      notifStore = notifStore.map((n) => (n.id === body.id ? next : n));
      return next;
    },
    successMsg: 'Notification updated successfully',
    errorMsg: 'Failed to update notification',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

export const useDeleteNotification = () =>
  useAppMutation({
    mutationFn: async (body: { id: string }) => {
      await mockDelay(160);
      ensureSeed();
      notifStore = notifStore.filter((n) => n.id !== body.id);
      return { id: body.id };
    },
    successMsg: 'Notification deleted successfully',
    errorMsg: 'Failed to delete notification',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useSendNowNotification = () =>
  useAppMutation({
    mutationFn: async (body: { id: string }) => {
      await mockDelay(180);
      ensureSeed();
      const current = notifStore.find((n) => n.id === body.id);
      if (!current) throw new Error('Notification not found');
      const next: NotificationRecord = { ...current, status: 'sent', scheduleAt: '', updatedAt: new Date().toISOString() };
      notifStore = notifStore.map((n) => (n.id === body.id ? next : n));
      return next;
    },
    successMsg: 'Notification sent',
    errorMsg: 'Failed to send notification',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

export function formatNotificationAudience(n: NotificationRecord) {
  if (n.audience === 'all') return 'All';
  if (n.audience === 'staff') return 'Staff';
  if (n.audience === 'parents') return 'Parents';
  if (n.audience === 'class') return `Class ${n.classId ?? '-'}-${n.section ?? '-'}`;
  return n.audience;
}

