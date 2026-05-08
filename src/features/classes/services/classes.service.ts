import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { mockDelay } from '@/shared/utils';

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

export interface PromotionRecord {
  id: string;
  fromClassId: string;
  toClassId: string;
  promotedCount: number;
  academicYearId: string;
  promotedOn: string;
}

let classStore: ClassItem[] = [
  { id: 'CLS-001', name: 'Class 1', code: 'C1', classTeacher: 'Ritika Sharma', sections: 2, students: 56, capacity: 70, status: 'active' },
  { id: 'CLS-002', name: 'Class 2', code: 'C2', classTeacher: 'Ankit Verma', sections: 3, students: 78, capacity: 90, status: 'active' },
  { id: 'CLS-003', name: 'Class 3', code: 'C3', classTeacher: 'Sonia Nair', sections: 2, students: 49, capacity: 70, status: 'active' },
  { id: 'CLS-004', name: 'Class 4', code: 'C4', classTeacher: 'Amit Joshi', sections: 1, students: 0, capacity: 35, status: 'inactive' },
];

let sectionStore: SectionItem[] = [
  { id: 'SEC-001', classId: 'CLS-001', className: 'Class 1', name: 'A', roomNo: '101', sectionTeacher: 'Ritika Sharma', students: 28, status: 'active' },
  { id: 'SEC-002', classId: 'CLS-001', className: 'Class 1', name: 'B', roomNo: '102', sectionTeacher: 'Priya Singh', students: 28, status: 'active' },
  { id: 'SEC-003', classId: 'CLS-002', className: 'Class 2', name: 'A', roomNo: '201', sectionTeacher: 'Ankit Verma', students: 26, status: 'active' },
  { id: 'SEC-004', classId: 'CLS-002', className: 'Class 2', name: 'B', roomNo: '202', sectionTeacher: 'Nidhi Rao', students: 27, status: 'active' },
  { id: 'SEC-005', classId: 'CLS-002', className: 'Class 2', name: 'C', roomNo: '203', sectionTeacher: 'Rohan Das', students: 25, status: 'active' },
];

let academicYearStore: AcademicYearItem[] = [
  { id: 'AY-2024', name: '2024-2025', startDate: '2024-04-01', endDate: '2025-03-31', status: 'closed' },
  { id: 'AY-2025', name: '2025-2026', startDate: '2025-04-01', endDate: '2026-03-31', status: 'active' },
  { id: 'AY-2026', name: '2026-2027', startDate: '2026-04-01', endDate: '2027-03-31', status: 'planned' },
];

let promotionStore: PromotionRecord[] = [];

const API = '/classes';

export const useGetClasses = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      await mockDelay(200);
      return [...classStore];
    },
  });

export const useGetSections = () =>
  useQuery({
    queryKey: [API, 'sections'],
    queryFn: async () => {
      await mockDelay(200);
      return [...sectionStore];
    },
  });

export const useGetClassById = ({ classId }: { classId?: string }) =>
  useQuery({
    queryKey: [API, classId],
    queryFn: async () => {
      await mockDelay(120);
      return classStore.find((item) => item.id === classId!) ?? null;
    },
    enabled: !!classId,
  });

