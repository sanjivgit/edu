import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';

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

interface BackendHoliday {
  id: string;
  title: string;
  type: HolidayType;
  startDate: string;
  endDate: string;
  isFullDay: boolean;
  appliesTo: HolidayAppliesTo;
  status: HolidayStatus;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

function toDateString(value?: string): string {
  return (value ?? '').split('T')[0];
}

function toHolidayRecord(h: BackendHoliday): HolidayRecord {
  return {
    id: h.id,
    title: h.title,
    type: h.type,
    startDate: toDateString(h.startDate),
    endDate: toDateString(h.endDate),
    isFullDay: h.isFullDay,
    appliesTo: h.appliesTo,
    status: h.status,
    description: h.description ?? '',
    createdAt: h.createdAt,
    updatedAt: h.updatedAt,
  };
}

export const useGetHolidays = () =>
  useQuery({
    queryKey: [API, 'list'],
    queryFn: async () => {
      const res = await apiClient
        .get<ApiResponse<BackendHoliday[]>>(API, { params: { limit: 500 } })
        .then(unwrapApi);
      return (res ?? [])
        .map(toHolidayRecord)
        .sort((a, b) => b.startDate.localeCompare(a.startDate));
    },
  });

export const useGetHolidayById = ({ holidayId }: { holidayId?: string }) =>
  useQuery({
    queryKey: [API, 'detail', holidayId],
    queryFn: async () => {
      if (!holidayId) return null;
      const h = await apiClient.get<ApiResponse<BackendHoliday>>(`${API}/${holidayId}`).then(unwrapApi);
      return h ? toHolidayRecord(h) : null;
    },
    enabled: !!holidayId,
  });

export const useCreateHoliday = () =>
  useAppMutation<
    HolidayRecord,
    Omit<HolidayRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'> & { status?: HolidayStatus }
  >({
    mutationFn: async (body) => {
      const created = await apiClient
        .post<ApiResponse<BackendHoliday>>(API, {
          title: body.title,
          type: body.type,
          startDate: body.startDate,
          endDate: body.endDate,
          isFullDay: body.isFullDay,
          appliesTo: body.appliesTo,
          status: body.status ?? 'announced',
          description: body.description || undefined,
        })
        .then(unwrapApi);
      return toHolidayRecord(created);
    },
    successMsg: 'Holiday created successfully',
    errorMsg: 'Failed to create holiday',
    invalidateQueryKeys: [[API, 'list']],
  });

export const useUpdateHoliday = () =>
  useAppMutation<
    HolidayRecord,
    { id: string } & Partial<Omit<HolidayRecord, 'id' | 'createdAt'>>
  >({
    mutationFn: async (body) => {
      const updated = await apiClient
        .put<ApiResponse<BackendHoliday>>(`${API}/${body.id}`, {
          title: body.title,
          type: body.type,
          startDate: body.startDate,
          endDate: body.endDate,
          isFullDay: body.isFullDay,
          appliesTo: body.appliesTo,
          status: body.status,
          description: body.description || undefined,
        })
        .then(unwrapApi);
      return toHolidayRecord(updated);
    },
    successMsg: 'Holiday updated successfully',
    errorMsg: 'Failed to update holiday',
    invalidateQueryKeys: [[API, 'list'], [API, 'detail']],
  });

export const useDeleteHoliday = () =>
  useAppMutation<{ id: string }, { id: string }>({
    mutationFn: async (body) => {
      await apiClient.delete(`${API}/${body.id}`);
      return { id: body.id };
    },
    successMsg: 'Holiday deleted successfully',
    errorMsg: 'Failed to delete holiday',
    invalidateQueryKeys: [[API, 'list']],
  });
