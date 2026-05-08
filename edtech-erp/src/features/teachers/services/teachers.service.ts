import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { mockDelay } from '@/shared/utils';

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
let teacherStore: TeacherRecord[] = [];

function ensureSeed() {
  if (teacherStore.length) return;
  const now = new Date().toISOString();
  teacherStore = [
    { id: 'T-1', fullName: 'Ritika Sharma', employeeCode: 'EMP-1001', subject: 'Mathematics', phone: '9876543210', email: 'ritika@school.edu', classTeacherOf: 'Class 1-A', status: 'active', createdAt: now, updatedAt: now },
    { id: 'T-2', fullName: 'Ankit Verma', employeeCode: 'EMP-1002', subject: 'Science', phone: '9123456789', email: 'ankit@school.edu', classTeacherOf: 'Class 2-A', status: 'active', createdAt: now, updatedAt: now },
    { id: 'T-3', fullName: 'Sonia Nair', employeeCode: 'EMP-1003', subject: 'English', phone: '9988776655', email: 'sonia@school.edu', classTeacherOf: '', status: 'inactive', createdAt: now, updatedAt: now },
  ];
}

export const useGetTeachers = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      await mockDelay(150);
      ensureSeed();
      return [...teacherStore].sort((a, b) => a.fullName.localeCompare(b.fullName));
    },
  });

export const useGetTeacherById = ({ teacherId }: { teacherId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', teacherId],
    queryFn: async () => {
      await mockDelay(120);
      ensureSeed();
      return teacherStore.find((t) => t.id === teacherId) ?? null;
    },
    enabled: !!teacherId,
  });

export const useCreateTeacher = () =>
  useAppMutation({
    mutationFn: async (body: Omit<TeacherRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
      await mockDelay(180);
      ensureSeed();
      const now = new Date().toISOString();
      const created: TeacherRecord = { id: `T-${teacherStore.length + 1}`, createdAt: now, updatedAt: now, ...body };
      teacherStore = [created, ...teacherStore];
      return created;
    },
    successMsg: 'Teacher created successfully',
    errorMsg: 'Failed to create teacher',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateTeacher = () =>
  useAppMutation({
    mutationFn: async (body: { id: string } & Partial<Omit<TeacherRecord, 'id' | 'createdAt'>>) => {
      await mockDelay(180);
      ensureSeed();
      const current = teacherStore.find((t) => t.id === body.id);
      if (!current) throw new Error('Teacher not found');
      const next = { ...current, ...body, updatedAt: new Date().toISOString() };
      teacherStore = teacherStore.map((t) => (t.id === body.id ? next : t));
      return next;
    },
    successMsg: 'Teacher updated successfully',
    errorMsg: 'Failed to update teacher',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

export const useDeleteTeacher = () =>
  useAppMutation({
    mutationFn: async (body: { id: string }) => {
      await mockDelay(150);
      ensureSeed();
      teacherStore = teacherStore.filter((t) => t.id !== body.id);
      return { id: body.id };
    },
    successMsg: 'Teacher deleted successfully',
    errorMsg: 'Failed to delete teacher',
    invalidateQueryKeys: [[API, 'list']],
  });

