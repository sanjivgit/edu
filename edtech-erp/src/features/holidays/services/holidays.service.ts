import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { mockDelay } from '@/shared/utils';

export type HolidayType = 'holiday' | 'event' | 'exam' | 'closure';
export type HolidayStatus = 'planned' | 'announced' | 'cancelled';
export type HolidayAppliesTo = 'all' | 'students' | 'staff';

export interface HolidayRecord {
  id: string;
  title: string;
  type: HolidayType;
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd
  isFullDay: boolean;
  appliesTo: HolidayAppliesTo;
  status: HolidayStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const API = '/holidays';
let holidayStore: HolidayRecord[] = [];

function ensureSeed() {
  if (holidayStore.length) return;
  const now = new Date().toISOString();
  const today = new Date();
  const iso = (d: Date) => d.toISOString().split('T')[0];
  const d1 = iso(today);
  const d2 = iso(new Date(today.getTime() + 1000 * 60 * 60 * 24 * 1));
  const d3 = iso(new Date(today.getTime() + 1000 * 60 * 60 * 24 * 10));

  holidayStore = [
    {
      id: 'H-1',
      title: 'School Foundation Day',
      type: 'event',
      startDate: d3,
      endDate: d3,
      isFullDay: true,
      appliesTo: 'all',
      status: 'announced',
      description: 'Annual celebration program. Timings will be shared soon.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'H-2',
      title: 'Emergency Closure',
      type: 'closure',
      startDate: d1,
      endDate: d2,
      isFullDay: true,
      appliesTo: 'all',
      status: 'planned',
      description: 'Temporary closure due to maintenance work.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'H-3',
      title: 'Local Holiday',
      type: 'holiday',
      startDate: d2,
      endDate: d2,
      isFullDay: true,
      appliesTo: 'students',
      status: 'announced',
      description: '',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export const useGetHolidays = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      await mockDelay(150);
      ensureSeed();
      return [...holidayStore].sort((a, b) => b.startDate.localeCompare(a.startDate));
    },
  });

export const useGetHolidayById = ({ holidayId }: { holidayId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', holidayId],
    queryFn: async () => {
      await mockDelay(120);
      ensureSeed();
      return holidayStore.find((h) => h.id === holidayId) ?? null;
    },
    enabled: !!holidayId,
  });

export const useCreateHoliday = () =>
  useAppMutation({
    mutationFn: async (body: Omit<HolidayRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'> & { status?: HolidayStatus }) => {
      await mockDelay(220);
      ensureSeed();
      const now = new Date().toISOString();
      const created: HolidayRecord = {
        id: `H-${holidayStore.length + 1}`,
        status: body.status ?? 'announced',
        createdAt: now,
        updatedAt: now,
        ...body,
      };
      holidayStore = [created, ...holidayStore];
      return created;
    },
    successMsg: 'Holiday created successfully',
    errorMsg: 'Failed to create holiday',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateHoliday = () =>
  useAppMutation({
    mutationFn: async (body: { id: string } & Partial<Omit<HolidayRecord, 'id' | 'createdAt'>>) => {
      await mockDelay(200);
      ensureSeed();
      const current = holidayStore.find((h) => h.id === body.id);
      if (!current) throw new Error('Holiday not found');
      const next: HolidayRecord = { ...current, ...body, updatedAt: new Date().toISOString() };
      holidayStore = holidayStore.map((h) => (h.id === body.id ? next : h));
      return next;
    },
    successMsg: 'Holiday updated successfully',
    errorMsg: 'Failed to update holiday',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

export const useDeleteHoliday = () =>
  useAppMutation({
    mutationFn: async (body: { id: string }) => {
      await mockDelay(160);
      ensureSeed();
      holidayStore = holidayStore.filter((h) => h.id !== body.id);
      return { id: body.id };
    },
    successMsg: 'Holiday deleted successfully',
    errorMsg: 'Failed to delete holiday',
    invalidateQueryKeys: [[API, 'list']],
  });

