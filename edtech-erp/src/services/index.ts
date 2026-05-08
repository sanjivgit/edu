import apiClient from '@/lib/apiClient';
import type { ApiResponse, PaginationParams, Student, Payment, AttendanceRecord, FeeStructure, ClassRoom, Notification } from '@/types';

// ─── Student / Admission Service ────────────────────────────────────────────────
export const studentService = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<Student[]>>('/students', { params }),
  getById: (id: string) =>
    apiClient.get<ApiResponse<Student>>(`/students/${id}`),
  create: (data: Partial<Student>) =>
    apiClient.post<ApiResponse<Student>>('/students', data),
  update: (id: string, data: Partial<Student>) =>
    apiClient.put<ApiResponse<Student>>(`/students/${id}`, data),
  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/students/${id}`),
  getAdmissions: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<Student[]>>('/admissions', { params }),
  approveAdmission: (id: string) =>
    apiClient.patch<ApiResponse<Student>>(`/admissions/${id}/approve`),
  rejectAdmission: (id: string) =>
    apiClient.patch<ApiResponse<Student>>(`/admissions/${id}/reject`),
};

// ─── Fee Service ────────────────────────────────────────────────────────────────
export const feeService = {
  getStructures: () =>
    apiClient.get<ApiResponse<FeeStructure[]>>('/fees/structures'),
  createStructure: (data: Partial<FeeStructure>) =>
    apiClient.post<ApiResponse<FeeStructure>>('/fees/structures', data),
  getPayments: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<Payment[]>>('/fees/payments', { params }),
  recordPayment: (data: Partial<Payment>) =>
    apiClient.post<ApiResponse<Payment>>('/fees/payments', data),
  generateInvoice: (studentId: string, month: string) =>
    apiClient.post<ApiResponse<{ url: string }>>('/fees/invoices', { studentId, month }),
  sendReminder: (studentId: string) =>
    apiClient.post<ApiResponse<null>>(`/fees/reminders/${studentId}`),
  getOverdue: () =>
    apiClient.get<ApiResponse<Payment[]>>('/fees/payments/overdue'),
};

// ─── Attendance Service ─────────────────────────────────────────────────────────
export const attendanceService = {
  getByDate: (classId: string, date: string) =>
    apiClient.get<ApiResponse<AttendanceRecord[]>>('/attendance', { params: { classId, date } }),
  mark: (records: Partial<AttendanceRecord>[]) =>
    apiClient.post<ApiResponse<AttendanceRecord[]>>('/attendance', { records }),
  getStudentSummary: (studentId: string, month: string) =>
    apiClient.get<ApiResponse<{ present: number; absent: number; late: number; percentage: number }>>(`/attendance/summary/${studentId}`, { params: { month } }),
  getClassReport: (classId: string, from: string, to: string) =>
    apiClient.get<ApiResponse<Record<string, number>>>('/attendance/report', { params: { classId, from, to } }),
};

// ─── Class / Subject Service ────────────────────────────────────────────────────
export const classService = {
  getAll: () =>
    apiClient.get<ApiResponse<ClassRoom[]>>('/classes'),
  getById: (id: string) =>
    apiClient.get<ApiResponse<ClassRoom>>(`/classes/${id}`),
  create: (data: Partial<ClassRoom>) =>
    apiClient.post<ApiResponse<ClassRoom>>('/classes', data),
  update: (id: string, data: Partial<ClassRoom>) =>
    apiClient.put<ApiResponse<ClassRoom>>(`/classes/${id}`, data),
  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/classes/${id}`),
  getStudents: (classId: string) =>
    apiClient.get<ApiResponse<Student[]>>(`/classes/${classId}/students`),
};

