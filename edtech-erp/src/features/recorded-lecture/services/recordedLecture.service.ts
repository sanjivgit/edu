import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { resolveClassDisplayMap } from '@/features/common/services/lookups.service';
import type { LectureStatus } from '@/features/live-lecture/services/liveLecture.service';

export interface LectureAttachment {
  name: string;
  url: string;
}

export interface RecordedLectureRecord {
  id: string;
  title: string;
  subject: string;
  classDisplay: string;
  section: string;
  description: string;
  durationMinutes: number;
  meetingUrl: string;
  status: LectureStatus;
  hostName: string;
  attachments: LectureAttachment[];
  createdAt: string;
  updatedAt: string;
}

const API = '/lectures';

interface BackendLecture {
  id: string;
  title: string;
  subject?: string | null;
  classId?: string | null;
  section?: string | null;
  description?: string | null;
  durationMinutes?: number | null;
  meetingUrl?: string | null;
  status: LectureStatus;
  host?: { id: string; name: string } | null;
  attachments?: LectureAttachment[] | null;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/v1';

export function getAssetUrl(path?: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const origin = API_BASE_URL.replace(/\/v1\/?$/, '');
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
}

function toRecordedLectureRecord(l: BackendLecture, classMap: Map<string, string>): RecordedLectureRecord {
  return {
    id: l.id,
    title: l.title,
    subject: l.subject ?? '',
    classDisplay: l.classId ? (classMap.get(l.classId) ?? l.classId) : '',
    section: l.section ?? '',
    description: l.description ?? '',
    durationMinutes: l.durationMinutes ?? 0,
    meetingUrl: l.meetingUrl ?? '',
    status: l.status,
    hostName: l.host?.name ?? '',
    attachments: Array.isArray(l.attachments) ? l.attachments : [],
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
  };
}

export const useGetRecordedLectures = () =>
  useQuery({
    queryKey: [API, 'recorded'],
    queryFn: async () => {
      const res = await apiClient
        .get<ApiResponse<{ items: BackendLecture[] }>>(`${API}/recorded`, { params: { limit: 500 } })
        .then(unwrapApi);
      const items = Array.isArray(res) ? res : res?.items ?? [];
      const classIds = items.map((i) => i.classId).filter((id): id is string => !!id);
      const classMap = await resolveClassDisplayMap(classIds);
      return items
        .map((i) => toRecordedLectureRecord(i, classMap))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
  });

export const useGetRecordedLectureById = ({ lectureId }: { lectureId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', lectureId],
    queryFn: async () => {
      if (!lectureId) return null;
      const l = await apiClient.get<ApiResponse<BackendLecture>>(`${API}/${lectureId}`).then(unwrapApi);
      const classMap = l.classId ? await resolveClassDisplayMap([l.classId]) : new Map<string, string>();
      return toRecordedLectureRecord(l, classMap);
    },
    enabled: !!lectureId,
  });

export const useDeleteRecordedLecture = () =>
  useAppMutation<{ id: string }, { id: string }>({
    mutationFn: async (body) => {
      await apiClient.delete(`${API}/${body.id}`);
      return { id: body.id };
    },
    successMsg: 'Lecture deleted successfully',
    errorMsg: 'Failed to delete lecture',
    invalidateQueryKeys: [[API, 'recorded']],
  });
