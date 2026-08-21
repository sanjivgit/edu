import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { findSubjectIdByName, resolveClassDisplayMap, resolveClassId } from '@/features/common/services/lookups.service';

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
  academicYearId?: string | null;
  academicYearName?: string;
  term: SyllabusTerm;
  description?: string;
  attachments: SyllabusAttachment[];
  status: SyllabusStatus;
  createdAt: string;
  updatedAt: string;
}

const API = '/syllabus';

interface BackendSyllabus {
  id: string;
  title: string;
  classId: string;
  className?: string;
  section: string | null;
  subjectId: string | null;
  subject?: { id: string; name: string } | null;
  subjectName?: string;
  academicYearId?: string | null;
  academicYear?: { id: string; name: string } | null;
  term: SyllabusTerm;
  description: string | null;
  attachments: SyllabusAttachment[];
  status: SyllabusStatus;
  createdAt: string;
  updatedAt: string;
}

function classDisplay(classId: string, className?: string, classMap?: Map<string, string>): string {
  const m = (className ?? '').match(/(\d+)/);
  if (m) return m[1];
  if (classMap && classMap.size) return classMap.get(classId) ?? classId;
  return classId;
}

function toSyllabusRecord(s: BackendSyllabus, classMap?: Map<string, string>): SyllabusRecord {
  return {
    id: s.id,
    title: s.title,
    classId: classDisplay(s.classId, s.className, classMap),
    section: s.section ?? '',
    subject: s.subject?.name ?? s.subjectName ?? '',
    academicYearId: s.academicYearId ?? s.academicYear?.id ?? null,
    academicYearName: s.academicYear?.name ?? '',
    term: s.term,
    description: s.description ?? '',
    attachments: s.attachments ?? [],
    status: s.status,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export const useGetSyllabus = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      const res = await apiClient
        .get<ApiResponse<BackendSyllabus[]>>('/syllabus', { params: { limit: 500 } })
        .then(unwrapApi);
      const items = res ?? [];
      const classMap = await resolveClassDisplayMap(items.map((i) => i.classId));
      return items.map((i) => toSyllabusRecord(i, classMap)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
  });

export const useGetSyllabusById = ({ syllabusId }: { syllabusId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', syllabusId],
    queryFn: async () => {
      if (!syllabusId) return null;
      const s = await apiClient
        .get<ApiResponse<BackendSyllabus & { class_?: { name: string } }>>(`/syllabus/${syllabusId}`)
        .then(unwrapApi);
      return toSyllabusRecord({ ...s, className: s.class_?.name });
    },
    enabled: !!syllabusId,
  });

export const useCreateSyllabus = () =>
  useAppMutation<
    SyllabusRecord,
    Omit<SyllabusRecord, 'id' | 'createdAt' | 'updatedAt'>
  >({
    mutationFn: async (body) => {
      const classId = await resolveClassId(body.classId);
      if (!classId) throw new Error('Class not found');
      const subjectId = await findSubjectIdByName(body.subject);
      const created = await apiClient
        .post<ApiResponse<BackendSyllabus>>('/syllabus', {
          title: body.title,
          classId,
          section: body.section || undefined,
          subjectId,
          academicYearId: (body as any).academicYearId || undefined,
          term: body.term ?? 'final',
          description: body.description || undefined,
          attachments: body.attachments ?? [],
          status: body.status ?? 'draft',
        })
        .then(unwrapApi);
      return toSyllabusRecord(created);
    },
    successMsg: 'Syllabus created successfully',
    errorMsg: 'Failed to create syllabus',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateSyllabus = () =>
  useAppMutation<
    SyllabusRecord,
    { id: string } & Partial<Omit<SyllabusRecord, 'id' | 'createdAt'>>
  >({
    mutationFn: async (body) => {
      const classId = await resolveClassId(body.classId);
      if (!classId) throw new Error('Class not found');
      const subjectId = await findSubjectIdByName(body.subject);
      const updated = await apiClient
        .put<ApiResponse<BackendSyllabus>>(`/syllabus/${body.id}`, {
          title: body.title,
          classId,
          section: body.section || undefined,
          subjectId,
          academicYearId: (body as any).academicYearId || undefined,
          term: body.term,
          description: body.description || undefined,
          attachments: body.attachments ?? undefined,
          status: body.status,
        })
        .then(unwrapApi);
      return toSyllabusRecord(updated);
    },
    successMsg: 'Syllabus updated successfully',
    errorMsg: 'Failed to update syllabus',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

export const useDeleteSyllabus = () =>
  useAppMutation<{ id: string }, { id: string }>({
    mutationFn: async (body) => {
      await apiClient.delete(`/syllabus/${body.id}`);
      return { id: body.id };
    },
    successMsg: 'Syllabus deleted successfully',
    errorMsg: 'Failed to delete syllabus',
    invalidateQueryKeys: [[API, 'list']],
  });
