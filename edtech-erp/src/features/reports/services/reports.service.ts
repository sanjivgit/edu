import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { resolveClassId } from '@/features/common/services/lookups.service';

export type ReportType = 'attendance' | 'fees' | 'performance' | 'admissions';

export interface ReportsFilters {
  reportType: ReportType;
  fromDate: string;
  toDate: string;
  classId?: string;
  section?: string;
}

export interface ReportsSummary {
  totalStudents: number;
  avgAttendance: number;
  totalCollected: number;
  pendingFees: number;
  newAdmissions: number;
  avgScore: number;
}

export interface TrendPoint {
  date: string;
  value: number;
}

export interface ReportsPayload {
  summary: ReportsSummary;
  trend: TrendPoint[];
  topRows: Array<{ label: string; value: number; meta?: string }>;
}

const API = '/reports';

interface BackendReport {
  summary?: Record<string, number>;
  trend?: TrendPoint[];
  topRows?: Array<{ label: string; value: number; meta?: string }>;
}

function toReportsPayload(b: BackendReport): ReportsPayload {
  const s = b.summary ?? {};
  return {
    summary: {
      totalStudents: s.totalStudents ?? 0,
      avgAttendance: s.avgAttendance ?? 0,
      totalCollected: s.totalCollected ?? 0,
      pendingFees: s.pendingFees ?? 0,
      newAdmissions: s.newAdmissions ?? 0,
      avgScore: s.avgScore ?? 0,
    },
    trend: (b.trend ?? []).map((t) => ({ date: t.date, value: t.value })),
    topRows: (b.topRows ?? []).map((r) => ({ label: r.label, value: r.value, meta: r.meta })),
  };
}

function backendType(type: ReportType): string {
  if (type === 'performance') return 'academic';
  return type;
}

export const useGetReports = ({ filters }: { filters: ReportsFilters }) =>
  useQuery({
    queryKey: [API, 'dashboard', filters],
    queryFn: async () => {
      const classId = filters.classId ? await resolveClassId(filters.classId) : undefined;
      const params: Record<string, string> = {
        from: filters.fromDate,
        to: filters.toDate,
      };
      if (classId) params.classId = classId;
      if (filters.section) params.section = filters.section;
      const res = await apiClient
        .get<ApiResponse<BackendReport>>(`${API}/${backendType(filters.reportType)}`, { params })
        .then(unwrapApi);
      return toReportsPayload(res ?? {});
    },
  });
