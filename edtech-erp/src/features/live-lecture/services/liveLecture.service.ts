import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { resolveClassDisplayMap, resolveClassId } from '@/features/common/services/lookups.service';

export type LectureStatus = 'scheduled' | 'live' | 'ended' | 'cancelled' | 'published';

export interface LiveLectureRecord {
  id: string;
  title: string;
  subject: string;
  classDisplay: string;
  section: string;
  description: string;
  scheduledAt: string; // yyyy-mm-dd
  time: string; // HH:mm
  durationMinutes: number;
  meetingUrl: string;
  status: LectureStatus;
  hostName: string;
  createdAt: string;
  updatedAt: string;
}

export interface LectureInput {
  title: string;
  subject: string;
  classDisplay: string;
  section: string;
  description: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  durationMinutes: number;
  meetingUrl: string;
}

const API = '/lectures';

interface BackendLecture {
  id: string;
  title: string;
  subject?: string | null;
  classId?: string | null;
  section?: string | null;
  description?: string | null;
  scheduledAt?: string | null;
  durationMinutes?: number | null;
  meetingUrl?: string | null;
  status: LectureStatus;
  host?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

function toDateString(value?: string | null): string {
  if (!value) return '';
  return value.split('T')[0];
}

function toTimeString(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function toLectureRecord(l: BackendLecture, classMap: Map<string, string>): LiveLectureRecord {
  const classNum = l.classId ? (classMap.get(l.classId) ?? l.classId) : '';
  return {
    id: l.id,
    title: l.title,
    subject: l.subject ?? '',
    classDisplay: classNum,
    section: l.section ?? '',
    description: l.description ?? '',
    scheduledAt: toDateString(l.scheduledAt),
    time: toTimeString(l.scheduledAt),
    durationMinutes: l.durationMinutes ?? 0,
    meetingUrl: l.meetingUrl ?? '',
    status: l.status,
    hostName: l.host?.name ?? '',
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
  };
}

export const useGetLiveLectures = () =>
  useQuery({
    queryKey: [API, 'live'],
    queryFn: async () => {
      const res = await apiClient
        .get<ApiResponse<{ items: BackendLecture[] }>>(`${API}/live`, { params: { limit: 500 } })
        .then(unwrapApi);
      const items = Array.isArray(res) ? res : res?.items ?? [];
      const classIds = items.map((i) => i.classId).filter((id): id is string => !!id);
      const classMap = await resolveClassDisplayMap(classIds);
      return items
        .map((i) => toLectureRecord(i, classMap))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
  });

export const useGetLiveLectureById = ({ lectureId }: { lectureId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', lectureId],
    queryFn: async () => {
      if (!lectureId) return null;
      const l = await apiClient.get<ApiResponse<BackendLecture>>(`${API}/${lectureId}`).then(unwrapApi);
      const classMap = l.classId ? await resolveClassDisplayMap([l.classId]) : new Map<string, string>();
      return toLectureRecord(l, classMap);
    },
    enabled: !!lectureId,
  });

export const useCreateLiveLecture = () =>
  useAppMutation<LiveLectureRecord, LectureInput>({
    mutationFn: async (body) => {
      const classId = await resolveClassId(body.classDisplay);
      const created = await apiClient
        .post<ApiResponse<BackendLecture>>(`${API}/live`, {
          type: 'live',
          title: body.title,
          subject: body.subject || undefined,
          classId,
          section: body.section || undefined,
          description: body.description || undefined,
          scheduledAt: body.date && body.time ? `${body.date}T${body.time}:00` : body.date || undefined,
          durationMinutes: body.durationMinutes || undefined,
          meetingUrl: body.meetingUrl || undefined,
        })
        .then(unwrapApi);
      return toLectureRecord(created, new Map());
    },
    successMsg: 'Live class scheduled successfully',
    errorMsg: 'Failed to schedule live class',
    invalidateQueryKeys: [[API, 'live']],
  });

export const useUpdateLiveLecture = () =>
  useAppMutation<LiveLectureRecord, { id: string } & LectureInput>({
    mutationFn: async (body) => {
      const classId = await resolveClassId(body.classDisplay);
      const updated = await apiClient
        .put<ApiResponse<BackendLecture>>(`${API}/${body.id}`, {
          title: body.title,
          subject: body.subject || undefined,
          classId,
          section: body.section || undefined,
          description: body.description || undefined,
          scheduledAt: body.date && body.time ? `${body.date}T${body.time}:00` : body.date || undefined,
          durationMinutes: body.durationMinutes || undefined,
          meetingUrl: body.meetingUrl || undefined,
        })
        .then(unwrapApi);
      return toLectureRecord(updated, new Map());
    },
    successMsg: 'Live class updated successfully',
    errorMsg: 'Failed to update live class',
    invalidateQueryKeys: [[API, 'live'], [API, 'detail']],
  });

export const useDeleteLiveLecture = () =>
  useAppMutation<{ id: string }, { id: string }>({
    mutationFn: async (body) => {
      await apiClient.delete(`${API}/${body.id}`);
      return { id: body.id };
    },
    successMsg: 'Live class deleted successfully',
    errorMsg: 'Failed to delete live class',
    invalidateQueryKeys: [[API, 'live']],
  });

export const useJoinLecture = () =>
  useAppMutation<{ id: string; joinUrl: string }, { id: string }>({
    mutationFn: async (body) => {
      const res = await apiClient
        .post<ApiResponse<BackendLecture & { joinUrl?: string }>>(`${API}/${body.id}/join`)
        .then(unwrapApi);
      return { id: res.id, joinUrl: res.joinUrl ?? res.meetingUrl ?? '' };
    },
    successMsg: 'Joining live class...',
    errorMsg: 'Failed to join live class',
    invalidateQueryKeys: [[API, 'live']],
  });

export function formatClassDisplay(record: { classDisplay: string; section: string }): string {
  if (!record.classDisplay && !record.section) return 'All';
  return `Class ${record.classDisplay}${record.section ? `-${record.section}` : ''}`.trim();
}
