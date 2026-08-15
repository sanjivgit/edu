import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { resolveClassId, resolveSectionId } from '@/features/common/services/lookups.service';

export type StudentGender = 'male' | 'female' | 'other';
export type StudentStatus = 'active' | 'inactive' | 'transferred';

export interface StudentRecord {
  id: string;
  rollNo: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  classId: string;
  section: string;
  dob?: string;
  gender?: StudentGender;
  address?: string;
  admissionDate?: string;
  status: StudentStatus;
  parentName?: string;
  createdAt: string;
  updatedAt: string;
}

const API = '/students';

interface BackendStudent {
  id: string;
  rollNo: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  classId: string;
  className?: string;
  sectionId: string | null;
  sectionName?: string;
  parent?: { id: string; name: string; email?: string; phone?: string } | null;
  dob?: string;
  gender?: StudentGender;
  address?: string;
  admissionDate?: string;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
}

function classDisplay(classId: string, className?: string): string {
  const m = (className ?? '').match(/(\d+)/);
  if (m) return m[1];
  return classId;
}

function toStudentRecord(s: BackendStudent): StudentRecord {
  return {
    id: s.id,
    rollNo: s.rollNo,
    name: s.name,
    email: s.email,
    phone: s.phone,
    avatar: s.avatar,
    classId: classDisplay(s.classId, s.className),
    section: s.sectionName ?? '',
    dob: s.dob,
    gender: s.gender,
    address: s.address,
    admissionDate: s.admissionDate,
    status: s.status,
    parentName: s.parent?.name,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export const useGetStudents = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      const res = await apiClient
        .get<ApiResponse<{ items: BackendStudent[] }>>('/students', { params: { limit: 500 } })
        .then(unwrapApi);
      return (res?.items ?? []).map(toStudentRecord).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
  });

export const useGetStudentById = ({ studentId }: { studentId?: string }) =>
  useQuery({
    queryKey: [API, studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const s = await apiClient.get<ApiResponse<BackendStudent>>(`/students/${studentId}`).then(unwrapApi);
      return toStudentRecord(s);
    },
    enabled: !!studentId,
  });

export const useCreateStudent = () =>
  useAppMutation<
    StudentRecord,
    {
      rollNo: string;
      name: string;
      email?: string;
      phone?: string;
      dob?: string;
      gender?: StudentGender;
      address?: string;
      admissionDate?: string;
      status?: StudentStatus;
      classId: string;
      section?: string;
    }
  >({
    mutationFn: async (body) => {
      const classId = await resolveClassId(body.classId);
      if (!classId) throw new Error('Class not found');
      const sectionId = await resolveSectionId(body.classId, body.section);
      const created = await apiClient
        .post<ApiResponse<BackendStudent>>('/students', {
          rollNo: body.rollNo,
          name: body.name,
          email: body.email || undefined,
          phone: body.phone || undefined,
          dob: body.dob || undefined,
          gender: body.gender,
          address: body.address || undefined,
          admissionDate: body.admissionDate || undefined,
          status: body.status ?? 'active',
          classId,
          sectionId,
        })
        .then(unwrapApi);
      return toStudentRecord(created);
    },
    successMsg: 'Student created successfully',
    errorMsg: 'Failed to create student',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateStudent = () =>
  useAppMutation<
    StudentRecord,
    {
      id: string;
      rollNo: string;
      name: string;
      email?: string;
      phone?: string;
      dob?: string;
      gender?: StudentGender;
      address?: string;
      admissionDate?: string;
      status: StudentStatus;
      classId: string;
      section?: string;
    }
  >({
    mutationFn: async (body) => {
      const classId = await resolveClassId(body.classId);
      if (!classId) throw new Error('Class not found');
      const sectionId = await resolveSectionId(body.classId, body.section);
      const updated = await apiClient
        .put<ApiResponse<BackendStudent>>(`/students/${body.id}`, {
          rollNo: body.rollNo,
          name: body.name,
          email: body.email || undefined,
          phone: body.phone || undefined,
          dob: body.dob || undefined,
          gender: body.gender,
          address: body.address || undefined,
          admissionDate: body.admissionDate || undefined,
          status: body.status,
          classId,
          sectionId,
        })
        .then(unwrapApi);
      return toStudentRecord(updated);
    },
    successMsg: 'Student updated successfully',
    errorMsg: 'Failed to update student',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

export const useDeleteStudent = () =>
  useAppMutation<{ id: string }, { id: string }>({
    mutationFn: async (body) => {
      await apiClient.delete(`/students/${body.id}`);
      return { id: body.id };
    },
    successMsg: 'Student deleted successfully',
    errorMsg: 'Failed to delete student',
    invalidateQueryKeys: [[API, 'list']],
  });
