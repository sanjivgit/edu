import type { UserRole } from '@/types';

export const ALL_ROLES: UserRole[] = ['superadmin', 'admin', 'teacher', 'student', 'parent'];
export const MANAGEMENT_ROLES: UserRole[] = ['superadmin', 'admin'];
export const TEACHING_STAFF_ROLES: UserRole[] = ['superadmin', 'admin', 'teacher'];
export const PARENT_ROLES: UserRole[] = ['parent'];
export const STUDENT_ROLES: UserRole[] = ['student'];

export function hasRoleAccess(role: UserRole | undefined, allowed: readonly UserRole[]): boolean {
  return !!role && allowed.includes(role);
}

/** Module-level view vs mutate. Used for UI copy and nested route guards. */
export const ACCESS = {
  markAttendance: TEACHING_STAFF_ROLES,
  manageFees: MANAGEMENT_ROLES,
  payFees: PARENT_ROLES,
  manageStudents: MANAGEMENT_ROLES,
  viewStudents: TEACHING_STAFF_ROLES,
  manageTeachers: MANAGEMENT_ROLES,
  manageSubjects: MANAGEMENT_ROLES,
  manageSyllabus: MANAGEMENT_ROLES,
  manageTimetable: MANAGEMENT_ROLES,
  manageHomework: TEACHING_STAFF_ROLES,
  manageAssessments: TEACHING_STAFF_ROLES,
  manageExams: TEACHING_STAFF_ROLES,
  manageScoreCards: TEACHING_STAFF_ROLES,
  manageNotices: TEACHING_STAFF_ROLES,
  manageDiary: TEACHING_STAFF_ROLES,
  manageNotifications: TEACHING_STAFF_ROLES,
  manageHolidays: MANAGEMENT_ROLES,
  manageTransport: MANAGEMENT_ROLES,
  manageGallery: TEACHING_STAFF_ROLES,
  manageLectures: TEACHING_STAFF_ROLES,
  manageInvoices: MANAGEMENT_ROLES,
  manageRoles: MANAGEMENT_ROLES,
  manageAdmissions: MANAGEMENT_ROLES,
} as const;
