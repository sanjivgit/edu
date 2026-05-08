import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TableState, PaginationParams, ApiResponse } from '@/types';
import { DEFAULT_PAGE_SIZE } from '@/config/modules.config';
import { useToast } from '@/hooks';

// ─── useTableState ──────────────────────────────────────────────────────────────
export function useTableState(defaults?: Partial<TableState>) {
  const [tableState, setTableState] = useState<TableState>({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    search: '',
    sortBy: '',
    sortOrder: 'asc',
    filters: {},
    ...defaults,
  });

  const handleStateChange = useCallback((next: TableState) => {
    setTableState(next);
  }, []);

  const params: PaginationParams = {
    page: tableState.page,
    limit: tableState.limit,
    search: tableState.search || undefined,
    sortBy: tableState.sortBy || undefined,
    sortOrder: tableState.sortOrder,
    filters: Object.keys(tableState.filters).length ? tableState.filters : undefined,
  };

  return { tableState, handleStateChange, params };
}

// ─── useListQuery ───────────────────────────────────────────────────────────────
interface UseListQueryOptions<T> {
  queryKey: unknown[];
  queryFn: (params: PaginationParams) => Promise<{ data: ApiResponse<T[]> }>;
  params: PaginationParams;
}

export function useListQuery<T>({ queryKey, queryFn, params }: UseListQueryOptions<T>) {
  return useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => queryFn(params),
    select: (res) => ({
      data: res.data.data,
      total: res.data.meta?.total ?? 0,
      meta: res.data.meta,
    }),
    placeholderData: (prev) => prev,
  });
}

// ─── useCrudMutations ──────────────────────────────────────────────────────────
interface UseCrudOptions<T> {
  queryKey: string;
  createFn?: (data: Partial<T>) => Promise<unknown>;
  updateFn?: (id: string, data: Partial<T>) => Promise<unknown>;
  deleteFn?: (id: string) => Promise<unknown>;
}

export function useCrudMutations<T>({
  queryKey,
  createFn,
  updateFn,
  deleteFn,
}: UseCrudOptions<T>) {
  const qc = useQueryClient();
  const { success, error } = useToast();

  const invalidate = () => qc.invalidateQueries({ queryKey: [queryKey] });

  const create = useMutation({
    mutationFn: (data: Partial<T>) => createFn!(data),
    onSuccess: () => { success('Created', 'Record created successfully'); invalidate(); },
    onError: () => error('Failed', 'Could not create record'),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<T> }) => updateFn!(id, data),
    onSuccess: () => { success('Updated', 'Record updated successfully'); invalidate(); },
    onError: () => error('Failed', 'Could not update record'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn!(id),
    onSuccess: () => { success('Deleted', 'Record removed successfully'); invalidate(); },
    onError: () => error('Failed', 'Could not delete record'),
  });

  return { create, update, remove };
}

// ─── useModal ──────────────────────────────────────────────────────────────────
export function useModal<T = null>() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((d?: T) => {
    setData(d ?? null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setData(null), 200);
  }, []);

  return { isOpen, data, open, close };
}

// ─── useConfirm ────────────────────────────────────────────────────────────────
export function useConfirm() {
  const [state, setState] = useState<{
    isOpen: boolean;
    title: string;
    description?: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', onConfirm: () => {} });

  const confirm = useCallback(
    (title: string, description: string, onConfirm: () => void) => {
      setState({ isOpen: true, title, description, onConfirm });
    },
    []
  );

  const close = useCallback(() => {
    setState((s) => ({ ...s, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    state.onConfirm();
    close();
  }, [state, close]);

  return { ...state, confirm, close, handleConfirm };
}

// ─── useDebounce ───────────────────────────────────────────────────────────────
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useState(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  });

  return debounced;
}

// ─── useLocalStorage ───────────────────────────────────────────────────────────
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        localStorage.setItem(key, JSON.stringify(resolved));
        return resolved;
      });
    },
    [key]
  );

  return [value, set] as const;
}
