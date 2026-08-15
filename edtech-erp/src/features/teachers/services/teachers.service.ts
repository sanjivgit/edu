import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';

export interface TeacherRecord {
  id: string;
  fullName: string;
  employeeCode: string;
  subject: string;
  phone: string;
  email: string;
  classTeacherOf?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const API = '/teachers';

interface BackendTeacher {
  id: string;
  fullName: string;
  employeeCode: string;
  subject: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  classTeacherOf?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

function toTeacherRecord(t: BackendTeacher): TeacherRecord {
  return {
    id: t.id,
    fullName: t.fullName,
    employeeCode: t.employeeCode,
    subject: t.subject,
    phone: t.phone,
    email: t.email,
    classTeacherOf: t.classTeacherOf?.name ?? '',
    status: t.status,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

export const useGetTeachers = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      const res = await apiClient
        .get<ApiResponse<BackendTeacher[]>>('/teachers', { params: { limit: 500 } })
        .then(unwrapApi);
      return (res ?? []).map(toTeacherRecord).sort((a, b) => a.fullName.localeCompare(b.fullName));
    },
  });

export const useGetTeacherById = ({ teacherId }: { teacherId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', teacherId],
    queryFn: async () => {
      if (!teacherId) return null;
      const t = await apiClient.get<ApiResponse<BackendTeacher>>(`/teachers/${teacherId}`).then(unwrapApi);
      return toTeacherRecord(t);
    },
    enabled: !!teacherId,
  });

export const useCreateTeacher = () =>
  useAppMutation<TeacherRecord, Omit<TeacherRecord, 'id' | 'createdAt' | 'updatedAt'>>({
    mutationFn: async (body) => {
      const created = await apiClient
        .post<ApiResponse<BackendTeacher>>('/teachers', {
          fullName: body.fullName,
          employeeCode: body.employeeCode,
          subject: body.subject,
          phone: body.phone,
          email: body.email,
          status: body.status ?? 'active',
        })
        .then(unwrapApi);
      return toTeacherRecord(created);
    },
    successMsg: 'Teacher created successfully',
    errorMsg: 'Failed to create teacher',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateTeacher = () =>
  useAppMutation<TeacherRecord, { id: string } & Partial<Omit<TeacherRecord, 'id' | 'createdAt'>>>({
    mutationFn: async (body) => {
      const updated = await apiClient
        .put<ApiResponse<BackendTeacher>>(`/teachers/${body.id}`, {
          fullName: body.fullName,
          employeeCode: body.employeeCode,
          subject: body.subject,
          phone: body.phone,
          email: body.email,
          status: body.status,
        })
        .then(unwrapApi);
      return toTeacherRecord(updated);
    },
    successMsg: 'Teacher updated successfully',
    errorMsg: 'Failed to update teacher',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

export const useDeleteTeacher = () =>
  useAppMutation<{ id: string }, { id: string }>({
    mutationFn: async (body) => {
      await apiClient.delete(`/teachers/${body.id}`);
      return { id: body.id };
    },
    successMsg: 'Teacher deleted successfully',
    errorMsg: 'Failed to delete teacher',
    invalidateQueryKeys: [[API, 'list']],
  });
