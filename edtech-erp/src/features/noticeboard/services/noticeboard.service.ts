import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { resolveClassDisplayMap, resolveClassId } from '@/features/common/services/lookups.service';

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

const API = '/notices';

interface BackendNotice {
  id: string;
  title: string;
  message: string;
  category: NoticeCategory;
  publishAt: string;
  expireAt?: string | null;
  status: NoticeStatus;
  views: number;
  audience?: { scope: NoticeAudienceScope; classId?: string | null; section?: string | null };
  scope?: NoticeAudienceScope;
  classId?: string | null;
  section?: string | null;
  createdAt: string;
  updatedAt: string;
}

function toDateString(value?: string | null): string {
  if (!value) return '';
  return value.split('T')[0];
}

function toNoticeRecord(n: BackendNotice, classMap?: Map<string, string>): NoticeRecord {
  const scope = n.audience?.scope ?? n.scope ?? 'all';
  const classId = n.audience?.classId ?? n.classId ?? undefined;
  const section = n.audience?.section ?? n.section ?? undefined;
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    category: n.category,
    publishAt: toDateString(n.publishAt),
    expireAt: toDateString(n.expireAt),
    audience: {
      scope,
      classId: classId ? (classMap?.get(classId) ?? classId) : '',
      section: section ?? '',
    },
    status: n.status,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
    views: n.views,
  };
}

export const useGetNotices = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      const res = await apiClient
        .get<ApiResponse<{ items: BackendNotice[] }>>(API, { params: { limit: 500 } })
        .then(unwrapApi);
      const items = res?.items ?? [];
      const classIds = items
        .map((i) => i.audience?.classId ?? i.classId)
        .filter((id): id is string => !!id);
      const classMap = await resolveClassDisplayMap(classIds);
      return items.map((i) => toNoticeRecord(i, classMap)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
  });

export const useGetNoticeById = ({ noticeId }: { noticeId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', noticeId],
    queryFn: async () => {
      if (!noticeId) return null;
      const n = await apiClient.get<ApiResponse<BackendNotice>>(`${API}/${noticeId}`).then(unwrapApi);
      const classId = n.audience?.classId ?? n.classId;
      const classMap = classId ? await resolveClassDisplayMap([classId]) : new Map<string, string>();
      return toNoticeRecord(n, classMap);
    },
    enabled: !!noticeId,
  });

export const useCreateNotice = () =>
  useAppMutation<
    NoticeRecord,
    Omit<NoticeRecord, 'id' | 'createdAt' | 'updatedAt' | 'views'>
  >({
    mutationFn: async (body) => {
      const classId = body.audience.scope === 'class' && body.audience.classId
        ? await resolveClassId(body.audience.classId)
        : undefined;
      const created = await apiClient
        .post<ApiResponse<BackendNotice>>(API, {
          title: body.title,
          message: body.message,
          category: body.category,
          publishAt: body.publishAt,
          expireAt: body.expireAt || undefined,
          scope: body.audience.scope,
          classId,
          section: body.audience.section || undefined,
          status: body.status,
        })
        .then(unwrapApi);
      return toNoticeRecord(created);
    },
    successMsg: 'Notice created successfully',
    errorMsg: 'Failed to create notice',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateNotice = () =>
  useAppMutation<
    NoticeRecord,
    { id: string } & Omit<NoticeRecord, 'id' | 'createdAt' | 'updatedAt' | 'views'>
  >({
    mutationFn: async (body) => {
      const classId = body.audience.scope === 'class' && body.audience.classId
        ? await resolveClassId(body.audience.classId)
        : undefined;
      const updated = await apiClient
        .put<ApiResponse<BackendNotice>>(`${API}/${body.id}`, {
          title: body.title,
          message: body.message,
          category: body.category,
          publishAt: body.publishAt,
          expireAt: body.expireAt || undefined,
          scope: body.audience.scope,
          classId,
          section: body.audience.section || undefined,
          status: body.status,
        })
        .then(unwrapApi);
      return toNoticeRecord(updated);
    },
    successMsg: 'Notice updated successfully',
    errorMsg: 'Failed to update notice',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

export const useDeleteNotice = () =>
  useAppMutation<{ id: string }, { id: string }>({
    mutationFn: async (body) => {
      await apiClient.delete(`${API}/${body.id}`);
      return { id: body.id };
    },
    successMsg: 'Notice deleted successfully',
    errorMsg: 'Failed to delete notice',
    invalidateQueryKeys: [[API, 'list']],
  });

export const usePublishNotice = () =>
  useAppMutation<{ id: string }, { id: string }>({
    mutationFn: async (body) => {
      await apiClient.patch(`${API}/${body.id}/publish`);
      return { id: body.id };
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
