import React, { useState, useCallback, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Input } from './Input';
import { TableSkeleton } from './Skeleton';
import type { TableColumn, TableState } from '@/types';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/config/modules.config';

interface DataTableProps<T extends object> {
  columns: TableColumn<T>[];
  data: T[];
  total: number;
  isLoading?: boolean;
  onStateChange?: (state: TableState) => void;
  keyField?: keyof T;
  searchPlaceholder?: string;
  actions?: (row: T) => React.ReactNode;
  bulkActions?: React.ReactNode;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  className?: string;
  rowClassName?: (row: T) => string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends object>({
  columns,
  data,
  total,
  isLoading = false,
  onStateChange,
  keyField = 'id' as keyof T,
  searchPlaceholder = 'Search...',
  actions,
  emptyMessage = 'No records found.',
  emptyIcon,
  className,
  rowClassName,
  onRowClick,
}: DataTableProps<T>) {
  const [state, setState] = useState<TableState>({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    search: '',
    sortBy: '',
    sortOrder: 'asc',
    filters: {},
  });

  const [searchInput, setSearchInput] = useState('');

  const updateState = useCallback(
    (updates: Partial<TableState>) => {
      const next = { ...state, ...updates };
      setState(next);
      onStateChange?.(next);
    },
    [state, onStateChange]
  );

  const handleSort = useCallback(
    (key: string) => {
      if (state.sortBy === key) {
        updateState({ sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc', page: 1 });
      } else {
        updateState({ sortBy: key, sortOrder: 'asc', page: 1 });
      }
    },
    [state, updateState]
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      updateState({ search: searchInput, page: 1 });
    },
    [searchInput, updateState]
  );

  const totalPages = useMemo(() => Math.ceil(total / state.limit), [total, state.limit]);

  const renderCell = (col: TableColumn<T>, row: T): React.ReactNode => {
    if (col.render) return col.render(row[col.key as keyof T], row);
    if (typeof col.accessor === 'function') return col.accessor(row);
    const val = col.accessor ? row[col.accessor as keyof T] : row[col.key as keyof T];
    return val as React.ReactNode;
  };

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (state.sortBy !== colKey) return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />;
    return state.sortOrder === 'asc'
      ? <ChevronUp className="h-3.5 w-3.5 text-primary" />
      : <ChevronDown className="h-3.5 w-3.5 text-primary" />;
  };

  return (
    <div className={cn('bg-card border border-border rounded-xl overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-border">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:max-w-xs">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder={searchPlaceholder}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-8"
          />
          <Button type="submit" size="sm" variant="outline">
            Search
          </Button>
        </form>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" leftIcon={<SlidersHorizontal className="h-3.5 w-3.5" />}>
            Filter
          </Button>
          <select
            value={state.limit}
            onChange={(e) => updateState({ limit: Number(e.target.value), page: 1 })}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs font-body focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s} per page</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={state.limit} cols={columns.length + (actions ? 1 : 0)} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'px-4 py-3 font-display font-semibold text-xs uppercase tracking-wide text-muted-foreground',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      col.sortable && 'cursor-pointer select-none hover:text-foreground transition-colors',
                      col.width && `w-[${col.width}]`
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <span className="flex items-center gap-1.5">
                      {col.header}
                      {col.sortable && <SortIcon colKey={col.key} />}
                    </span>
                  </th>
                ))}
                {actions && (
                  <th className="px-4 py-3 text-right font-display font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-4 py-16 text-center"
                  >
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      {emptyIcon && <div className="opacity-40">{emptyIcon}</div>}
                      <p className="text-sm">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, rowIdx) => (
                  <tr
                    key={String(row[keyField]) ?? rowIdx}
                    className={cn(
                      'group hover:bg-muted/30 transition-colors',
                      onRowClick && 'cursor-pointer',
                      rowClassName?.(row)
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-3 text-sm',
                          col.align === 'center' && 'text-center',
                          col.align === 'right' && 'text-right'
                        )}
                      >
                        {renderCell(col, row)}
                      </td>
                    ))}
                    {actions && (
                      <td
                        className="px-4 py-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {actions(row)}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground">
            Showing{' '}
            <span className="font-medium text-foreground">
              {(state.page - 1) * state.limit + 1}–
              {Math.min(state.page * state.limit, total)}
            </span>{' '}
            of <span className="font-medium text-foreground">{total}</span> results
          </p>
          <div className="flex items-center gap-1">
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => updateState({ page: Math.max(1, state.page - 1) })}
              disabled={state.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(state.page - 2, totalPages - 4)) + i;
              return (
                <Button
                  key={pageNum}
                  size="icon-sm"
                  variant={pageNum === state.page ? 'default' : 'outline'}
                  onClick={() => updateState({ page: pageNum })}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => updateState({ page: Math.min(totalPages, state.page + 1) })}
              disabled={state.page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
