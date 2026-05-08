import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { mockDelay } from '@/shared/utils';

export type DiaryVisibility = 'students' | 'parents' | 'both';
export type DiaryStatus = 'draft' | 'published';

export interface DiaryEntry {
  id: string;
  date: string; // yyyy-mm-dd
  classId: string;
  section: string;
  subject: string;
  author: string;
  title: string;
  content: string;
  visibility: DiaryVisibility;
  status: DiaryStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const API = '/diary';
let diaryStore: DiaryEntry[] = [];

function ensureSeed() {
  if (diaryStore.length) return;
  const now = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split('T')[0];
  diaryStore = [
    {
      id: 'DY-1',
      date: yesterday,
      classId: '10',
      section: 'A',
      subject: 'Mathematics',
      author: 'Mr. Verma',
      title: 'Algebra recap',
      content: 'Today we revised algebraic identities and solved practice problems.',
      visibility: 'both',
      status: 'published',
      tags: ['algebra', 'revision'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'DY-2',
      date: today,
      classId: '10',
      section: 'A',
      subject: 'Science',
      author: 'Ms. Joshi',
      title: 'Lab safety notes',
      content: 'Reminder: wear lab coat and follow safety rules during experiments.',
      visibility: 'students',
      status: 'draft',
      tags: ['lab'],
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export const useGetDiaryEntries = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      await mockDelay(150);
      ensureSeed();
      return [...diaryStore].sort((a, b) => b.date.localeCompare(a.date));
    },
  });

export const useGetDiaryEntryById = ({ entryId }: { entryId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', entryId],
    queryFn: async () => {
      await mockDelay(120);
      ensureSeed();
      return diaryStore.find((d) => d.id === entryId) ?? null;
    },
    enabled: !!entryId,
  });

export const useCreateDiaryEntry = () =>
  useAppMutation({
    mutationFn: async (body: Omit<DiaryEntry, 'id' | 'status' | 'createdAt' | 'updatedAt'> & { status?: DiaryStatus }) => {
      await mockDelay(220);
      ensureSeed();
      const now = new Date().toISOString();
      const created: DiaryEntry = {
        id: `DY-${diaryStore.length + 1}`,
        status: body.status ?? 'published',
        createdAt: now,
        updatedAt: now,
        ...body,
      };
      diaryStore = [created, ...diaryStore];
      return created;
    },
    successMsg: 'Diary entry created successfully',
    errorMsg: 'Failed to create diary entry',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateDiaryEntry = () =>
  useAppMutation({
    mutationFn: async (body: { id: string } & Partial<Omit<DiaryEntry, 'id' | 'createdAt'>>) => {
      await mockDelay(200);
      ensureSeed();
      const current = diaryStore.find((d) => d.id === body.id);
      if (!current) throw new Error('Diary entry not found');
      const next: DiaryEntry = { ...current, ...body, updatedAt: new Date().toISOString() };
      diaryStore = diaryStore.map((d) => (d.id === body.id ? next : d));
      return next;
    },
    successMsg: 'Diary entry updated successfully',
    errorMsg: 'Failed to update diary entry',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

export const useDeleteDiaryEntry = () =>
  useAppMutation({
    mutationFn: async (body: { id: string }) => {
      await mockDelay(160);
      ensureSeed();
      diaryStore = diaryStore.filter((d) => d.id !== body.id);
      return { id: body.id };
    },
    successMsg: 'Diary entry deleted successfully',
    errorMsg: 'Failed to delete diary entry',
    invalidateQueryKeys: [[API, 'list']],
  });

export const usePublishDiaryEntry = () =>
  useAppMutation({
    mutationFn: async (body: { id: string }) => {
      await mockDelay(180);
      ensureSeed();
      const current = diaryStore.find((d) => d.id === body.id);
      if (!current) throw new Error('Diary entry not found');
      const next: DiaryEntry = { ...current, status: 'published', updatedAt: new Date().toISOString() };
      diaryStore = diaryStore.map((d) => (d.id === body.id ? next : d));
      return next;
    },
    successMsg: 'Diary entry published',
    errorMsg: 'Failed to publish diary entry',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

