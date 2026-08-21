import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { resolveClassId } from '@/features/common/services/lookups.service';

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

interface BackendDiaryEntry {
  id: string;
  date: string;
  classId: string;
  className?: string;
  section: string | null;
  subject: string;
  author?: { id: string; name: string } | null;
  title: string;
  content: string;
  visibility: DiaryVisibility;
  status: DiaryStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

function toDateString(value?: string): string {
  return (value ?? '').split('T')[0];
}

function toDiaryEntry(d: BackendDiaryEntry): DiaryEntry {
  const m = (d.className ?? '').match(/(\d+)/);
  return {
    id: d.id,
    date: toDateString(d.date),
    classId: m ? m[1] : d.classId,
    section: d.section ?? '',
    subject: d.subject,
    author: d.author?.name ?? '',
    title: d.title,
    content: d.content,
    visibility: d.visibility,
    status: d.status,
    tags: d.tags ?? [],
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

export const useGetDiaryEntries = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      const res = await apiClient
        .get<ApiResponse<BackendDiaryEntry[]>>(API, { params: { limit: 500 } })
        .then(unwrapApi);
      return (res ?? [])
        .map(toDiaryEntry)
        .sort((a, b) => b.date.localeCompare(a.date));
    },
  });

export const useGetDiaryEntryById = ({ entryId }: { entryId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', entryId],
    queryFn: async () => {
      if (!entryId) return null;
      const d = await apiClient.get<ApiResponse<BackendDiaryEntry>>(`${API}/${entryId}`).then(unwrapApi);
      return toDiaryEntry(d);
    },
    enabled: !!entryId,
  });

export const useCreateDiaryEntry = () =>
  useAppMutation<
    DiaryEntry,
    Omit<DiaryEntry, 'id' | 'author' | 'status' | 'createdAt' | 'updatedAt'> & { status?: DiaryStatus }
  >({
    mutationFn: async (body) => {
      const classId = await resolveClassId(body.classId);
      if (!classId) throw new Error('Class not found');
      const created = await apiClient
        .post<ApiResponse<BackendDiaryEntry>>(API, {
          date: body.date,
          classId,
          section: body.section || undefined,
          subject: body.subject,
          title: body.title,
          content: body.content,
          visibility: body.visibility,
          status: body.status ?? 'published',
          tags: body.tags ?? [],
        })
        .then(unwrapApi);
      return toDiaryEntry(created);
    },
    successMsg: 'Diary entry created successfully',
    errorMsg: 'Failed to create diary entry',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateDiaryEntry = () =>
  useAppMutation<
    DiaryEntry,
    { id: string } & Partial<Omit<DiaryEntry, 'id' | 'author' | 'createdAt'>>
  >({
    mutationFn: async (body) => {
      const classId = body.classId ? await resolveClassId(body.classId) : undefined;
      if (body.classId && !classId) throw new Error('Class not found');
      const updated = await apiClient
        .put<ApiResponse<BackendDiaryEntry>>(`${API}/${body.id}`, {
          date: body.date,
          classId,
          section: body.section || undefined,
          subject: body.subject,
          title: body.title,
          content: body.content,
          visibility: body.visibility,
          status: body.status,
          tags: body.tags ?? [],
        })
        .then(unwrapApi);
      return toDiaryEntry(updated);
    },
    successMsg: 'Diary entry updated successfully',
    errorMsg: 'Failed to update diary entry',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

export const useDeleteDiaryEntry = () =>
  useAppMutation<{ id: string }, { id: string }>({
    mutationFn: async (body) => {
      await apiClient.delete(`${API}/${body.id}`);
      return { id: body.id };
    },
    successMsg: 'Diary entry deleted successfully',
    errorMsg: 'Failed to delete diary entry',
    invalidateQueryKeys: [[API, 'list']],
  });

export const usePublishDiaryEntry = () =>
  useAppMutation<{ id: string }, { id: string }>({
    mutationFn: async (body) => {
      await apiClient.patch(`${API}/${body.id}/publish`);
      return { id: body.id };
    },
    successMsg: 'Diary entry published',
    errorMsg: 'Failed to publish diary entry',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });
