import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';

export interface ScoreCardItem {
  examPaperId: string;
  subjectName: string;
  totalMarks: number;
  obtainedMarks: number;
  grade?: string | null;
  remarks?: string | null;
}

export interface ScoreCardRecord {
  id: string;
  examId: string;
  studentId: string;
  studentName?: string;
  rollNo?: string;
  classId: string;
  className?: string;
  academicYearId?: string | null;
  academicYearName?: string;
  status: 'draft' | 'published';
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade?: string | null;
  publishedAt?: string | null;
  items: ScoreCardItem[];
  examName?: string;
  createdAt: string;
}

interface BackendScoreCardItem {
  examPaperId: string;
  subjectName: string;
  totalMarks: number;
  obtainedMarks: number;
  grade?: string | null;
  remarks?: string | null;
}

interface BackendScoreCard {
  id: string;
  examId: string;
  studentId: string;
  student?: { name: string; rollNo?: string };
  class_?: { name: string };
  classId?: string;
  academicYear?: { id: string; name: string };
  academicYearId?: string | null;
  items: BackendScoreCardItem[];
  status: 'draft' | 'published';
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade?: string | null;
  publishedAt?: string | null;
  examName?: string;
  createdAt: string;
  updatedAt?: string;
}

function toScoreCardRecord(b: BackendScoreCard): ScoreCardRecord {
  return {
    id: b.id,
    examId: b.examId,
    studentId: b.studentId,
    studentName: b.student?.name,
    rollNo: b.student?.rollNo,
    classId: b.classId ?? '',
    className: b.class_?.name,
    academicYearId: b.academicYearId ?? b.academicYear?.id ?? null,
    academicYearName: b.academicYear?.name,
    status: b.status,
    totalMarks: Number(b.totalMarks) || 0,
    obtainedMarks: Number(b.obtainedMarks) || 0,
    percentage: Number(b.percentage) || 0,
    grade: b.grade,
    publishedAt: b.publishedAt,
    items: (b.items ?? []).map((i) => ({
      examPaperId: i.examPaperId,
      subjectName: i.subjectName,
      totalMarks: Number(i.totalMarks),
      obtainedMarks: Number(i.obtainedMarks),
      grade: i.grade,
      remarks: i.remarks,
    })),
    examName: b.examName,
    createdAt: b.createdAt,
  };
}

const API = '/score-cards';

export const useGetScoreCardsByExam = (examId: string) =>
  useQuery({
    queryKey: [API, 'exam', examId],
    queryFn: async () => {
      const res = await apiClient
        .get<ApiResponse<BackendScoreCard[]>>(`/score-cards/exam/${examId}`)
        .then(unwrapApi);
      return (res ?? []).map(toScoreCardRecord);
    },
    enabled: !!examId,
  });

export const useGetScoreCardByStudentAndExam = (examId: string, studentId: string) =>
  useQuery({
    queryKey: [API, 'student-exam', examId, studentId],
    queryFn: async () => {
      const res = await apiClient
        .get<ApiResponse<BackendScoreCard>>(`/score-cards/exam/${examId}/student/${studentId}`)
        .then(unwrapApi);
      return res ? toScoreCardRecord(res) : null;
    },
    enabled: !!examId && !!studentId,
  });

export const useGetScoreCardsByStudent = (studentId: string, academicYearId?: string) =>
  useQuery({
    queryKey: [API, 'student', studentId, academicYearId],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (academicYearId) params.academicYearId = academicYearId;
      const res = await apiClient
        .get<ApiResponse<BackendScoreCard[]>>(`/score-cards/student/${studentId}`, { params })
        .then(unwrapApi);
      return (res ?? []).map(toScoreCardRecord);
    },
    enabled: !!studentId,
  });

export const useSaveScoreCard = () =>
  useAppMutation<ScoreCardRecord, {
    examId: string;
    studentId: string;
    classId: string;
    academicYearId?: string;
    items: ScoreCardItem[];
  }>({
    mutationFn: async (body) => {
      const created = await apiClient
        .post<ApiResponse<BackendScoreCard>>('/score-cards', {
          examId: body.examId,
          studentId: body.studentId,
          classId: body.classId,
          academicYearId: body.academicYearId,
          items: body.items,
        })
        .then(unwrapApi);
      return toScoreCardRecord(created);
    },
    successMsg: 'Score card saved successfully',
    errorMsg: 'Failed to save score card',
    invalidateQueryKeys: [[API]],
  });

export const usePublishScoreCards = () =>
  useAppMutation<{ published: number }, { scoreCardIds: string[] }>({
    mutationFn: async (body) => {
      const res = await apiClient
        .post<ApiResponse<{ published: number }>>('/score-cards/publish', {
          scoreCardIds: body.scoreCardIds,
        })
        .then(unwrapApi);
      return res ?? { published: 0 };
    },
    successMsg: 'Score cards published successfully',
    errorMsg: 'Failed to publish score cards',
    invalidateQueryKeys: [[API]],
  });

export const useDeleteScoreCard = () =>
  useAppMutation<{ id: string }, { id: string }>({
    mutationFn: async (body) => {
      await apiClient.delete(`/score-cards/${body.id}`);
      return { id: body.id };
    },
    successMsg: 'Score card deleted successfully',
    errorMsg: 'Failed to delete score card',
    invalidateQueryKeys: [[API]],
  });
