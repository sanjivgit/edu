import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { mockDelay } from '@/shared/utils';

export type TimetableDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export type TimetableCell = { subject: string; teacher: string };

export interface TimetableGrid {
  [day: string]: Record<number, TimetableCell>;
}

export interface TimetableRecord {
  id: string;
  classId: string;
  section: string;
  week: number;
  grid: TimetableGrid;
  updatedAt: string;
}

const API = '/timetable';
let timetableStore: TimetableRecord[] = [];

function keyOf(classId: string, section: string, week: number) {
  return `${classId}-${section}-w${week}`;
}

function ensureSeed() {
  if (timetableStore.length) return;

  const seedGrid: TimetableGrid = {
    Monday: { 1: { subject: 'Mathematics', teacher: 'Mr. Verma' }, 2: { subject: 'Science', teacher: 'Ms. Joshi' }, 3: { subject: 'English', teacher: 'Mr. Iyer' }, 5: { subject: 'Hindi', teacher: 'Ms. Nair' }, 6: { subject: 'Computer', teacher: 'Mr. Shah' }, 7: { subject: 'History', teacher: 'Ms. Gupta' }, 9: { subject: 'PE', teacher: 'Mr. Singh' }, 10: { subject: 'Art', teacher: 'Ms. Patel' } },
    Tuesday: { 1: { subject: 'Science', teacher: 'Ms. Joshi' }, 2: { subject: 'Mathematics', teacher: 'Mr. Verma' }, 3: { subject: 'Hindi', teacher: 'Ms. Nair' }, 5: { subject: 'English', teacher: 'Mr. Iyer' }, 6: { subject: 'History', teacher: 'Ms. Gupta' }, 7: { subject: 'Mathematics', teacher: 'Mr. Verma' }, 9: { subject: 'Computer', teacher: 'Mr. Shah' }, 10: { subject: 'Science', teacher: 'Ms. Joshi' } },
    Wednesday: { 1: { subject: 'English', teacher: 'Mr. Iyer' }, 2: { subject: 'Hindi', teacher: 'Ms. Nair' }, 3: { subject: 'Mathematics', teacher: 'Mr. Verma' }, 5: { subject: 'Science', teacher: 'Ms. Joshi' }, 6: { subject: 'Art', teacher: 'Ms. Patel' }, 7: { subject: 'Computer', teacher: 'Mr. Shah' }, 9: { subject: 'History', teacher: 'Ms. Gupta' }, 10: { subject: 'PE', teacher: 'Mr. Singh' } },
    Thursday: { 1: { subject: 'Hindi', teacher: 'Ms. Nair' }, 2: { subject: 'History', teacher: 'Ms. Gupta' }, 3: { subject: 'Science', teacher: 'Ms. Joshi' }, 5: { subject: 'Mathematics', teacher: 'Mr. Verma' }, 6: { subject: 'English', teacher: 'Mr. Iyer' }, 7: { subject: 'PE', teacher: 'Mr. Singh' }, 9: { subject: 'Art', teacher: 'Ms. Patel' }, 10: { subject: 'Computer', teacher: 'Mr. Shah' } },
    Friday: { 1: { subject: 'Computer', teacher: 'Mr. Shah' }, 2: { subject: 'English', teacher: 'Mr. Iyer' }, 3: { subject: 'Hindi', teacher: 'Ms. Nair' }, 5: { subject: 'History', teacher: 'Ms. Gupta' }, 6: { subject: 'Mathematics', teacher: 'Mr. Verma' }, 7: { subject: 'Science', teacher: 'Ms. Joshi' }, 9: { subject: 'Mathematics', teacher: 'Mr. Verma' }, 10: { subject: 'English', teacher: 'Mr. Iyer' } },
    Saturday: { 1: { subject: 'Art', teacher: 'Ms. Patel' }, 2: { subject: 'PE', teacher: 'Mr. Singh' }, 3: { subject: 'Computer', teacher: 'Mr. Shah' }, 5: { subject: 'Mathematics', teacher: 'Mr. Verma' }, 6: { subject: 'Hindi', teacher: 'Ms. Nair' }, 7: { subject: '', teacher: '' }, 9: { subject: '', teacher: '' }, 10: { subject: '', teacher: '' } },
  };

  timetableStore = [
    {
      id: `TT-${keyOf('10', 'A', 0)}`,
      classId: '10',
      section: 'A',
      week: 0,
      grid: seedGrid,
      updatedAt: new Date().toISOString(),
    },
  ];
}

export const useGetTimetable = ({ classId, section, week }: { classId?: string; section?: string; week?: number }) =>
  useQuery({
    queryKey: [API, 'grid', classId, section, week],
    queryFn: async () => {
      await mockDelay(150);
      ensureSeed();
      const rec = timetableStore.find((t) => t.classId === classId && t.section === section && t.week === (week ?? 0));
      if (rec) return rec;
      const created: TimetableRecord = {
        id: `TT-${keyOf(classId!, section!, week ?? 0)}`,
        classId: classId!,
        section: section!,
        week: week ?? 0,
        grid: {},
        updatedAt: new Date().toISOString(),
      };
      timetableStore = [created, ...timetableStore];
      return created;
    },
    enabled: !!classId && !!section && typeof week === 'number',
  });

export const useAssignTimetableCell = () =>
  useAppMutation({
    mutationFn: async (body: { classId: string; section: string; week: number; day: TimetableDay; periodId: number; subject: string; teacher: string }) => {
      await mockDelay(200);
      ensureSeed();

      const idx = timetableStore.findIndex((t) => t.classId === body.classId && t.section === body.section && t.week === body.week);
      const rec = idx >= 0 ? timetableStore[idx] : null;
      const base: TimetableRecord =
        rec ??
        ({
          id: `TT-${keyOf(body.classId, body.section, body.week)}`,
          classId: body.classId,
          section: body.section,
          week: body.week,
          grid: {},
          updatedAt: new Date().toISOString(),
        } as TimetableRecord);

      const nextGrid: TimetableGrid = {
        ...base.grid,
        [body.day]: {
          ...(base.grid[body.day] ?? {}),
          [body.periodId]: { subject: body.subject, teacher: body.teacher },
        },
      };

      const next: TimetableRecord = { ...base, grid: nextGrid, updatedAt: new Date().toISOString() };

      if (idx >= 0) {
        timetableStore = timetableStore.map((t, i) => (i === idx ? next : t));
      } else {
        timetableStore = [next, ...timetableStore];
      }
      return next;
    },
    successMsg: 'Timetable updated successfully',
    errorMsg: 'Failed to update timetable',
    invalidateQueryKeys: [[API, 'grid']],
  });
