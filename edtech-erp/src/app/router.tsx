import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { RequireAuth, GuestOnly, RequireRole } from '@/components/shared/Guards';
import { MODULE_CONFIG } from '@/config/modules.config';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// ─── Lazy imports ───────────────────────────────────────────────────────────────
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));
const OtpVerifyPage = lazy(() => import('@/features/auth/pages/OtpVerifyPage'));

const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const AdmissionPage = lazy(() => import('@/features/admission/pages/AdmissionPage'));
const FeesPage = lazy(() => import('@/features/fees/pages/FeesPage'));
const InvoicePage = lazy(() => import('@/features/invoice/pages/InvoicePage'));
const TimetablePage = lazy(() => import('@/features/timetable/pages/TimetablePage'));
const SubjectsPage = lazy(() => import('@/features/subjects/pages/SubjectsPage'));
const AttendancePage = lazy(() => import('@/features/attendance/pages/AttendancePage'));
const HomeworkPage = lazy(() => import('@/features/homework/pages/HomeworkPage'));
const AssessmentPage = lazy(() => import('@/features/assessment/pages/AssessmentPage'));
const NoticeboardPage = lazy(() => import('@/features/noticeboard/pages/NoticeboardPage'));
const ReportsPage = lazy(() => import('@/features/reports/pages/ReportsPage'));
const ExamPage = lazy(() => import('@/features/exam/pages/ExamPage'));
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage'));
const DiaryPage = lazy(() => import('@/features/diary/pages/DiaryPage'));
const HolidaysPage = lazy(() => import('@/features/holidays/pages/HolidaysPage'));
const ChatPage = lazy(() => import('@/features/chat/pages/ChatPage'));
const GalleryPage = lazy(() => import('@/features/gallery/pages/GalleryPage'));
const SyllabusPage = lazy(() => import('@/features/syllabus/pages/SyllabusPage'));
const ClassesPage = lazy(() => import('@/features/classes/pages/ClassesPage'));
const TransportPage = lazy(() => import('@/features/transport/pages/TransportPage'));
const LiveLecturePage = lazy(() => import('@/features/live-lecture/pages/LiveLecturePage'));
const RecordedLecturePage = lazy(() => import('@/features/recorded-lecture/pages/RecordedLecturePage'));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));
const AuditLogsPage = lazy(() => import('@/features/audit-logs/pages/AuditLogsPage'));
const RolesPage = lazy(() => import('@/features/roles/pages/RolesPage'));
const ProductPage = lazy(() => import('@/features/product/pages/ProductPage'));
const TeachersPage = lazy(() => import('@/features/teachers/pages/TeachersPage'));
const StudentsPage = lazy(() => import('@/features/students/pages/StudentsPage'));

const AdminOverviewPage = lazy(() => import('@/features/admin/pages/AdminOverviewPage'));
const AdminTenantsPage = lazy(() => import('@/features/admin/pages/AdminTenantsPage'));
const AdminTenantDetailPage = lazy(() => import('@/features/admin/pages/AdminTenantDetailPage'));
const AdminSubscriptionsPage = lazy(() => import('@/features/admin/pages/AdminSubscriptionsPage'));
const AdminPlansPage = lazy(() => import('@/features/admin/pages/AdminPlansPage'));
const AdminInvoicesPage = lazy(() => import('@/features/admin/pages/AdminInvoicesPage'));

// ─── Fallback loader ────────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="p-6">
      <PageSkeleton />
    </div>
  );
}

function Lazy({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

// ─── Auth layout wrapper ─────────────────────────────────────────────────────────
function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestOnly>
      <Lazy>{children}</Lazy>
    </GuestOnly>
  );
}

// ─── Protected route wrapper ────────────────────────────────────────────────────
function Protected({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <Lazy>{children}</Lazy>
    </RequireAuth>
  );
}

function ProtectedModule({ children, moduleId }: { children: React.ReactNode; moduleId: string }) {
  const mod = MODULE_CONFIG.find((m) => m.id === moduleId);
  if (!mod) return <Protected>{children}</Protected>;
  return (
    <RequireRole roles={mod.roles}>
      <Protected>{children}</Protected>
    </RequireRole>
  );
}

