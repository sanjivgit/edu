import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { mockDelay } from '@/shared/utils';

export type AssessmentType = 'quiz' | 'assignment' | 'unit-test' | 'project';
export type AssessmentStatus = 'draft' | 'published' | 'closed';

export interface AssessmentRecord {
  id: string;
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
let assessmentStore: AssessmentRecord[] = [];
let resultsStore: AssessmentResultRow[] = [];

function ensureSeed() {
  if (assessmentStore.length) return;
  const now = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];
  assessmentStore = [
    {
      id: 'ASM-1',
      title: 'Math Quiz - Algebra',
      type: 'quiz',
      classId: '10',
      section: 'A',
      subject: 'Mathematics',
      totalMarks: 20,
      date: today,
      instructions: 'Attempt all questions. No negative marking.',
      status: 'published',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'ASM-2',
      title: 'Science Unit Test - Chapter 3',
      type: 'unit-test',
      classId: '10',
      section: 'A',
      subject: 'Science',
      totalMarks: 50,
      date: today,
      instructions: '',
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    },
  ];

  resultsStore = [
    { id: 'RES-1', assessmentId: 'ASM-1', student: 'Aarav Sharma', rollNo: '010', marks: 18, grade: 'A' },
    { id: 'RES-2', assessmentId: 'ASM-1', student: 'Priya Patel', rollNo: '011', marks: 16, grade: 'A' },
    { id: 'RES-3', assessmentId: 'ASM-1', student: 'Riya Singh', rollNo: '012', marks: 12, grade: 'B' },
  ];
}

export const useGetAssessments = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      await mockDelay(150);
      ensureSeed();
      return [...assessmentStore].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
  });

export const useGetAssessmentById = ({ assessmentId }: { assessmentId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', assessmentId],
    queryFn: async () => {
      await mockDelay(120);
      ensureSeed();
      return assessmentStore.find((a) => a.id === assessmentId) ?? null;
    },
    enabled: !!assessmentId,
  });

export const useGetAssessmentResults = ({ assessmentId }: { assessmentId?: string }) =>
  useQuery({
    queryKey: [API, 'results', assessmentId],
    queryFn: async () => {
      await mockDelay(140);
      ensureSeed();
      return resultsStore.filter((r) => r.assessmentId === assessmentId);
    },
    enabled: !!assessmentId,
  });

export const useCreateAssessment = () =>
  useAppMutation({
    mutationFn: async (body: Omit<AssessmentRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'> & { status?: AssessmentStatus }) => {
      await mockDelay(220);
      ensureSeed();
      const now = new Date().toISOString();
      const created: AssessmentRecord = {
        id: `ASM-${assessmentStore.length + 1}`,
        status: body.status ?? 'published',
        createdAt: now,
        updatedAt: now,
        ...body,
      };
      assessmentStore = [created, ...assessmentStore];
      return created;
    },
    successMsg: 'Assessment created successfully',
    errorMsg: 'Failed to create assessment',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateAssessment = () =>
  useAppMutation({
    mutationFn: async (body: { id: string } & Partial<Omit<AssessmentRecord, 'id' | 'createdAt'>>) => {
      await mockDelay(200);
      ensureSeed();
      const current = assessmentStore.find((a) => a.id === body.id);
      if (!current) throw new Error('Assessment not found');
      const next: AssessmentRecord = { ...current, ...body, updatedAt: new Date().toISOString() };
      assessmentStore = assessmentStore.map((a) => (a.id === body.id ? next : a));
      return next;
    },
    successMsg: 'Assessment updated successfully',
    errorMsg: 'Failed to update assessment',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail'], [API, 'results']],
  });

export const useDeleteAssessment = () =>
  useAppMutation({
    mutationFn: async (body: { id: string }) => {
      await mockDelay(160);
      ensureSeed();
      assessmentStore = assessmentStore.filter((a) => a.id !== body.id);
      resultsStore = resultsStore.filter((r) => r.assessmentId !== body.id);
      return { id: body.id };
    },
    successMsg: 'Assessment deleted successfully',
    errorMsg: 'Failed to delete assessment',
    invalidateQueryKeys: [[API, 'list']],
  });

