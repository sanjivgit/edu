import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { mockDelay } from '@/shared/utils';

export type HomeworkStatus = 'draft' | 'assigned' | 'closed';

export interface HomeworkRecord {
  id: string;
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
let homeworkStore: HomeworkRecord[] = [];
let submissionStore: HomeworkSubmission[] = [];

function ensureSeed() {
  if (homeworkStore.length) return;
  const today = new Date();
  const iso = (d: Date) => d.toISOString().split('T')[0];
  const now = new Date().toISOString();
  const assigned = iso(today);
  const due = iso(new Date(today.getTime() + 1000 * 60 * 60 * 24 * 2));

  homeworkStore = [
    {
      id: 'HW-1',
      title: 'Algebra Practice Worksheet',
      description: 'Solve Q1–Q20 from the worksheet. Show steps clearly.',
      classId: '10',
      section: 'A',
      subject: 'Mathematics',
      assignedDate: assigned,
      dueDate: due,
      status: 'assigned',
      attachments: ['worksheet-algebra.pdf'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'HW-2',
      title: 'Science Lab Report',
      description: 'Write a 1-page report on the recent lab experiment (Aim, Procedure, Observations, Conclusion).',
      classId: '10',
      section: 'A',
      subject: 'Science',
      assignedDate: assigned,
      dueDate: due,
      status: 'draft',
      attachments: [],
      createdAt: now,
      updatedAt: now,
    },
  ];

  submissionStore = [
    { id: 'SUBM-1', homeworkId: 'HW-1', student: 'Aarav Sharma', rollNo: '010', submittedAt: new Date().toISOString(), status: 'submitted' },
    { id: 'SUBM-2', homeworkId: 'HW-1', student: 'Priya Patel', rollNo: '011', submittedAt: new Date().toISOString(), status: 'late' },
    { id: 'SUBM-3', homeworkId: 'HW-1', student: 'Riya Singh', rollNo: '012', submittedAt: '', status: 'missing' },
  ];
}

export const useGetHomework = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      await mockDelay(150);
      ensureSeed();
      return [...homeworkStore].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
  });

export const useGetHomeworkById = ({ homeworkId }: { homeworkId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', homeworkId],
    queryFn: async () => {
      await mockDelay(120);
      ensureSeed();
      return homeworkStore.find((h) => h.id === homeworkId) ?? null;
    },
    enabled: !!homeworkId,
  });

export const useGetHomeworkSubmissions = ({ homeworkId }: { homeworkId?: string }) =>
  useQuery({
    queryKey: [API, 'submissions', homeworkId],
    queryFn: async () => {
      await mockDelay(140);
      ensureSeed();
      return submissionStore.filter((s) => s.homeworkId === homeworkId);
    },
    enabled: !!homeworkId,
  });

export const useCreateHomework = () =>
  useAppMutation({
    mutationFn: async (body: Omit<HomeworkRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'> & { status?: HomeworkStatus }) => {
      await mockDelay(220);
      ensureSeed();
      const now = new Date().toISOString();
      const created: HomeworkRecord = {
        id: `HW-${homeworkStore.length + 1}`,
        status: body.status ?? 'assigned',
        createdAt: now,
        updatedAt: now,
        ...body,
      };
      homeworkStore = [created, ...homeworkStore];
      return created;
    },
    successMsg: 'Homework created successfully',
    errorMsg: 'Failed to create homework',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateHomework = () =>
  useAppMutation({
    mutationFn: async (body: { id: string } & Partial<Omit<HomeworkRecord, 'id' | 'createdAt'>>) => {
      await mockDelay(200);
      ensureSeed();
      const current = homeworkStore.find((h) => h.id === body.id);
      if (!current) throw new Error('Homework not found');
      const next: HomeworkRecord = { ...current, ...body, updatedAt: new Date().toISOString() };
      homeworkStore = homeworkStore.map((h) => (h.id === body.id ? next : h));
      return next;
    },
    successMsg: 'Homework updated successfully',
    errorMsg: 'Failed to update homework',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail'], [API, 'submissions']],
  });

export const useDeleteHomework = () =>
  useAppMutation({
    mutationFn: async (body: { id: string }) => {
      await mockDelay(160);
      ensureSeed();
      homeworkStore = homeworkStore.filter((h) => h.id !== body.id);
      submissionStore = submissionStore.filter((s) => s.homeworkId !== body.id);
      return { id: body.id };
    },
    successMsg: 'Homework deleted successfully',
    errorMsg: 'Failed to delete homework',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useCloseHomework = () =>
  useAppMutation({
    mutationFn: async (body: { id: string }) => {
      await mockDelay(180);
      ensureSeed();
      const current = homeworkStore.find((h) => h.id === body.id);
      if (!current) throw new Error('Homework not found');
      const next: HomeworkRecord = { ...current, status: 'closed', updatedAt: new Date().toISOString() };
      homeworkStore = homeworkStore.map((h) => (h.id === body.id ? next : h));
      return next;
    },
    successMsg: 'Homework closed successfully',
    errorMsg: 'Failed to close homework',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

