import apiClient from '@/lib/apiClient';
import type { ApiResponse, StatCard, ChartData, ActivityItem } from '@/types';

interface DashboardStats {
  stats: StatCard[];
  enrollmentTrend: ChartData[];
  attendanceTrend: ChartData[];
  feeCollection: ChartData[];
  recentActivities: ActivityItem[];
  subjectPerformance: ChartData[];
}

export const dashboardService = {
  getStats: (role: string) =>
    apiClient.get<ApiResponse<DashboardStats>>(`/dashboard/stats?role=${role}`),

  getEnrollmentTrend: (year: number) =>
    apiClient.get<ApiResponse<ChartData[]>>(`/dashboard/enrollment-trend?year=${year}`),

  getAttendanceSummary: (classId?: string) =>
    apiClient.get<ApiResponse<ChartData[]>>(`/dashboard/attendance-summary`, {
      params: { classId },
    }),
};
