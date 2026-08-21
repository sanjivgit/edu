import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { findTeacherIdByName } from '@/features/common/services/lookups.service';

export interface ClassItem {
  id: string;
  name: string;
  code: string;
  classTeacher: string;
  sections: number;
  students: number;
  capacity: number;
  status: 'active' | 'inactive';
}

export interface SectionItem {
  id: string;
  classId: string;
  className: string;
  name: string;
  roomNo: string;
  sectionTeacher: string;
  students: number;
  status: 'active' | 'inactive';
}

export interface AcademicYearItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'planned' | 'closed';
}

export interface PromotionStudentInfo {
  id: string;
  name: string;
  rollNo?: string;
  status: 'promoted' | 'retained';
  totalMarks?: number | null;
  passed?: boolean;
}

export interface PromotionRecord {
  id: string;
  fromClassId: string;
  toClassId: string;
  promotedCount: number;
  retainedCount: number;
  academicYearId: string;
  promotedOn: string;
  mode?: 'manual' | 'auto';
  promotedStudents?: PromotionStudentInfo[];
  retainedStudents?: PromotionStudentInfo[];
}

const API = '/classes';

interface BackendClass {
  id: string;
  name: string;
  code: string;
  capacity: number;
  status: 'active' | 'inactive';
  academicYearId?: string | null;
  studentCount?: number;
  _count?: { students: number };
  classTeacher?: { id: string; fullName: string } | null;
  sections?: Array<{ id: string; name: string; roomNo?: string | null; studentCount?: number; status?: string }>;
}

interface BackendAcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'planned' | 'closed';
}

function toClassItem(c: BackendClass): ClassItem {
  return {
    id: c.id,
    name: c.name,
    code: c.code,
    classTeacher: c.classTeacher?.fullName ?? '',
    sections: Array.isArray(c.sections) ? c.sections.length : 0,
    students: c.studentCount ?? c._count?.students ?? 0,
    capacity: c.capacity,
    status: c.status,
  };
}

function toSectionItem(s: {
  id: string;
  classId?: string;
  className?: string;
  name: string;
  roomNo?: string | null;
  studentCount?: number;
  sectionTeacher?: string;
  status?: string;
}, className: string): SectionItem {
  return {
    id: s.id,
    classId: s.classId ?? '',
    className: s.className ?? className,
    name: s.name,
    roomNo: s.roomNo ?? '',
    sectionTeacher: s.sectionTeacher ?? '',
    students: s.studentCount ?? 0,
    status: (s.status as 'active' | 'inactive') ?? 'active',
  };
}

async function fetchClasses(): Promise<BackendClass[]> {
  const res = await apiClient.get<ApiResponse<BackendClass[]>>('/classes').then(unwrapApi);
  return Array.isArray(res) ? res : (res as unknown as { items: BackendClass[] }).items ?? [];
}

async function findClassNameById(classId: string): Promise<string> {
  const classes = await fetchClasses();
  return classes.find((c) => c.id === classId)?.name ?? '';
}

export const useGetClasses = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      const classes = await fetchClasses();
      return classes.map(toClassItem);
    },
  });

export const useGetSections = () =>
  useQuery({
    queryKey: [API, 'sections'],
    queryFn: async () => {
      const classes = await fetchClasses();
      const sections: SectionItem[] = [];
      for (const c of classes) {
        for (const s of c.sections ?? []) {
          sections.push(toSectionItem({ ...s, classId: c.id }, c.name));
        }
      }
      return sections;
    },
  });

export interface ClassStudent {
  id: string;
  name: string;
  rollNo: string;
  sectionId?: string;
}

export const useGetStudentsByClass = (classId: string | undefined) =>
  useQuery({
    queryKey: [API, 'students', classId],
    queryFn: async () => {
      if (!classId) return [];
      const res = await apiClient
        .get<ApiResponse<Array<{ id: string; name: string; rollNo?: string; sectionId?: string }>>>(
          `/classes/${classId}/students`,
        )
        .then(unwrapApi);
      return (res ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        rollNo: s.rollNo ?? '',
        sectionId: s.sectionId,
      })) as ClassStudent[];
    },
    enabled: !!classId,
  });

export interface ClassExamItem {
  id: string;
  name: string;
  term: string;
  passPercentage: number;
  totalMarks: number;
}

export const useGetExamsByClass = (classId: string | undefined) =>
  useQuery({
    queryKey: [API, 'exams', classId],
    queryFn: async () => {
      if (!classId) return [];
      const res = await apiClient
        .get<ApiResponse<Array<{
          id: string;
          name: string;
          term: string;
          passPercentage?: number;
          papers?: Array<{ totalMarks: number }>;
        }>>>(`/exams/schedule/${classId}`)
        .then(unwrapApi);
      return (res ?? []).map((e) => ({
        id: e.id,
        name: e.name,
        term: e.term,
        passPercentage: e.passPercentage ?? 35,
        totalMarks: e.papers?.reduce((sum, p) => sum + (p.totalMarks || 0), 0) || 100,
      })) as ClassExamItem[];
    },
    enabled: !!classId,
  });

