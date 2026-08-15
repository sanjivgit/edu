import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { findTeacherIdByName, resolveClassId } from '@/features/common/services/lookups.service';

export type SubjectCategory = 'core' | 'language' | 'elective' | 'lab' | 'sports' | 'arts';

export interface SubjectRecord {
  id: string;
  name: string;
  code: string;
  category: SubjectCategory;
  classId: string;
  weeklyPeriods: number;
  teacher: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const API = '/subjects';

interface BackendSubject {
  id: string;
  name: string;
  code: string;
  category: SubjectCategory;
  weeklyPeriods: number;
  isActive: boolean;
  classId: string | null;
  teacher?: { id: string; fullName: string } | null;
  teacherId: string | null;
  createdAt: string;
  updatedAt: string;
}

function toSubjectRecord(s: BackendSubject): SubjectRecord {
  return {
    id: s.id,
    name: s.name,
    code: s.code,
    category: s.category,
    classId: s.classId ?? '',
    weeklyPeriods: s.weeklyPeriods,
    teacher: s.teacher?.fullName ?? '',
    isActive: s.isActive,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export const useGetSubjects = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      const res = await apiClient
        .get<ApiResponse<BackendSubject[]>>('/subjects', { params: { limit: 500 } })
        .then(unwrapApi);
      return (res ?? []).map(toSubjectRecord).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
  });

export const useGetSubjectById = ({ subjectId }: { subjectId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', subjectId],
    queryFn: async () => {
      if (!subjectId) return null;
      const s = await apiClient.get<ApiResponse<BackendSubject>>(`/subjects/${subjectId}`).then(unwrapApi);
      return toSubjectRecord(s);
    },
    enabled: !!subjectId,
  });

export const useCreateSubject = () =>
  useAppMutation<SubjectRecord, Omit<SubjectRecord, 'id' | 'createdAt' | 'updatedAt'>>({
    mutationFn: async (body) => {
      const teacherId = await findTeacherIdByName(body.teacher);
      const classId = await resolveClassId(body.classId);
      const created = await apiClient
        .post<ApiResponse<BackendSubject>>('/subjects', {
          name: body.name,
          code: body.code,
          category: body.category,
          weeklyPeriods: Number(body.weeklyPeriods) || 4,
          classId,
          teacherId,
          isActive: body.isActive ?? true,
        })
        .then(unwrapApi);
      return toSubjectRecord(created);
    },
    successMsg: 'Subject created successfully',
    errorMsg: 'Failed to create subject',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateSubject = () =>
  useAppMutation<SubjectRecord, { id: string } & Partial<Omit<SubjectRecord, 'id' | 'createdAt'>>>({
    mutationFn: async (body) => {
      const teacherId = await findTeacherIdByName(body.teacher);
      const classId = await resolveClassId(body.classId);
      const updated = await apiClient
        .put<ApiResponse<BackendSubject>>(`/subjects/${body.id}`, {
          name: body.name,
          code: body.code,
          category: body.category,
          weeklyPeriods: body.weeklyPeriods,
          classId,
          teacherId,
          isActive: body.isActive,
        })
        .then(unwrapApi);
      return toSubjectRecord(updated);
    },
    successMsg: 'Subject updated successfully',
    errorMsg: 'Failed to update subject',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

export const useDeleteSubject = () =>
  useAppMutation<{ id: string }, { id: string }>({
    mutationFn: async (body) => {
      await apiClient.delete(`/subjects/${body.id}`);
      return { id: body.id };
    },
    successMsg: 'Subject deleted successfully',
    errorMsg: 'Failed to delete subject',
    invalidateQueryKeys: [[API, 'list']],
  });
