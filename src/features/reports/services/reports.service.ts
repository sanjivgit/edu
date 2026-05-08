import { useQuery } from '@tanstack/react-query';
import { mockDelay } from '@/shared/utils';

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

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function dateRange(fromDate: string, toDate: string) {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const days = clamp(Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1, 1, 31);
  return { from, to, days };
}

function seedTrend(filters: ReportsFilters): ReportsPayload {
  const { from, days } = dateRange(filters.fromDate, filters.toDate);
  const base = filters.reportType === 'attendance' ? 88 : filters.reportType === 'fees' ? 40 : filters.reportType === 'performance' ? 72 : 18;
  const jitter = (i: number) => (Math.sin(i * 1.3) + Math.cos(i * 0.7)) * 2.5;

  const trend: TrendPoint[] = Array.from({ length: days }, (_, i) => {
    const d = new Date(from.getTime() + i * 24 * 60 * 60 * 1000);
    const date = d.toISOString().split('T')[0];
    let value = base + jitter(i);
    if (filters.reportType === 'fees') value = base + jitter(i) * 3;
    if (filters.reportType === 'admissions') value = clamp(Math.round(base / 3 + jitter(i) / 2), 0, 50);
    if (filters.reportType === 'attendance') value = clamp(value, 70, 99);
    if (filters.reportType === 'performance') value = clamp(value, 40, 98);
    return { date, value: Math.round(value * 10) / 10 };
  });

  const summary: ReportsSummary = {
    totalStudents: 480,
    avgAttendance: 89.4,
    totalCollected: 382500,
    pendingFees: 74500,
    newAdmissions: 28,
    avgScore: 74.6,
  };

  const topRows =
    filters.reportType === 'attendance'
      ? [
          { label: 'Class 10-A', value: 94.2, meta: 'Best attendance' },
          { label: 'Class 9-B', value: 92.7, meta: 'Consistent' },
          { label: 'Class 8-C', value: 91.3, meta: 'Improving' },
        ]
      : filters.reportType === 'fees'
        ? [
            { label: 'Tuition', value: 245000, meta: 'Collected' },
            { label: 'Transport', value: 68000, meta: 'Collected' },
            { label: 'Exam', value: 42000, meta: 'Collected' },
          ]
        : filters.reportType === 'performance'
          ? [
              { label: 'Mathematics', value: 78.4, meta: 'Avg score' },
              { label: 'Science', value: 75.1, meta: 'Avg score' },
              { label: 'English', value: 73.6, meta: 'Avg score' },
            ]
          : [
              { label: 'Class 1', value: 6, meta: 'Admissions' },
              { label: 'Class 6', value: 5, meta: 'Admissions' },
              { label: 'Class 10', value: 4, meta: 'Admissions' },
            ];

  return { summary, trend, topRows };
}

export const useGetReports = ({ filters }: { filters: ReportsFilters }) =>
  useQuery({
    queryKey: [API, 'dashboard', filters],
    queryFn: async () => {
      await mockDelay(200);
      return seedTrend(filters);
    },
  });

