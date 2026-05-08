import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { mockDelay } from '@/shared/utils';

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
let examStore: ExamRecord[] = [];
let examResultsStore: ExamResultRow[] = [];

function ensureSeed() {
  if (examStore.length) return;
  const now = new Date().toISOString();
  const today = new Date();
  const iso = (d: Date) => d.toISOString().split('T')[0];
  const d1 = iso(today);
  const d2 = iso(new Date(today.getTime() + 1000 * 60 * 60 * 24 * 1));
  const d3 = iso(new Date(today.getTime() + 1000 * 60 * 60 * 24 * 2));

  examStore = [
    {
      id: 'EX-1',
      name: 'Term 1 Examination',
      term: 'term-1',
      classId: '10',
      section: 'A',
      status: 'scheduled',
      papers: [
        { subject: 'Mathematics', date: d1, startTime: '09:30', durationMinutes: 90, totalMarks: 100 },
        { subject: 'Science', date: d2, startTime: '09:30', durationMinutes: 90, totalMarks: 100 },
        { subject: 'English', date: d3, startTime: '09:30', durationMinutes: 90, totalMarks: 100 },
      ],
      notes: 'Report 20 minutes early. Bring admit card.',
      createdAt: now,
      updatedAt: now,
    },
  ];

  examResultsStore = [
    { id: 'EXR-1', examId: 'EX-1', student: 'Aarav Sharma', rollNo: '010', total: 276, grade: 'A' },
    { id: 'EXR-2', examId: 'EX-1', student: 'Priya Patel', rollNo: '011', total: 264, grade: 'A' },
    { id: 'EXR-3', examId: 'EX-1', student: 'Riya Singh', rollNo: '012', total: 230, grade: 'B' },
  ];
}

export const useGetExams = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      await mockDelay(150);
      ensureSeed();
      return [...examStore].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
  });

export const useGetExamById = ({ examId }: { examId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', examId],
    queryFn: async () => {
      await mockDelay(120);
      ensureSeed();
      return examStore.find((e) => e.id === examId) ?? null;
    },
    enabled: !!examId,
  });

export const useGetExamResults = ({ examId }: { examId?: string }) =>
  useQuery({
    queryKey: [API, 'results', examId],
    queryFn: async () => {
      await mockDelay(140);
      ensureSeed();
      return examResultsStore.filter((r) => r.examId === examId);
    },
    enabled: !!examId,
  });

export const useCreateExam = () =>
  useAppMutation({
    mutationFn: async (body: Omit<ExamRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'> & { status?: ExamStatus }) => {
      await mockDelay(220);
      ensureSeed();
      const now = new Date().toISOString();
      const created: ExamRecord = {
        id: `EX-${examStore.length + 1}`,
        status: body.status ?? 'scheduled',
        createdAt: now,
        updatedAt: now,
        ...body,
      };
      examStore = [created, ...examStore];
      return created;
    },
    successMsg: 'Exam scheduled successfully',
    errorMsg: 'Failed to schedule exam',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateExam = () =>
  useAppMutation({
    mutationFn: async (body: { id: string } & Partial<Omit<ExamRecord, 'id' | 'createdAt'>>) => {
      await mockDelay(200);
      ensureSeed();
      const current = examStore.find((e) => e.id === body.id);
      if (!current) throw new Error('Exam not found');
      const next: ExamRecord = { ...current, ...body, updatedAt: new Date().toISOString() };
      examStore = examStore.map((e) => (e.id === body.id ? next : e));
      return next;
    },
    successMsg: 'Exam updated successfully',
    errorMsg: 'Failed to update exam',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail'], [API, 'results']],
  });

export const useDeleteExam = () =>
  useAppMutation({
    mutationFn: async (body: { id: string }) => {
      await mockDelay(160);
      ensureSeed();
      examStore = examStore.filter((e) => e.id !== body.id);
      examResultsStore = examResultsStore.filter((r) => r.examId !== body.id);
      return { id: body.id };
    },
    successMsg: 'Exam deleted successfully',
    errorMsg: 'Failed to delete exam',
    invalidateQueryKeys: [[API, 'list']],
  });