export const useGetClassById = ({ classId }: { classId?: string }) =>
  useQuery({
    queryKey: [API, classId],
    queryFn: async () => {
      if (!classId) return null;
      const c = await apiClient.get<ApiResponse<BackendClass>>(`/classes/${classId}`).then(unwrapApi);
      return toClassItem(c);
    },
    enabled: !!classId,
  });

export const useAddClass = () =>
  useAppMutation<ClassItem, Omit<ClassItem, 'id' | 'students' | 'status'>>({
    mutationFn: async (body) => {
      const classTeacherId = await findTeacherIdByName(body.classTeacher);
      const created = await apiClient
        .post<ApiResponse<BackendClass>>('/classes', {
          name: body.name,
          code: body.code,
          capacity: Number(body.capacity) || 40,
          classTeacherId,
          status: 'active',
        })
        .then(unwrapApi);
      const extra = Math.max(0, Math.min(25, Number(body.sections || 1) - 1));
      for (let i = 1; i <= extra; i++) {
        await apiClient.post('/sections', {
          classId: created.id,
          name: String.fromCharCode(65 + i),
          status: 'active',
        });
      }
      return toClassItem(created);
    },
    successMsg: 'Class created successfully',
    errorMsg: 'Failed to create class',
    invalidateQueryKeys: [[API, 'list'], [API, 'sections']],
  });

export const useEditClass = () =>
  useAppMutation<
    ClassItem,
    { classId: string; payload: Pick<ClassItem, 'name' | 'code' | 'classTeacher' | 'sections' | 'capacity' | 'status'> }
  >({
    mutationFn: async ({ classId, payload }) => {
      const classTeacherId = await findTeacherIdByName(payload.classTeacher);
      const updated = await apiClient
        .put<ApiResponse<BackendClass>>(`/classes/${classId}`, {
          name: payload.name,
          code: payload.code,
          capacity: Number(payload.capacity) || undefined,
          classTeacherId,
          status: payload.status,
        })
        .then(unwrapApi);
      return toClassItem(updated);
    },
    successMsg: 'Class updated successfully',
    errorMsg: 'Failed to update class',
    invalidateQueryKeys: [[API, 'list'], [API, 'sections']],
  });

export const useDeleteClass = () =>
  useAppMutation<{ id: string }, string>({
    mutationFn: async (classId: string) => {
      await apiClient.delete(`/classes/${classId}`);
      return { id: classId };
    },
    successMsg: 'Class deleted successfully',
    errorMsg: 'Failed to delete class',
    invalidateQueryKeys: [[API, 'list'], [API, 'sections']],
  });

export const useAddSection = () =>
  useAppMutation<SectionItem, Omit<SectionItem, 'id' | 'className' | 'status'>>({
    mutationFn: async (body) => {
      const sectionTeacherId = await findTeacherIdByName(body.sectionTeacher);
      const className = await findClassNameById(body.classId);
      const created = await apiClient
        .post<ApiResponse<SectionItem>>('/sections', {
          classId: body.classId,
          name: body.name,
          roomNo: body.roomNo || undefined,
          sectionTeacherId,
        })
        .then(unwrapApi);
      return toSectionItem({ ...created, className }, className);
    },
    successMsg: 'Section created successfully',
    errorMsg: 'Failed to create section',
    invalidateQueryKeys: [[API, 'list'], [API, 'sections']],
  });

export const useEditSection = () =>
  useAppMutation<
    SectionItem,
    { sectionId: string; payload: Pick<SectionItem, 'classId' | 'name' | 'roomNo' | 'sectionTeacher' | 'students' | 'status'> }
  >({
    mutationFn: async ({ sectionId, payload }) => {
      const sectionTeacherId = await findTeacherIdByName(payload.sectionTeacher);
      const className = await findClassNameById(payload.classId);
      const updated = await apiClient
        .put<ApiResponse<SectionItem>>(`/sections/${sectionId}`, {
          name: payload.name,
          roomNo: payload.roomNo || undefined,
          sectionTeacherId,
          status: payload.status,
        })
        .then(unwrapApi);
      return toSectionItem({ ...updated, classId: payload.classId, className }, className);
    },
    successMsg: 'Section updated successfully',
    errorMsg: 'Failed to update section',
    invalidateQueryKeys: [[API, 'list'], [API, 'sections']],
  });

export const useDeleteSection = () =>
  useAppMutation<{ id: string }, string>({
    mutationFn: async (sectionId: string) => {
      await apiClient.delete(`/sections/${sectionId}`);
      return { id: sectionId };
    },
    successMsg: 'Section deleted successfully',
    errorMsg: 'Failed to delete section',
    invalidateQueryKeys: [[API, 'list'], [API, 'sections']],
  });

export const useGetAcademicYears = () =>
  useQuery({
    queryKey: [API, 'academic-years'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<BackendAcademicYear[]>>('/academic-years').then(unwrapApi);
      return (res ?? []) as AcademicYearItem[];
    },
  });

