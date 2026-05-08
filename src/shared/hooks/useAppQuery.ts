import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

export function useAppQuery<TData>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = 1000 * 60 * 5,
}: {
  queryKey: readonly unknown[];
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  staleTime?: number;
}) {
  return useQuery({
    queryKey,
    queryFn,
    enabled,
    staleTime,
  } as UseQueryOptions<TData>);
}