// ─── Router ─────────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  // Auth routes
  {
    path: '/auth',
    children: [
      { path: 'login', element: <AuthLayout><LoginPage /></AuthLayout> },
      { path: 'forgot-password', element: <AuthLayout><ForgotPasswordPage /></AuthLayout> },
      { path: 'reset-password', element: <AuthLayout><ResetPasswordPage /></AuthLayout> },
      { path: 'otp-verify', element: <AuthLayout><OtpVerifyPage /></AuthLayout> },
    ],
  },
  // App routes
  {
    path: '/',
    element: <RequireAuth><AppShell /></RequireAuth>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <ProtectedModule moduleId="dashboard"><DashboardPage /></ProtectedModule> },
      { path: 'admissions/*', element: <ProtectedModule moduleId="admission"><AdmissionPage /></ProtectedModule> },
      { path: 'fees/*', element: <ProtectedModule moduleId="fees"><FeesPage /></ProtectedModule> },
      { path: 'invoices/*', element: <ProtectedModule moduleId="invoice"><InvoicePage /></ProtectedModule> },
      { path: 'timetable/*', element: <ProtectedModule moduleId="timetable"><TimetablePage /></ProtectedModule> },
      { path: 'subjects/*', element: <ProtectedModule moduleId="subjects"><SubjectsPage /></ProtectedModule> },
      { path: 'attendance/*', element: <ProtectedModule moduleId="attendance"><AttendancePage /></ProtectedModule> },
      { path: 'homework/*', element: <ProtectedModule moduleId="homework"><HomeworkPage /></ProtectedModule> },
      { path: 'assessments/*', element: <ProtectedModule moduleId="assessment"><AssessmentPage /></ProtectedModule> },
      { path: 'noticeboard/*', element: <ProtectedModule moduleId="noticeboard"><NoticeboardPage /></ProtectedModule> },
      { path: 'reports/*', element: <ProtectedModule moduleId="reports"><ReportsPage /></ProtectedModule> },
      { path: 'exams/*', element: <ProtectedModule moduleId="exam"><ExamPage /></ProtectedModule> },
      { path: 'notifications', element: <ProtectedModule moduleId="notifications"><NotificationsPage /></ProtectedModule> },
      { path: 'diary/*', element: <ProtectedModule moduleId="diary"><DiaryPage /></ProtectedModule> },
      { path: 'holidays/*', element: <ProtectedModule moduleId="holidays"><HolidaysPage /></ProtectedModule> },
      { path: 'chat/*', element: <ProtectedModule moduleId="chat"><ChatPage /></ProtectedModule> },
      { path: 'gallery/*', element: <ProtectedModule moduleId="gallery"><GalleryPage /></ProtectedModule> },
      { path: 'syllabus/*', element: <ProtectedModule moduleId="syllabus"><SyllabusPage /></ProtectedModule> },
      { path: 'teachers/*', element: <ProtectedModule moduleId="teachers"><TeachersPage /></ProtectedModule> },
      { path: 'students/*', element: <ProtectedModule moduleId="students"><StudentsPage /></ProtectedModule> },
      { path: 'classes/*', element: <ProtectedModule moduleId="classes"><ClassesPage /></ProtectedModule> },
      { path: 'transport/*', element: <ProtectedModule moduleId="transport"><TransportPage /></ProtectedModule> },
      { path: 'live-classes/*', element: <ProtectedModule moduleId="live-lecture"><LiveLecturePage /></ProtectedModule> },
      { path: 'recorded-lectures/*', element: <ProtectedModule moduleId="recorded-lecture"><RecordedLecturePage /></ProtectedModule> },
      { path: 'settings/*', element: <ProtectedModule moduleId="settings"><SettingsPage /></ProtectedModule> },
      { path: 'audit-logs', element: <ProtectedModule moduleId="audit-logs"><AuditLogsPage /></ProtectedModule> },
      { path: 'roles/*', element: <ProtectedModule moduleId="roles"><RolesPage /></ProtectedModule> },
      { path: 'products/*', element: <ProtectedModule moduleId="product"><ProductPage /></ProtectedModule> },
      { path: 'billing', element: <ProtectedModule moduleId="billing"><AdminOverviewPage /></ProtectedModule> },
      { path: 'billing/schools', element: <ProtectedModule moduleId="billing-tenants"><AdminTenantsPage /></ProtectedModule> },
      { path: 'billing/schools/:id', element: <ProtectedModule moduleId="billing-tenants"><AdminTenantDetailPage /></ProtectedModule> },
      { path: 'billing/subscriptions', element: <ProtectedModule moduleId="billing-subscriptions"><AdminSubscriptionsPage /></ProtectedModule> },
      { path: 'billing/plans', element: <ProtectedModule moduleId="billing-plans"><AdminPlansPage /></ProtectedModule> },
      { path: 'billing/invoices', element: <ProtectedModule moduleId="billing-invoices"><AdminInvoicesPage /></ProtectedModule> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
