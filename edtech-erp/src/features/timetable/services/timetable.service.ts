import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { findSubjectIdByName, resolveClassId } from '@/features/common/services/lookups.service';

export type TimetableDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export type TimetableCell = { subject: string; teacher: string };

export interface TimetableGrid {
  [day: string]: Record<number, TimetableCell>;
}

export interface TimetableRecord {
  id: string;
  classId: string;
  section: string;
  week: number;
  grid: TimetableGrid;
  updatedAt: string;
}

const API = '/timetable';

interface BackendTimetable {
  id: string;
  classId: string;
  section: string;
  week: number;
  grid: Record<string, Record<number, { subject: string; teacher: string }>>;
  updatedAt: string;
}

function toTimetableRecord(t: BackendTimetable, classId: string): TimetableRecord {
  return {
    id: t.id,
    classId,
    section: t.section ?? '',
    week: t.week,
    grid: t.grid as TimetableGrid,
    updatedAt: t.updatedAt,
  };
}

export const useGetTimetable = ({ classId, section, week }: { classId?: string; section?: string; week?: number }) =>
  useQuery({
    queryKey: [API, 'grid', classId, section, week],
    queryFn: async () => {
      if (!classId || !section) return null;
      const resolvedClassId = await resolveClassId(classId);
      if (!resolvedClassId) return null;
      const res = await apiClient
        .get<ApiResponse<BackendTimetable>>(`/timetable/${resolvedClassId}`, {
          params: { section, week: week ?? 0 },
        })
        .then(unwrapApi);
      return res ? toTimetableRecord(res, classId) : null;
    },
    enabled: !!classId && !!section && typeof week === 'number',
  });

export const useAssignTimetableCell = () =>
  useAppMutation<
    TimetableRecord,
    { classId: string; section: string; week: number; day: TimetableDay; periodId: number; subject: string; teacher: string }
  >({
    mutationFn: async (body) => {
      const classId = await resolveClassId(body.classId);
      if (!classId) throw new Error('Class not found');
      const subjectId = await findSubjectIdByName(body.subject);
      await apiClient.post('/timetable', {
        classId,
        section: body.section,
        week: body.week,
        day: body.day,
        periodId: body.periodId,
        subjectId,
        subject: body.subject,
        teacher: body.teacher,
      });
      const updated = await apiClient
        .get<ApiResponse<BackendTimetable>>(`/timetable/${classId}`, {
          params: { section: body.section, week: body.week },
        })
        .then(unwrapApi);
      return toTimetableRecord(updated, body.classId);
    },
    successMsg: 'Timetable updated successfully',
    errorMsg: 'Failed to update timetable',
    invalidateQueryKeys: [[API, 'grid']],
  });
