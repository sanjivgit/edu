import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { mockDelay } from '@/shared/utils';

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
let subjectStore: SubjectRecord[] = [];

function ensureSeed() {
  if (subjectStore.length) return;
  const now = new Date().toISOString();
  subjectStore = [
    { id: 'SUB-1', name: 'Mathematics', code: 'MATH-10', category: 'core', classId: '10', weeklyPeriods: 6, teacher: 'Mr. Verma', isActive: true, createdAt: now, updatedAt: now },
    { id: 'SUB-2', name: 'Science', code: 'SCI-10', category: 'core', classId: '10', weeklyPeriods: 5, teacher: 'Ms. Joshi', isActive: true, createdAt: now, updatedAt: now },
    { id: 'SUB-3', name: 'English', code: 'ENG-10', category: 'language', classId: '10', weeklyPeriods: 4, teacher: 'Mr. Iyer', isActive: true, createdAt: now, updatedAt: now },
    { id: 'SUB-4', name: 'Computer', code: 'CS-10', category: 'lab', classId: '10', weeklyPeriods: 2, teacher: 'Mr. Shah', isActive: true, createdAt: now, updatedAt: now },
    { id: 'SUB-5', name: 'Art', code: 'ART-10', category: 'arts', classId: '10', weeklyPeriods: 1, teacher: 'Ms. Patel', isActive: true, createdAt: now, updatedAt: now },
  ];
}

export const useGetSubjects = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      await mockDelay(150);
      ensureSeed();
      return [...subjectStore].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
  });

export const useGetSubjectById = ({ subjectId }: { subjectId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', subjectId],
    queryFn: async () => {
      await mockDelay(120);
      ensureSeed();
      return subjectStore.find((s) => s.id === subjectId) ?? null;
    },
    enabled: !!subjectId,
  });

export const useCreateSubject = () =>
  useAppMutation({
    mutationFn: async (body: Omit<SubjectRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
      await mockDelay(200);
      ensureSeed();
      const id = `SUB-${subjectStore.length + 1}`;
      const now = new Date().toISOString();
      const created: SubjectRecord = { id, ...body, createdAt: now, updatedAt: now };
      subjectStore = [created, ...subjectStore];
      return created;
    },
    successMsg: 'Subject created successfully',
    errorMsg: 'Failed to create subject',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateSubject = () =>
  useAppMutation({
    mutationFn: async (body: { id: string } & Partial<Omit<SubjectRecord, 'id' | 'createdAt'>>) => {
      await mockDelay(200);
      ensureSeed();
      const current = subjectStore.find((s) => s.id === body.id);
      if (!current) throw new Error('Subject not found');
      const next: SubjectRecord = { ...current, ...body, updatedAt: new Date().toISOString() };
      subjectStore = subjectStore.map((s) => (s.id === body.id ? next : s));
      return next;
    },
    successMsg: 'Subject updated successfully',
    errorMsg: 'Failed to update subject',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

export const useDeleteSubject = () =>
  useAppMutation({
    mutationFn: async (body: { id: string }) => {
      await mockDelay(160);
      ensureSeed();
      subjectStore = subjectStore.filter((s) => s.id !== body.id);
      return { id: body.id };
    },
    successMsg: 'Subject deleted successfully',
    errorMsg: 'Failed to delete subject',
    invalidateQueryKeys: [[API, 'list']],
  });