export const subjectService = {
  getAll: () =>
    apiClient.get<ApiResponse<{ id: string; name: string; code: string; teacherId: string; classIds: string[] }[]>>('/subjects'),
  create: (data: Record<string, unknown>) =>
    apiClient.post('/subjects', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/subjects/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/subjects/${id}`),
};

// ─── Homework Service ───────────────────────────────────────────────────────────
export const homeworkService = {
  getAll: (params?: PaginationParams) =>
    apiClient.get('/homework', { params }),
  create: (data: Record<string, unknown>) =>
    apiClient.post('/homework', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/homework/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/homework/${id}`),
  getSubmissions: (homeworkId: string) =>
    apiClient.get(`/homework/${homeworkId}/submissions`),
};

// ─── Assessment / Exam Service ──────────────────────────────────────────────────
export const assessmentService = {
  getAll: (params?: PaginationParams) =>
    apiClient.get('/assessments', { params }),
  create: (data: Record<string, unknown>) =>
    apiClient.post('/assessments', data),
  getResults: (assessmentId: string) =>
    apiClient.get(`/assessments/${assessmentId}/results`),
  submitResult: (assessmentId: string, data: Record<string, unknown>) =>
    apiClient.post(`/assessments/${assessmentId}/results`, data),
};

export const examService = {
  getAll: (params?: PaginationParams) =>
    apiClient.get('/exams', { params }),
  create: (data: Record<string, unknown>) =>
    apiClient.post('/exams', data),
  getSchedule: (classId: string) =>
    apiClient.get(`/exams/schedule/${classId}`),
  publishResults: (examId: string) =>
    apiClient.patch(`/exams/${examId}/publish`),
};

// ─── Noticeboard / Diary / Holidays ────────────────────────────────────────────
export const noticeboardService = {
  getAll: (params?: PaginationParams) =>
    apiClient.get('/notices', { params }),
  create: (data: Record<string, unknown>) =>
    apiClient.post('/notices', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/notices/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/notices/${id}`),
};

export const diaryService = {
  getEntries: (date?: string, classId?: string) =>
    apiClient.get('/diary', { params: { date, classId } }),
  create: (data: Record<string, unknown>) =>
    apiClient.post('/diary', data),
};

export const holidayService = {
  getAll: (year: number) =>
    apiClient.get(`/holidays?year=${year}`),
  create: (data: Record<string, unknown>) =>
    apiClient.post('/holidays', data),
  delete: (id: string) =>
    apiClient.delete(`/holidays/${id}`),
};

// ─── Notification Service ───────────────────────────────────────────────────────
export const notificationService = {
  getAll: () =>
    apiClient.get<ApiResponse<Notification[]>>('/notifications'),
  markRead: (id: string) =>
    apiClient.patch<ApiResponse<null>>(`/notifications/${id}/read`),
  markAllRead: () =>
    apiClient.patch<ApiResponse<null>>('/notifications/read-all'),
  sendBulk: (data: { title: string; message: string; roles: string[] }) =>
    apiClient.post('/notifications/bulk', data),
};

// ─── Chat / Messaging Service ───────────────────────────────────────────────────
export const chatService = {
  getConversations: () =>
    apiClient.get('/chat/conversations'),
  getMessages: (conversationId: string, params?: PaginationParams) =>
    apiClient.get(`/chat/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId: string, content: string) =>
    apiClient.post(`/chat/conversations/${conversationId}/messages`, { content }),
  createConversation: (participantIds: string[]) =>
    apiClient.post('/chat/conversations', { participantIds }),
};

// ─── Transport Service ──────────────────────────────────────────────────────────
export const transportService = {
  getRoutes: () =>
    apiClient.get('/transport/routes'),
  getVehicles: () =>
    apiClient.get('/transport/vehicles'),
  assignStudent: (studentId: string, routeId: string) =>
    apiClient.post('/transport/assign', { studentId, routeId }),
  trackVehicle: (vehicleId: string) =>
    apiClient.get(`/transport/track/${vehicleId}`),
};

