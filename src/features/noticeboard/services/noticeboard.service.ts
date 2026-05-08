import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { mockDelay } from '@/shared/utils';

export type NoticeCategory = 'general' | 'academic' | 'event' | 'urgent';
export type NoticeStatus = 'draft' | 'published';
export type NoticeAudienceScope = 'all' | 'class' | 'staff' | 'parents';

export interface NoticeAudience {
  scope: NoticeAudienceScope;
  classId?: string;
  section?: string;
}

export interface NoticeRecord {
  id: string;
  title: string;
  message: string;
  category: NoticeCategory;
  publishAt: string; // yyyy-mm-dd
  expireAt?: string;
  audience: NoticeAudience;
  status: NoticeStatus;
  createdAt: string;
  updatedAt: string;
  views: number;
}

const API = '/noticeboard';
let noticeStore: NoticeRecord[] = [];

function ensureSeed() {
  if (noticeStore.length) return;
  const now = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];
  noticeStore = [
    {
      id: 'NTC-1',
      title: 'Parent-Teacher Meeting',
      message: 'PTM will be held this Saturday at 10:00 AM. Please be on time.',
      category: 'event',
      publishAt: today,
      expireAt: '',
      audience: { scope: 'parents' },
      status: 'published',
      createdAt: now,
      updatedAt: now,
      views: 128,
    },
    {
      id: 'NTC-2',
      title: 'Class 10A Extra Math Class',
      message: 'Extra class for Algebra revision on Wednesday, 3:00 PM.',
      category: 'academic',
      publishAt: today,
      expireAt: '',
      audience: { scope: 'class', classId: '10', section: 'A' },
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      views: 0,
    },
    {
      id: 'NTC-3',
      title: 'Urgent: School will close early',
      message: 'Due to weather conditions, school will close at 1:00 PM today.',
      category: 'urgent',
      publishAt: today,
      expireAt: '',
      audience: { scope: 'all' },
      status: 'published',
      createdAt: now,
      updatedAt: now,
      views: 342,
    },
  ];
}

export const useGetNotices = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      await mockDelay(150);
      ensureSeed();
      return [...noticeStore].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
  });

export const useGetNoticeById = ({ noticeId }: { noticeId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', noticeId],
    queryFn: async () => {
      await mockDelay(120);
      ensureSeed();
      return noticeStore.find((n) => n.id === noticeId) ?? null;
    },
    enabled: !!noticeId,
  });

export const useCreateNotice = () =>
  useAppMutation({
    mutationFn: async (body: Omit<NoticeRecord, 'id' | 'createdAt' | 'updatedAt' | 'views'>) => {
      await mockDelay(220);
      ensureSeed();
      const now = new Date().toISOString();
      const created: NoticeRecord = {
        id: `NTC-${noticeStore.length + 1}`,
        createdAt: now,
        updatedAt: now,
        views: 0,
        ...body,
      };
      noticeStore = [created, ...noticeStore];
      return created;
    },
    successMsg: 'Notice created successfully',
    errorMsg: 'Failed to create notice',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateNotice = () =>
  useAppMutation({
    mutationFn: async (body: { id: string } & Partial<Omit<NoticeRecord, 'id' | 'createdAt'>>) => {
      await mockDelay(200);
      ensureSeed();
      const current = noticeStore.find((n) => n.id === body.id);
      if (!current) throw new Error('Notice not found');
      const next: NoticeRecord = { ...current, ...body, updatedAt: new Date().toISOString() };
      noticeStore = noticeStore.map((n) => (n.id === body.id ? next : n));
      return next;
    },
    successMsg: 'Notice updated successfully',
    errorMsg: 'Failed to update notice',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

export const useDeleteNotice = () =>
  useAppMutation({
    mutationFn: async (body: { id: string }) => {
      await mockDelay(160);
      ensureSeed();
      noticeStore = noticeStore.filter((n) => n.id !== body.id);
      return { id: body.id };
    },
    successMsg: 'Notice deleted successfully',
    errorMsg: 'Failed to delete notice',
    invalidateQueryKeys: [[API, 'list']],
  });

export const usePublishNotice = () =>
  useAppMutation({
    mutationFn: async (body: { id: string }) => {
      await mockDelay(180);
      ensureSeed();
      const current = noticeStore.find((n) => n.id === body.id);
      if (!current) throw new Error('Notice not found');
      const next: NoticeRecord = { ...current, status: 'published', updatedAt: new Date().toISOString() };
      noticeStore = noticeStore.map((n) => (n.id === body.id ? next : n));
      return next;
    },
    successMsg: 'Notice published successfully',
    errorMsg: 'Failed to publish notice',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

export function formatNoticeAudience(a: NoticeAudience) {
  if (a.scope === 'all') return 'All';
  if (a.scope === 'staff') return 'Staff';
  if (a.scope === 'parents') return 'Parents';
  if (a.scope === 'class') return `Class ${a.classId ?? '-'}-${a.section ?? '-'}`;
  return a.scope;
}

