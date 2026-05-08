import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { mockDelay } from '@/shared/utils';

export type SyllabusTerm = 'term-1' | 'term-2' | 'final';
export type SyllabusStatus = 'draft' | 'published';

export interface SyllabusAttachment {
  name: string;
  url: string;
}

export interface SyllabusRecord {
  id: string;
  title: string;
  classId: string;
  section: string;
  subject: string;
  term: SyllabusTerm;
  description?: string;
  attachments: SyllabusAttachment[];
  status: SyllabusStatus;
  createdAt: string;
  updatedAt: string;
}

const API = '/syllabus';
let syllabusStore: SyllabusRecord[] = [];

function ensureSeed() {
  if (syllabusStore.length) return;
  const now = new Date().toISOString();
  syllabusStore = [
    {
      id: 'SYL-1',
      title: 'Class 10 Mathematics — Term 1',
      classId: '10',
      section: 'A',
      subject: 'Mathematics',
      term: 'term-1',
      description: 'Algebra, Linear Equations, Polynomials, Geometry basics.',
      attachments: [{ name: 'Math Term 1 Syllabus.pdf', url: 'https://example.com/math-term1.pdf' }],
      status: 'published',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'SYL-2',
      title: 'Class 10 Science — Term 1',
      classId: '10',
      section: 'A',
      subject: 'Science',
      term: 'term-1',
      description: 'Chemical reactions, acids & bases, light, basic biology.',
      attachments: [{ name: 'Science Outline.docx', url: 'https://example.com/science-outline.docx' }],
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export const useGetSyllabus = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      await mockDelay(150);
      ensureSeed();
      return [...syllabusStore].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
  });

export const useGetSyllabusById = ({ syllabusId }: { syllabusId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', syllabusId],
    queryFn: async () => {
      await mockDelay(120);
      ensureSeed();
      return syllabusStore.find((s) => s.id === syllabusId) ?? null;
    },
    enabled: !!syllabusId,
  });

export const useCreateSyllabus = () =>
  useAppMutation({
    mutationFn: async (body: Omit<SyllabusRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
      await mockDelay(220);
      ensureSeed();
      const now = new Date().toISOString();
      const created: SyllabusRecord = {
        id: `SYL-${syllabusStore.length + 1}`,
        createdAt: now,
        updatedAt: now,
        ...body,
      };
      syllabusStore = [created, ...syllabusStore];
      return created;
    },
    successMsg: 'Syllabus created successfully',
    errorMsg: 'Failed to create syllabus',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateSyllabus = () =>
  useAppMutation({
    mutationFn: async (body: { id: string } & Partial<Omit<SyllabusRecord, 'id' | 'createdAt'>>) => {
      await mockDelay(200);
      ensureSeed();
      const current = syllabusStore.find((s) => s.id === body.id);
      if (!current) throw new Error('Syllabus not found');
      const next: SyllabusRecord = { ...current, ...body, updatedAt: new Date().toISOString() };
      syllabusStore = syllabusStore.map((s) => (s.id === body.id ? next : s));
      return next;
    },
    successMsg: 'Syllabus updated successfully',
    errorMsg: 'Failed to update syllabus',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

export const useDeleteSyllabus = () =>
  useAppMutation({
    mutationFn: async (body: { id: string }) => {
      await mockDelay(160);
      ensureSeed();
      syllabusStore = syllabusStore.filter((s) => s.id !== body.id);
      return { id: body.id };
    },
    successMsg: 'Syllabus deleted successfully',
    errorMsg: 'Failed to delete syllabus',
    invalidateQueryKeys: [[API, 'list']],
  });

