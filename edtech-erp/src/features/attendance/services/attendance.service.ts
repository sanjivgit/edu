import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { resolveClassId } from '@/features/common/services/lookups.service';

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface StudentRosterItem {
  id: string;
  name: string;
  rollNo: string;
}

export interface AttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  section: string;
  date: string; // yyyy-mm-dd
  entries: AttendanceEntry[];
  createdAt: string;
}

const API = '/attendance';

function toSession(s: {
  id: string;
  classId: string;
  section: string | null;
  date: string;
  createdAt?: string;
  entries: Array<{ studentId: string; status: AttendanceStatus }>;
}): AttendanceSession {
  return {
    id: s.id,
    classId: s.classId,
    section: s.section ?? '',
    date: s.date,
    entries: (s.entries ?? []).map((e) => ({ studentId: e.studentId, status: e.status })),
    createdAt: s.createdAt ?? new Date().toISOString(),
  };
}

export const useGetRoster = ({ classId, section }: { classId?: string; section?: string }) =>
  useQuery({
    queryKey: [API, 'roster', classId, section],
    queryFn: async () => {
      if (!classId) return [];
      const realClassId = await resolveClassId(classId);
      if (!realClassId) return [];
      const res = await apiClient
        .get<ApiResponse<StudentRosterItem[]>>('/attendance/roster', {
          params: { classId: realClassId, section: section || undefined },
        })
        .then(unwrapApi);
      return res ?? [];
    },
    enabled: !!classId && !!section,
  });

export const useGetSessions = () =>
  useQuery({
    queryKey: [API, 'sessions'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<AttendanceSession[]>>('/attendance/history').then(unwrapApi);
      return (res ?? []).map(toSession).sort((a, b) => b.date.localeCompare(a.date));
    },
  });

export const useGetSessionById = ({ sessionId }: { sessionId?: string }) =>
  useQuery({
    queryKey: [API, 'sessions', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const s = await apiClient.get<ApiResponse<AttendanceSession>>(`/attendance/sessions/${sessionId}`).then(unwrapApi);
      return toSession(s);
    },
    enabled: !!sessionId,
  });

export const useSaveAttendanceSession = () =>
  useAppMutation<AttendanceSession, { classId: string; section: string; date: string; entries: AttendanceEntry[] }>({
    mutationFn: async (body) => {
      const realClassId = (await resolveClassId(body.classId)) ?? body.classId;
      const res = await apiClient
        .post<ApiResponse<AttendanceSession>>('/attendance', {
          classId: realClassId,
          section: body.section || undefined,
          date: body.date,
          entries: body.entries.map((e) => ({ studentId: e.studentId, status: e.status })),
        })
        .then(unwrapApi);
      return toSession(res);
    },
    successMsg: 'Attendance saved successfully',
    errorMsg: 'Failed to save attendance',
    invalidateQueryKeys: [[API, 'sessions']],
  });
