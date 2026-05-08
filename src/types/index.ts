// ─── User & Auth ───────────────────────────────────────────────────────────────
export type UserRole = 'superadmin' | 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  tenantId: string;
  permissions: string[];
  meta?: Record<string, unknown>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  tenantCode?: string;
}

export interface OtpPayload {
  email: string;
  otp: string;
  purpose: 'login' | 'reset-password' | 'verify-email';
}

// ─── Tenant / Branding ─────────────────────────────────────────────────────────
export type ThemeVariant = 'indigo' | 'emerald' | 'rose' | 'amber' | 'cyan';
export type ColorMode = 'light' | 'dark' | 'system';

export interface TenantBranding {
  tenantId: string;
  instituteName: string;
  logo: string;
  favicon?: string;
  theme: ThemeVariant;
  colorMode: ColorMode;
  primaryColor?: string;
  tagline?: string;
  address?: string;
  phone?: string;
  website?: string;
}

// ─── Navigation / Routes ───────────────────────────────────────────────────────
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles: UserRole[];
  permissions?: string[];
  badge?: number | string;
  children?: NavItem[];
  isGroup?: boolean;
  groupLabel?: string;
}

export interface ModuleConfig {
  id: string;
  label: string;
  icon: string;
  basePath: string;
  roles: UserRole[];
  permissions?: string[];
  lazy: boolean;
  navItems?: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

// ─── API ───────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, string | number | boolean>;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// ─── Table ─────────────────────────────────────────────────────────────────────
export interface TableColumn<T = unknown> {
  key: string;
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface TableState {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filters: Record<string, string>;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export interface StatCard {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: string;
  suffix?: string;
  prefix?: string;
}

export interface ChartData {
  name: string;
  [key: string]: string | number;
}

export interface ActivityItem {
  id: string;
  user: string;
  avatar?: string;
  action: string;
  module: string;
  timestamp: string;
  type: 'create' | 'update' | 'delete' | 'login' | 'other';
}

// ─── Student / Class ───────────────────────────────────────────────────────────
export interface Student {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  classId: string;
  sectionId: string;
  parentId?: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  admissionDate: string;
  status: 'active' | 'inactive' | 'transferred';
}

export interface ClassRoom {
  id: string;
  name: string;
  section: string;
  teacherId: string;
  subjectIds: string[];
  studentCount: number;
  roomNo?: string;
}

// ─── Fee / Payment ─────────────────────────────────────────────────────────────
export interface FeeStructure {
  id: string;
  name: string;
  classId: string;
  amount: number;
  dueDate: string;
  type: 'tuition' | 'transport' | 'lab' | 'library' | 'exam' | 'other';
  isRecurring: boolean;
  frequency?: 'monthly' | 'quarterly' | 'annually';
}

export interface Payment {
  id: string;
  studentId: string;
  feeId: string;
  amount: number;
  paidDate: string;
  mode: 'cash' | 'online' | 'cheque' | 'dd';
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  receiptNo: string;
  remarks?: string;
}

// ─── Attendance ─────────────────────────────────────────────────────────────────
export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  markedBy: string;
  remarks?: string;
}

// ─── Notification ──────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  link?: string;
  actor?: string;
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

// ─── Misc ──────────────────────────────────────────────────────────────────────
export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  icon?: string;
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'date' | 'text' | 'boolean';
  options?: SelectOption[];
}