export const useCreateAcademicYear = () =>
  useAppMutation<AcademicYearItem, Omit<AcademicYearItem, 'id' | 'status'>>({
    mutationFn: async (body) => {
      const created = await apiClient
        .post<ApiResponse<BackendAcademicYear>>('/academic-years', {
          name: body.name,
          startDate: body.startDate,
          endDate: body.endDate,
        })
        .then(unwrapApi);
      return created as AcademicYearItem;
    },
    successMsg: 'Academic year created successfully',
    errorMsg: 'Failed to create academic year',
    invalidateQueryKeys: [[API, 'academic-years']],
  });

export const useUpdateAcademicYear = () =>
  useAppMutation<AcademicYearItem, { id: string; payload: Partial<Omit<AcademicYearItem, 'id'>> }>({
    mutationFn: async ({ id, payload }) => {
      const updated = await apiClient
        .put<ApiResponse<BackendAcademicYear>>(`/academic-years/${id}`, {
          name: payload.name,
          startDate: payload.startDate,
          endDate: payload.endDate,
          status: payload.status,
        })
        .then(unwrapApi);
      return updated as AcademicYearItem;
    },
    successMsg: 'Academic year updated successfully',
    errorMsg: 'Failed to update academic year',
    invalidateQueryKeys: [[API, 'academic-years']],
  });

export const useDeleteAcademicYear = () =>
  useAppMutation<{ id: string }, string>({
    mutationFn: async (id) => {
      await apiClient.delete(`/academic-years/${id}`);
      return { id };
    },
    successMsg: 'Academic year deleted successfully',
    errorMsg: 'Failed to delete academic year',
    invalidateQueryKeys: [[API, 'academic-years']],
  });

export const usePromoteStudents = () =>
  useAppMutation<
    PromotionRecord,
    { fromClassId: string; toClassId: string; promotedCount: number; academicYearId: string; studentIds?: string[] }
  >({
    mutationFn: async (body) => {
      const studentIds = body.studentIds?.length ? body.studentIds : undefined;
      const res = await apiClient
        .post<ApiResponse<{
          mode: string;
          promotionId: string;
          promotedCount: number;
          retainedCount: number;
          promotion?: { id: string; promotedOn: string };
          promotedStudents?: Array<{ id: string; name: string; rollNo?: string; status?: string }>;
          retainedStudents?: Array<{ id: string; name: string; rollNo?: string; status?: string }>;
        }>>('/classes/promote', {
          fromClassId: body.fromClassId,
          toClassId: body.toClassId,
          academicYearId: body.academicYearId,
          studentIds,
        })
        .then(unwrapApi);
      return {
        id: res.promotion?.id ?? res.promotionId,
        fromClassId: body.fromClassId,
        toClassId: body.toClassId,
        promotedCount: res.promotedCount,
        retainedCount: res.retainedCount ?? 0,
        academicYearId: body.academicYearId,
        promotedOn: res.promotion?.promotedOn ?? new Date().toISOString(),
        mode: res.mode as 'manual' | 'auto',
        promotedStudents: (res.promotedStudents ?? []).map((s) => ({ ...s, status: 'promoted' as const })),
        retainedStudents: (res.retainedStudents ?? []).map((s) => ({ ...s, status: 'retained' as const })),
      };
    },
    successMsg: 'Students promoted successfully',
    errorMsg: 'Failed to promote students',
    invalidateQueryKeys: [[API, 'list'], [API, 'promotions']],
  });

export const useGetPromotions = () =>
  useQuery({
    queryKey: [API, 'promotions'],
    queryFn: async () => {
      const res = await apiClient
        .get<ApiResponse<Array<{
          id: string;
          fromClassId: string | null;
          toClassId: string | null;
          promotedCount: number;
          retainedCount?: number;
          academicYearId: string | null;
          promotedOn: string;
          mode?: string;
          students?: Array<{
            studentId: string;
            status: string;
            totalMarks?: number | null;
            passed?: boolean;
            student?: { id: string; name: string; rollNo?: string };
          }>;
        }>>>('/promotions')
        .then(unwrapApi);
      return (res ?? [])
        .filter((p) => p.fromClassId && p.toClassId)
        .map((p) => ({
          id: p.id,
          fromClassId: p.fromClassId as string,
          toClassId: p.toClassId as string,
          promotedCount: p.promotedCount,
          retainedCount: p.retainedCount ?? 0,
          academicYearId: p.academicYearId ?? '',
          promotedOn: p.promotedOn,
          mode: p.mode as 'manual' | 'auto' | undefined,
          promotedStudents: (p.students ?? [])
            .filter((s) => s.status === 'promoted')
            .map((s) => ({
              id: s.student?.id ?? s.studentId,
              name: s.student?.name ?? 'Unknown',
              rollNo: s.student?.rollNo,
              status: 'promoted' as const,
              totalMarks: s.totalMarks,
              passed: s.passed,
            })),
          retainedStudents: (p.students ?? [])
            .filter((s) => s.status === 'retained')
            .map((s) => ({
              id: s.student?.id ?? s.studentId,
              name: s.student?.name ?? 'Unknown',
              rollNo: s.student?.rollNo,
              status: 'retained' as const,
              totalMarks: s.totalMarks,
              passed: s.passed,
            })),
        }));
    },
  });