// ─── Timetable Service ──────────────────────────────────────────────────────────
export const timetableService = {
  getByClass: (classId: string) =>
    apiClient.get(`/timetable/${classId}`),
  create: (data: Record<string, unknown>) =>
    apiClient.post('/timetable', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/timetable/${id}`, data),
};

// ─── Gallery Service ────────────────────────────────────────────────────────────
export const galleryService = {
  getAlbums: () =>
    apiClient.get('/gallery/albums'),
  getPhotos: (albumId: string) =>
    apiClient.get(`/gallery/albums/${albumId}/photos`),
  uploadPhoto: (albumId: string, formData: FormData) =>
    apiClient.post(`/gallery/albums/${albumId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deletePhoto: (photoId: string) =>
    apiClient.delete(`/gallery/photos/${photoId}`),
};

// ─── Live / Recorded Lecture Service ───────────────────────────────────────────
export const lectureService = {
  getLiveSessions: (params?: PaginationParams) =>
    apiClient.get('/lectures/live', { params }),
  createLiveSession: (data: Record<string, unknown>) =>
    apiClient.post('/lectures/live', data),
  joinSession: (sessionId: string) =>
    apiClient.post(`/lectures/live/${sessionId}/join`),
  getRecorded: (params?: PaginationParams) =>
    apiClient.get('/lectures/recorded', { params }),
  uploadRecording: (formData: FormData) =>
    apiClient.post('/lectures/recorded', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ─── Reports Service ────────────────────────────────────────────────────────────
export const reportsService = {
  getAttendanceReport: (params: Record<string, string>) =>
    apiClient.get('/reports/attendance', { params }),
  getFeeReport: (params: Record<string, string>) =>
    apiClient.get('/reports/fees', { params }),
  getAcademicReport: (params: Record<string, string>) =>
    apiClient.get('/reports/academic', { params }),
  export: (type: string, format: 'pdf' | 'xlsx', params: Record<string, string>) =>
    apiClient.get(`/reports/${type}/export`, { params: { ...params, format }, responseType: 'blob' }),
};

// ─── Settings / Tenant Service ──────────────────────────────────────────────────
export const settingsService = {
  getBranding: () =>
    apiClient.get('/settings/branding'),
  updateBranding: (data: Record<string, unknown>) =>
    apiClient.put('/settings/branding', data),
  getSystemConfig: () =>
    apiClient.get('/settings/system'),
  updateSystemConfig: (data: Record<string, unknown>) =>
    apiClient.put('/settings/system', data),
  uploadLogo: (formData: FormData) =>
    apiClient.post('/settings/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ─── Roles / Permissions Service ───────────────────────────────────────────────
export const rolesService = {
  getRoles: () =>
    apiClient.get('/roles'),
  createRole: (data: Record<string, unknown>) =>
    apiClient.post('/roles', data),
  updateRole: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/roles/${id}`, data),
  deleteRole: (id: string) =>
    apiClient.delete(`/roles/${id}`),
  getPermissions: () =>
    apiClient.get('/permissions'),
  assignPermissions: (roleId: string, permissions: string[]) =>
    apiClient.put(`/roles/${roleId}/permissions`, { permissions }),
};

// ─── Audit Log Service ──────────────────────────────────────────────────────────
export const auditService = {
  getLogs: (params?: PaginationParams & { module?: string; action?: string; from?: string; to?: string }) =>
    apiClient.get('/audit-logs', { params }),
  exportLogs: (params: Record<string, string>) =>
    apiClient.get('/audit-logs/export', { params, responseType: 'blob' }),
};

// ─── Syllabus Service ───────────────────────────────────────────────────────────
export const syllabusService = {
  getAll: (params?: { classId?: string; subjectId?: string }) =>
    apiClient.get('/syllabus', { params }),
  create: (data: Record<string, unknown>) =>
    apiClient.post('/syllabus', data),
  updateProgress: (id: string, progress: number) =>
    apiClient.patch(`/syllabus/${id}/progress`, { progress }),
};