export const useAddClass = () =>
  useAppMutation({
    mutationFn: async (body: Omit<ClassItem, 'id' | 'students' | 'status'>) => {
      await mockDelay(200);
      const created: ClassItem = {
        ...body,
        id: `CLS-${String(classStore.length + 1).padStart(3, '0')}`,
        students: 0,
        status: 'active',
      };
      classStore = [...classStore, created];
      return created;
    },
    successMsg: 'Class created successfully',
    errorMsg: 'Failed to create class',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useEditClass = () =>
  useAppMutation({
    mutationFn: async (body: { classId: string; payload: Pick<ClassItem, 'name' | 'code' | 'classTeacher' | 'sections' | 'capacity' | 'status'> }) =>
      {
        await mockDelay(200);
        const { classId, payload } = body;
        classStore = classStore.map((item) => (item.id === classId ? { ...item, ...payload } : item));
        sectionStore = sectionStore.map((item) =>
          item.classId === classId ? { ...item, className: payload.name } : item
        );
        return classStore.find((item) => item.id === classId)!;
      },
    successMsg: 'Class updated successfully',
    errorMsg: 'Failed to update class',
    invalidateQueryKeys: [[API, 'list'], [API, 'sections']],
  });

export const useDeleteClass = () =>
  useAppMutation({
    mutationFn: async (classId: string) => {
      await mockDelay(180);
      classStore = classStore.filter((item) => item.id !== classId);
      sectionStore = sectionStore.filter((item) => item.classId !== classId);
      return { id: classId };
    },
    successMsg: 'Class deleted successfully',
    errorMsg: 'Failed to delete class',
    invalidateQueryKeys: [[API, 'list'], [API, 'sections']],
  });

export const useAddSection = () =>
  useAppMutation({
    mutationFn: async (body: Omit<SectionItem, 'id' | 'className' | 'status'>) => {
      await mockDelay(200);
      const klass = classStore.find((item) => item.id === body.classId);
      if (!klass) throw new Error('Class not found');
      const created: SectionItem = {
        ...body,
        id: `SEC-${String(sectionStore.length + 1).padStart(3, '0')}`,
        className: klass.name,
        status: 'active',
      };
      sectionStore = [...sectionStore, created];
      classStore = classStore.map((item) =>
        item.id === body.classId
          ? { ...item, sections: item.sections + 1, students: item.students + body.students }
          : item
      );
      return created;
    },
    successMsg: 'Section created successfully',
    errorMsg: 'Failed to create section',
    invalidateQueryKeys: [[API, 'list'], [API, 'sections']],
  });

export const useEditSection = () =>
  useAppMutation({
    mutationFn: async (body: { sectionId: string; payload: Pick<SectionItem, 'classId' | 'name' | 'roomNo' | 'sectionTeacher' | 'students' | 'status'> }) =>
      {
        await mockDelay(200);
        const existing = sectionStore.find((item) => item.id === body.sectionId);
        if (!existing) throw new Error('Section not found');

        const nextClass = classStore.find((item) => item.id === body.payload.classId);
        if (!nextClass) throw new Error('Class not found');

        classStore = classStore.map((item) => {
          if (item.id === existing.classId) {
            return { ...item, students: Math.max(0, item.students - existing.students), sections: item.sections - (existing.classId === body.payload.classId ? 0 : 1) };
          }
          if (item.id === body.payload.classId) {
            return { ...item, students: item.students + body.payload.students, sections: item.sections + (existing.classId === body.payload.classId ? 0 : 1) };
          }
          return item;
        });

        sectionStore = sectionStore.map((item) =>
          item.id === body.sectionId
            ? { ...item, ...body.payload, className: nextClass.name }
            : item
        );

        return sectionStore.find((item) => item.id === body.sectionId)!;
      },
    successMsg: 'Section updated successfully',
    errorMsg: 'Failed to update section',
    invalidateQueryKeys: [[API, 'list'], [API, 'sections']],
  });

export const useDeleteSection = () =>
  useAppMutation({
    mutationFn: async (sectionId: string) => {
      await mockDelay(180);
      const existing = sectionStore.find((item) => item.id === sectionId);
      if (!existing) return { id: sectionId };
      sectionStore = sectionStore.filter((item) => item.id !== sectionId);
      classStore = classStore.map((item) =>
        item.id === existing.classId
          ? { ...item, sections: Math.max(0, item.sections - 1), students: Math.max(0, item.students - existing.students) }
          : item
      );
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
      await mockDelay(120);
      return [...academicYearStore];
    },
  });

export const useCreateAcademicYear = () =>
  useAppMutation({
    mutationFn: async (body: Omit<AcademicYearItem, 'id' | 'status'>) => {
      await mockDelay(160);
      const created: AcademicYearItem = {
        ...body,
        id: `AY-${new Date(body.startDate).getFullYear()}`,
        status: 'planned',
      };
      academicYearStore = [created, ...academicYearStore];
      return created;
    },
    successMsg: 'Academic year created successfully',
    errorMsg: 'Failed to create academic year',
    invalidateQueryKeys: [[API, 'academic-years']],
  });

export const usePromoteStudents = () =>
  useAppMutation({
    mutationFn: async (body: { fromClassId: string; toClassId: string; promotedCount: number; academicYearId: string }) => {
      await mockDelay(180);
      const from = classStore.find((c) => c.id === body.fromClassId);
      const to = classStore.find((c) => c.id === body.toClassId);
      if (!from || !to) throw new Error('Class not found');
      const count = Math.max(0, Math.min(body.promotedCount, from.students));
      classStore = classStore.map((c) => {
        if (c.id === from.id) return { ...c, students: Math.max(0, c.students - count) };
        if (c.id === to.id) return { ...c, students: c.students + count };
        return c;
      });
      const rec: PromotionRecord = {
        id: `PROM-${promotionStore.length + 1}`,
        fromClassId: from.id,
        toClassId: to.id,
        promotedCount: count,
        academicYearId: body.academicYearId,
        promotedOn: new Date().toISOString(),
      };
      promotionStore = [rec, ...promotionStore];
      return rec;
    },
    successMsg: 'Students promoted successfully',
    errorMsg: 'Failed to promote students',
    invalidateQueryKeys: [[API, 'list'], [API, 'promotions']],
  });

export const useGetPromotions = () =>
  useQuery({
    queryKey: [API, 'promotions'],
    queryFn: async () => {
      await mockDelay(120);
      return [...promotionStore];
    },
  });
