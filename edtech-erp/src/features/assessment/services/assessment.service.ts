import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { findSubjectIdByName, resolveClassDisplayMap, resolveClassId } from '@/features/common/services/lookups.service';

export type AssessmentType = 'quiz' | 'assignment' | 'unit-test' | 'project';
export type AssessmentStatus = 'draft' | 'published' | 'closed';

export interface AssessmentRecord {
  id: string;
  academicYearId?: string | null;
  academicYearName?: string;
  title: string;
  type: AssessmentType;
  classId: string;
  section: string;
  subject: string;
  totalMarks: number;
  date: string;
  instructions?: string;
  status: AssessmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentResultRow {
  id: string;
  assessmentId: string;
  student: string;
  rollNo: string;
  marks: number;
  grade: string;
}

const API = '/assessment';

interface BackendAssessment {
  id: string;
  academicYearId?: string | null;
  academicYear?: { id: string; name: string } | null;
  title: string;
  type: AssessmentType;
  classId: string;
  className?: string;
  section: string | null;
  subjectId: string | null;
  subject?: { id: string; name: string } | null;
  subjectName?: string;
  totalMarks: number;
  date: string;
  instructions: string | null;
  status: AssessmentStatus;
  createdAt: string;
  updatedAt: string;
}

function classDisplay(classId: string, className?: string, classMap?: Map<string, string>): string {
  const m = (className ?? '').match(/(\d+)/);
  if (m) return m[1];
  if (classMap && classMap.size) return classMap.get(classId) ?? classId;
  return classId;
}

function toAssessmentRecord(a: BackendAssessment, classMap?: Map<string, string>): AssessmentRecord {
  return {
    id: a.id,
    academicYearId: a.academicYearId ?? a.academicYear?.id ?? null,
    academicYearName: a.academicYear?.name ?? '',
    title: a.title,
    type: a.type,
    classId: classDisplay(a.classId, a.className, classMap),
    section: a.section ?? '',
    subject: a.subject?.name ?? a.subjectName ?? '',
    totalMarks: Number(a.totalMarks),
    date: a.date,
    instructions: a.instructions ?? '',
    status: a.status,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}

export const useGetAssessments = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      const res = await apiClient
        .get<ApiResponse<BackendAssessment[]>>('/assessments', { params: { limit: 500 } })
        .then(unwrapApi);
      const items = res ?? [];
      const classMap = await resolveClassDisplayMap(items.map((i) => i.classId));
      return items.map((i) => toAssessmentRecord(i, classMap)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
  });

export const useGetAssessmentById = ({ assessmentId }: { assessmentId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', assessmentId],
    queryFn: async () => {
      if (!assessmentId) return null;
      const a = await apiClient
        .get<ApiResponse<BackendAssessment & { class_?: { name: string } }>>(`/assessments/${assessmentId}`)
        .then(unwrapApi);
      return toAssessmentRecord({ ...a, className: a.class_?.name });
    },
    enabled: !!assessmentId,
  });

export const useGetAssessmentResults = ({ assessmentId }: { assessmentId?: string }) =>
  useQuery({
    queryKey: [API, 'results', assessmentId],
    queryFn: async () => {
      if (!assessmentId) return [];
      const res = await apiClient
        .get<
          ApiResponse<
            Array<{
              id: string;
              assessmentId: string;
              student: string;
              rollNo: string;
              marks: number;
              grade: string;
            }>
          >
        >(`/assessments/${assessmentId}/results`)
        .then(unwrapApi);
      return (res ?? []).map((r) => ({ id: r.id, assessmentId: r.assessmentId, student: r.student, rollNo: r.rollNo, marks: r.marks, grade: r.grade }));
    },
    enabled: !!assessmentId,
  });

export const useCreateAssessment = () =>
  useAppMutation<
    AssessmentRecord,
    {
      title: string;
      type: AssessmentType;
      classId: string;
      section: string;
      subject: string;
      totalMarks: number;
      date: string;
      instructions?: string;
      academicYearId?: string | null;
      status?: AssessmentStatus;
    }
  >({
    mutationFn: async (body) => {
      const classId = await resolveClassId(body.classId);
      if (!classId) throw new Error('Class not found');
      const subjectId = await findSubjectIdByName(body.subject);
      const created = await apiClient
        .post<ApiResponse<BackendAssessment>>('/assessments', {
          title: body.title,
          type: body.type,
          classId,
          section: body.section || undefined,
          subjectId,
          totalMarks: Number(body.totalMarks),
          date: body.date,
          instructions: body.instructions || undefined,
          academicYearId: body.academicYearId || undefined,
          status: body.status ?? 'draft',
        })
        .then(unwrapApi);
      return toAssessmentRecord(created);
    },
    successMsg: 'Assessment created successfully',
    errorMsg: 'Failed to create assessment',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateAssessment = () =>
  useAppMutation<
    AssessmentRecord,
    {
      id: string;
      title: string;
      type: AssessmentType;
      classId: string;
      section: string;
      subject: string;
      totalMarks: number;
      date: string;
      instructions?: string;
      academicYearId?: string | null;
      status: AssessmentStatus;
    }
  >({
    mutationFn: async (body) => {
      const classId = await resolveClassId(body.classId);
      if (!classId) throw new Error('Class not found');
      const subjectId = await findSubjectIdByName(body.subject);
      const updated = await apiClient
        .put<ApiResponse<BackendAssessment>>(`/assessments/${body.id}`, {
          title: body.title,
          type: body.type,
          classId,
          section: body.section || undefined,
          subjectId,
          totalMarks: Number(body.totalMarks),
          date: body.date,
          instructions: body.instructions || undefined,
          academicYearId: body.academicYearId || undefined,
          status: body.status,
        })
        .then(unwrapApi);
      return toAssessmentRecord(updated);
    },
    successMsg: 'Assessment updated successfully',
    errorMsg: 'Failed to update assessment',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail'], [API, 'results']],
  });

export const useDeleteAssessment = () =>
  useAppMutation<{ id: string }, { id: string }>({
    mutationFn: async (body) => {
      await apiClient.delete(`/assessments/${body.id}`);
      return { id: body.id };
    },
    successMsg: 'Assessment deleted successfully',
    errorMsg: 'Failed to delete assessment',
    invalidateQueryKeys: [[API, 'list']],
  });
