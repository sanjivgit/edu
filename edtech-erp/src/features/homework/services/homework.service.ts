import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { findSubjectIdByName, resolveClassDisplayMap, resolveClassId } from '@/features/common/services/lookups.service';

export type HomeworkStatus = 'draft' | 'assigned' | 'closed';

export interface HomeworkRecord {
  id: string;
  academicYearId?: string | null;
  academicYearName?: string;
  title: string;
  description: string;
  classId: string;
  section: string;
  subject: string;
  assignedDate: string;
  dueDate: string;
  status: HomeworkStatus;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  student: string;
  rollNo: string;
  submittedAt: string;
  status: 'submitted' | 'missing' | 'late';
}

const API = '/homework';

interface BackendHomework {
  id: string;
  academicYearId?: string | null;
  academicYear?: { id: string; name: string } | null;
  title: string;
  description: string;
  classId: string;
  className?: string;
  section: string | null;
  subjectId: string | null;
  subject?: { id: string; name: string } | null;
  subjectName?: string;
  assignedDate: string;
  dueDate: string;
  status: HomeworkStatus;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

function classDisplay(classId: string, className?: string, classMap?: Map<string, string>): string {
  const m = (className ?? '').match(/(\d+)/);
  if (m) return m[1];
  if (classMap && classMap.size) return classMap.get(classId) ?? classId;
  return classId;
}

function toHomeworkRecord(h: BackendHomework, classMap?: Map<string, string>): HomeworkRecord {
  return {
    id: h.id,
    academicYearId: h.academicYearId ?? h.academicYear?.id ?? null,
    academicYearName: h.academicYear?.name ?? '',
    title: h.title,
    description: h.description ?? '',
    classId: classDisplay(h.classId, h.className, classMap),
    section: h.section ?? '',
    subject: h.subject?.name ?? h.subjectName ?? '',
    assignedDate: h.assignedDate,
    dueDate: h.dueDate,
    status: h.status,
    attachments: h.attachments ?? [],
    createdAt: h.createdAt,
    updatedAt: h.updatedAt,
  };
}

export const useGetHomework = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      const res = await apiClient
        .get<ApiResponse<BackendHomework[]>>('/homework', { params: { limit: 500 } })
        .then(unwrapApi);
      const items = res ?? [];
      const classMap = await resolveClassDisplayMap(items.map((i) => i.classId));
      return items.map((i) => toHomeworkRecord(i, classMap)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
  });

export const useGetHomeworkById = ({ homeworkId }: { homeworkId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', homeworkId],
    queryFn: async () => {
      if (!homeworkId) return null;
      const h = await apiClient
        .get<ApiResponse<BackendHomework & { class_?: { name: string } }>>(`/homework/${homeworkId}`)
        .then(unwrapApi);
      return toHomeworkRecord({ ...h, className: h.class_?.name });
    },
    enabled: !!homeworkId,
  });

export const useGetHomeworkSubmissions = ({ homeworkId }: { homeworkId?: string }) =>
  useQuery({
    queryKey: [API, 'submissions', homeworkId],
    queryFn: async () => {
      if (!homeworkId) return [];
      const res = await apiClient
        .get<
          ApiResponse<
            Array<{
              id: string;
              homeworkId: string;
              student: { name: string; rollNo: string };
              submittedAt: string;
              status: 'submitted' | 'missing' | 'late';
            }>
          >
        >(`/homework/${homeworkId}/submissions`)
        .then(unwrapApi);
      return (res ?? []).map((s) => ({
        id: s.id,
        homeworkId: s.homeworkId,
        student: s.student?.name ?? 'Unknown',
        rollNo: s.student?.rollNo ?? '',
        submittedAt: s.submittedAt ?? '',
        status: s.status,
      }));
    },
    enabled: !!homeworkId,
  });

export const useCreateHomework = () =>
  useAppMutation<
    HomeworkRecord,
    {
      title: string;
      description: string;
      classId: string;
      section: string;
      subject: string;
      assignedDate: string;
      dueDate: string;
      academicYearId?: string | null;
      status?: HomeworkStatus;
      attachments?: string[];
    }
  >({
    mutationFn: async (body) => {
      const classId = await resolveClassId(body.classId);
      if (!classId) throw new Error('Class not found');
      const subjectId = await findSubjectIdByName(body.subject);
      const created = await apiClient
        .post<ApiResponse<BackendHomework>>('/homework', {
          title: body.title,
          description: body.description,
          classId,
          section: body.section || undefined,
          subjectId,
          assignedDate: body.assignedDate,
          dueDate: body.dueDate,
          academicYearId: body.academicYearId || undefined,
          status: body.status ?? 'assigned',
          attachments: body.attachments ?? [],
        })
        .then(unwrapApi);
      return toHomeworkRecord(created);
    },
    successMsg: 'Homework created successfully',
    errorMsg: 'Failed to create homework',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateHomework = () =>
  useAppMutation<
    HomeworkRecord,
    {
      id: string;
      title: string;
      description: string;
      classId: string;
      section: string;
      subject: string;
      assignedDate: string;
      dueDate: string;
      academicYearId?: string | null;
      status: HomeworkStatus;
      attachments?: string[];
    }
  >({
    mutationFn: async (body) => {
      const classId = await resolveClassId(body.classId);
      if (!classId) throw new Error('Class not found');
      const subjectId = await findSubjectIdByName(body.subject);
      const updated = await apiClient
        .put<ApiResponse<BackendHomework>>(`/homework/${body.id}`, {
          title: body.title,
          description: body.description,
          classId,
          section: body.section || undefined,
          subjectId,
          assignedDate: body.assignedDate,
          dueDate: body.dueDate,
          academicYearId: body.academicYearId || undefined,
          status: body.status,
          attachments: body.attachments ?? [],
        })
        .then(unwrapApi);
      return toHomeworkRecord(updated);
    },
    successMsg: 'Homework updated successfully',
    errorMsg: 'Failed to update homework',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail'], [API, 'submissions']],
  });

export const useDeleteHomework = () =>
  useAppMutation<{ id: string }, { id: string }>({
    mutationFn: async (body) => {
      await apiClient.delete(`/homework/${body.id}`);
      return { id: body.id };
    },
    successMsg: 'Homework deleted successfully',
    errorMsg: 'Failed to delete homework',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useCloseHomework = () =>
  useAppMutation<HomeworkRecord, { id: string }>({
    mutationFn: async (body) => {
      const updated = await apiClient
        .patch<ApiResponse<BackendHomework>>(`/homework/${body.id}/close`)
        .then(unwrapApi);
      return toHomeworkRecord(updated);
    },
    successMsg: 'Homework closed successfully',
    errorMsg: 'Failed to close homework',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });
