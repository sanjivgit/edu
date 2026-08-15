import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  Users, UserCheck, School, CreditCard, UserPlus, Clock, AlertCircle,
  BookMarked, PenLine, GraduationCap, Bell, CheckCircle, XCircle,
  type LucideIcon,
} from 'lucide-react';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';

// ─── Types ──────────────────────────────────────────────────────────────────────
export interface DashboardStat {
  id: string;
  label: string;
  value: number;
  icon: string;
  color: string;
  prefix?: string;
}

export interface DashboardStatsResponse {
  stats: DashboardStat[];
  className?: string;
  section?: string;
}

export interface EnrollmentPoint {
  month: string;
  students: number;
  target: number;
}

export interface AttendancePoint {
  date: string;
  present: number;
  total: number;
  percentage: number;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  module: string;
  timestamp: string;
  type: string;
}

// ─── Service-layer mapping: backend stat → StatCard props ─────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  UserCheck,
  School,
  CreditCard,
  UserPlus,
  Clock,
  AlertCircle,
  BookMarked,
  PenLine,
  GraduationCap,
  Bell,
  CheckCircle,
  XCircle,
};

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  purple: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
  orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  red: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
  gray: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
};

export interface MappedStat {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBg: string;
  prefix?: string;
}

export function mapDashboardStat(stat: DashboardStat): MappedStat {
  const Icon = ICON_MAP[stat.icon] ?? Bell;
  return {
    label: stat.label,
    value: stat.value,
    icon: <Icon className="h-5 w-5" />,
    iconBg: COLOR_MAP[stat.color] ?? COLOR_MAP.gray,
    prefix: stat.prefix,
  };
}

// ─── Queries ────────────────────────────────────────────────────────────────────

const Q = {
  stats: (role?: string) => ['dashboard', 'stats', role ?? 'admin'] as const,
  enrollment: (year?: number) => ['dashboard', 'enrollment', year ?? 'current'] as const,
  attendance: (classId?: string) => ['dashboard', 'attendance', classId ?? 'all'] as const,
  activity: ['dashboard', 'activity'] as const,
};

export const useDashboardStats = (role?: string) =>
  useQuery({
    queryKey: Q.stats(role),
    queryFn: () =>
      apiClient
        .get<ApiResponse<DashboardStatsResponse>>('/dashboard/stats', {
          params: { role },
        })
        .then(unwrapApi),
    staleTime: 60_000,
  });

export const useEnrollmentTrend = (year?: number) =>
  useQuery({
    queryKey: Q.enrollment(year),
    queryFn: () =>
      apiClient
        .get<ApiResponse<EnrollmentPoint[]>>('/dashboard/enrollment-trend', {
          params: { year: year ?? undefined },
        })
        .then(unwrapApi),
    staleTime: 60_000,
  });

export const useAttendanceSummary = (classId?: string) =>
  useQuery({
    queryKey: Q.attendance(classId),
    queryFn: () =>
      apiClient
        .get<ApiResponse<AttendancePoint[]>>('/dashboard/attendance-summary', {
          params: { classId: classId ?? undefined },
        })
        .then(unwrapApi),
    staleTime: 60_000,
  });

export const useRecentActivity = () =>
  useQuery({
    queryKey: Q.activity,
    queryFn: () =>
      apiClient.get<ApiResponse<ActivityItem[]>>('/dashboard/recent-activity').then(unwrapApi),
    staleTime: 30_000,
  });
