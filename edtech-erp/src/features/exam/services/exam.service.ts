import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { findSubjectIdByName, resolveClassDisplayMap, resolveClassId } from '@/features/common/services/lookups.service';

export type ExamTerm = 'term-1' | 'term-2' | 'final';
export type ExamStatus = 'draft' | 'scheduled' | 'completed';

export interface ExamPaper {
  subject: string;
  date: string;
  startTime: string; // HH:mm
  durationMinutes: number;
  totalMarks: number;
}

export interface ExamRecord {
  id: string;
  name: string;
  term: ExamTerm;
  classId: string;
  section: string;
  status: ExamStatus;
  papers: ExamPaper[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamResultRow {
  id: string;
  examId: string;
  student: string;
  rollNo: string;
  total: number;
  grade: string;
}

const API = '/exam';

interface BackendExamPaper {
  subjectId: string | null;
  subjectName: string | null;
  subject?: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  totalMarks: number;
}

interface BackendExam {
  id: string;
  name: string;
  term: ExamTerm;
  classId: string;
  className?: string;
  section: string | null;
  status: ExamStatus;
  notes: string | null;
  papers?: BackendExamPaper[];
  createdAt: string;
  updatedAt: string;
}

function toExamPaper(p: BackendExamPaper): ExamPaper {
  return {
    subject: p.subjectName ?? p.subject ?? '',
    date: p.date ? new Date(p.date).toISOString().split('T')[0] : '',
    startTime: p.startTime ?? '',
    durationMinutes: Number(p.durationMinutes),
    totalMarks: Number(p.totalMarks),
  };
}

function classDisplay(classId: string, className?: string, classMap?: Map<string, string>): string {
  const m = (className ?? '').match(/(\d+)/);
  if (m) return m[1];
  if (classMap && classMap.size) return classMap.get(classId) ?? classId;
  return classId;
}

function toExamRecord(e: BackendExam, classMap?: Map<string, string>): ExamRecord {
  return {
    id: e.id,
    name: e.name,
    term: e.term,
    classId: classDisplay(e.classId, e.className, classMap),
    section: e.section ?? '',
    status: e.status,
    papers: (e.papers ?? []).map(toExamPaper),
    notes: e.notes ?? '',
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}

export const useGetExams = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      const res = await apiClient
        .get<ApiResponse<{ items: BackendExam[] }>>('/exams', { params: { limit: 500 } })
        .then(unwrapApi);
      const items = res?.items ?? [];
      const classMap = await resolveClassDisplayMap(items.map((i) => i.classId));
      return items.map((i) => toExamRecord(i, classMap)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
  });

export const useGetExamById = ({ examId }: { examId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', examId],
    queryFn: async () => {
      if (!examId) return null;
      const e = await apiClient
        .get<ApiResponse<BackendExam & { class_?: { name: string } }>>(`/exams/${examId}`)
        .then(unwrapApi);
      return toExamRecord({ ...e, className: e.class_?.name });
    },
    enabled: !!examId,
  });

export const useGetExamResults = ({ examId }: { examId?: string }) =>
  useQuery({
    queryKey: [API, 'results', examId],
    queryFn: async () => {
      if (!examId) return [];
      const res = await apiClient
        .get<
          ApiResponse<
            Array<{ id: string; examId: string; student: string; rollNo: string; total: number; grade: string }>
          >
        >(`/exams/${examId}/results`)
        .then(unwrapApi);
      return (res ?? []).map((r) => ({ id: r.id, examId: r.examId, student: r.student, rollNo: r.rollNo, total: r.total, grade: r.grade }));
    },
    enabled: !!examId,
  });

export const useCreateExam = () =>
  useAppMutation<
    ExamRecord,
    {
      name: string;
      term: ExamTerm;
      classId: string;
      section: string;
      papers: ExamPaper[];
      notes?: string;
      status?: ExamStatus;
    }
  >({
    mutationFn: async (body) => {
      const classId = await resolveClassId(body.classId);
      if (!classId) throw new Error('Class not found');
      const papers = await Promise.all(
        body.papers.map(async (p) => ({
          subjectId: await findSubjectIdByName(p.subject),
          subjectName: p.subject,
          date: p.date,
          startTime: p.startTime,
          durationMinutes: Number(p.durationMinutes),
          totalMarks: Number(p.totalMarks),
        })),
      );
      const created = await apiClient
        .post<ApiResponse<BackendExam>>('/exams', {
          name: body.name,
          term: body.term,
          classId,
          section: body.section || undefined,
          status: body.status ?? 'scheduled',
          notes: body.notes ?? undefined,
          papers,
        })
        .then(unwrapApi);
      return toExamRecord(created);
    },
    successMsg: 'Exam scheduled successfully',
    errorMsg: 'Failed to schedule exam',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateExam = () =>
  useAppMutation<
    ExamRecord,
    {
      id: string;
      name: string;
      term: ExamTerm;
      classId: string;
      section: string;
      papers: ExamPaper[];
      notes?: string;
      status: ExamStatus;
    }
  >({
    mutationFn: async (body) => {
      const classId = await resolveClassId(body.classId);
      if (!classId) throw new Error('Class not found');
      const papers = await Promise.all(
        body.papers.map(async (p) => ({
          subjectId: await findSubjectIdByName(p.subject),
          subjectName: p.subject,
          date: p.date,
          startTime: p.startTime,
          durationMinutes: Number(p.durationMinutes),
          totalMarks: Number(p.totalMarks),
        })),
      );
      const updated = await apiClient
        .put<ApiResponse<BackendExam>>(`/exams/${body.id}`, {
          name: body.name,
          term: body.term,
          classId,
          section: body.section || undefined,
          status: body.status,
          notes: body.notes ?? undefined,
          papers,
        })
        .then(unwrapApi);
      return toExamRecord(updated);
    },
    successMsg: 'Exam updated successfully',
    errorMsg: 'Failed to update exam',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail'], [API, 'results']],
  });

export const useDeleteExam = () =>
  useAppMutation<{ id: string }, { id: string }>({
    mutationFn: async (body) => {
      await apiClient.delete(`/exams/${body.id}`);
      return { id: body.id };
    },
    successMsg: 'Exam deleted successfully',
    errorMsg: 'Failed to delete exam',
    invalidateQueryKeys: [[API, 'list']],
  });
