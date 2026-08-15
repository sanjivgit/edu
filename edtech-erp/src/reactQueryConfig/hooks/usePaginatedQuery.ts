import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { ApiResponse, PaginationMeta, PaginationParams } from '@/types';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UsePaginatedQueryOptions<T> {
  queryKey: readonly unknown[];
  url: string;
  params?: PaginationParams;
  enabled?: boolean;
  select?: (items: T[], meta?: PaginationMeta) => T[];
  placeholderData?: UseQueryOptions<PaginatedResult<T>>['placeholderData'];
}

export function usePaginatedQuery<T>({
  queryKey,
  url,
  params,
  enabled = true,
  select,
  placeholderData,
}: UsePaginatedQueryOptions<T>) {
  return useQuery({
    queryKey: [...queryKey, params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<T[]>>(url, { params });
      const items = response.data.data ?? [];
      const meta = response.data.meta;
      return {
        items: select ? select(items, meta) : items,
        total: meta?.total ?? items.length,
        page: meta?.page ?? 1,
        limit: meta?.limit ?? params?.limit ?? 10,
        totalPages: meta?.totalPages ?? 1,
      };
    },
    enabled,
    placeholderData,
  } as UseQueryOptions<PaginatedResult<T>>);
}
