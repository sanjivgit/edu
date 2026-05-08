# EduCore ERP — Architecture & Developer Guide

## Overview

EduCore ERP is a production-grade EdTech School Management System built with React 18, TypeScript, and a modern enterprise stack. It supports 25+ feature modules, 5 user roles, full theme customization, and a highly scalable modular architecture.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 + TypeScript |
| Routing | React Router DOM v6 |
| Server State | TanStack React Query v5 |
| Global State | Redux Toolkit |
| Local State | Context API / useState |
| Styling | Tailwind CSS + ShadCN UI |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios (with interceptors) |
| Charts | Recharts |
| Build Tool | Vite |

---

## Folder Structure

```
src/
├── app/                          # App bootstrap
│   ├── App.tsx                   # Root with all providers
│   ├── router.tsx                # Lazy-loaded route definitions
│   └── ThemeProvider.tsx         # DOM theme/dark mode applier
│
├── assets/                       # Static assets (images, fonts, icons)
│
├── components/
│   ├── ui/                       # Reusable Design System components
│   │   ├── Button.tsx            # Button with variants + loading state
│   │   ├── Input.tsx             # Input, Textarea, SelectInput, Label
│   │   ├── Card.tsx              # Card, StatCard, CardHeader etc.
│   │   ├── Badge.tsx             # Badge, StatusBadge (auto-color)
│   │   ├── DataTable.tsx         # Full-featured table: sort/search/page
│   │   ├── Modal.tsx             # Modal, ConfirmModal, Drawer
│   │   ├── Toast.tsx             # ToastContainer (Redux-driven)
│   │   ├── Avatar.tsx            # Avatar, AvatarGroup
│   │   └── Skeleton.tsx          # Skeleton, TableSkeleton, PageSkeleton
│   │
│   ├── layout/                   # App shell layout components
│   │   ├── AppShell.tsx          # Root layout: sidebar + topbar + outlet
│   │   ├── Sidebar.tsx           # Dynamic nav from module config
│   │   └── Topbar.tsx            # Breadcrumb, theme, notifications, user
│   │
│   └── shared/                   # Cross-feature shared components
│       ├── ErrorBoundary.tsx     # React error boundary + PageError
│       ├── Guards.tsx            # RequireAuth, RequireRole, GuestOnly
│       └── PageHeader.tsx        # Consistent page title + actions bar
│
├── config/
│   └── modules.config.ts         # Module/nav config, role mapping, theme options
│
├── features/                     # Feature-based modules (isolated)
│   ├── auth/
│   │   └── pages/
│   │       ├── LoginPage.tsx
│   │       ├── ForgotPasswordPage.tsx  # + OTP + Reset components
│   │       ├── OtpVerifyPage.tsx
│   │       └── ResetPasswordPage.tsx
│   ├── dashboard/pages/DashboardPage.tsx
│   ├── admission/pages/AdmissionPage.tsx
│   ├── attendance/pages/AttendancePage.tsx
│   ├── fees/pages/FeesPage.tsx
│   ├── invoice/pages/InvoicePage.tsx
│   ├── timetable/pages/TimetablePage.tsx
│   ├── subjects/pages/SubjectsPage.tsx
│   ├── homework/pages/HomeworkPage.tsx
│   ├── assessment/pages/AssessmentPage.tsx
│   ├── exam/pages/ExamPage.tsx
│   ├── noticeboard/pages/NoticeboardPage.tsx
│   ├── noticeboard/pages/DiaryPage.tsx
│   ├── holidays/pages/HolidaysPage.tsx
│   ├── chat/pages/ChatPage.tsx
│   ├── gallery/pages/GalleryPage.tsx
│   ├── syllabus/pages/SyllabusPage.tsx
│   ├── classes/pages/ClassesPage.tsx
│   ├── transport/pages/TransportPage.tsx
│   ├── live-lecture/pages/LiveLecturePage.tsx
│   ├── recorded-lecture/pages/RecordedLecturePage.tsx
│   ├── reports/pages/ReportsPage.tsx
│   ├── notifications/pages/NotificationsPage.tsx
│   ├── roles/pages/RolesPage.tsx
│   ├── audit-logs/pages/AuditLogsPage.tsx
│   └── settings/pages/SettingsPage.tsx
│
├── hooks/
│   ├── index.ts                  # useAuth, useTheme, useToast, useNotifications, useUI
│   └── useAppDispatch.ts         # Typed Redux dispatch/selector hooks
│
├── lib/
│   ├── apiClient.ts              # Axios instance with interceptors
│   └── utils.ts                 # cn() utility (tailwind-merge + clsx)
│
├── services/                     # API service layer (one file per module)
│   ├── authService.ts
│   └── dashboardService.ts
│   # ... add: admissionService.ts, feesService.ts, etc.
│
├── store/
│   ├── index.ts                  # Redux store configuration
│   └── slices/
│       ├── authSlice.ts          # User, token, auth state
│       ├── themeSlice.ts         # colorMode, variant, branding, sidebarCollapsed
│       ├── uiSlice.ts            # toasts, globalLoading, breadcrumbs
│       └── notificationSlice.ts  # notifications, unreadCount
│
├── styles/
│   └── globals.css               # Tailwind + CSS vars (light/dark/theme variants)
│
├── types/
│   └── index.ts                  # All TypeScript interfaces and types
│
└── utils/
    └── index.ts                  # formatCurrency, formatDate, debounce, etc.
```

---

## Architecture Patterns

### 1. Feature-Based Module Architecture

Each feature lives in `src/features/<module>/` and contains:
- `pages/` — Route-level page components
- `components/` — Module-specific sub-components
- `hooks/` — Module-specific custom hooks
- `types.ts` — Module-specific types
- `api.ts` — API calls specific to the module

This isolation means each module can be worked on independently without affecting others.

### 2. Dynamic Navigation from Config

The sidebar nav is generated at runtime from `MODULE_CONFIG` in `src/config/modules.config.ts`:

```typescript
// Each module declares which roles can see it
export const MODULE_CONFIG: ModuleConfig[] = [
  {
    id: 'admission',
    label: 'Admissions',
    icon: 'UserPlus',
    basePath: '/admissions',
    roles: ['superadmin', 'admin'],  // Only admin+ can see this
    lazy: true,
  },
  // ...
];

// Nav is built per-role at runtime
export function buildNavItems(role: UserRole): NavItem[] {
  return MODULE_CONFIG.filter(m => m.roles.includes(role)).map(...);
}
```

### 3. Role-Based UI Rendering

Three layers of role protection:

```typescript
// Layer 1: Route guard (redirects to /dashboard)
<RequireRole roles={['superadmin', 'admin']}>
  <RolesPage />
</RequireRole>

// Layer 2: Component-level (hides element if no permission)
<RequirePermission permission="fees.write">
  <Button>Record Payment</Button>
</RequirePermission>

// Layer 3: Hook-based logic
const { hasRole, hasPermission } = useAuth();
if (hasRole(['teacher'])) { /* show teacher UI */ }
```

### 4. Dynamic Lazy Routes

All 25+ feature modules are lazy-loaded. The router only loads a module's code when the user navigates to it:

```typescript
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const AdmissionPage = lazy(() => import('@/features/admission/pages/AdmissionPage'));
// ... 25 more modules

// Wrapped in Suspense with skeleton fallback
<Suspense fallback={<PageSkeleton />}>
  <DashboardPage />
</Suspense>
```

### 5. State Management Strategy

| State Type | Solution | Example |
|---|---|---|
| Server/remote data | React Query | Student list, fee records |
| Authentication | Redux Toolkit | User, token |
| UI preferences | Redux Toolkit | Theme, sidebar, toasts |
| Notifications | Redux Toolkit | Notification list, unread count |
| Local form state | useState / RHF | Form inputs |
| Lightweight shared | Context API | Feature-level context |

### 6. Theme Customization

Themes are implemented as CSS custom properties applied to `:root`:

```css
/* 5 theme variants × 2 color modes = 10 combinations */
:root { --primary: 231 70% 55%; }          /* Default: Indigo */
[data-theme="emerald"] { --primary: 158 64% 42%; }
[data-theme="rose"]    { --primary: 348 80% 55%; }
.dark { --background: 224 20% 8%; }        /* Dark mode */
```

Switching themes:
```typescript
// In Redux themeSlice
dispatch(setThemeVariant('emerald'));   // Sets data-theme attribute
dispatch(setColorMode('dark'));         // Adds .dark class to <html>
```

Tenant branding is stored in Redux and applied at mount:
```typescript
dispatch(setBranding({
  instituteName: 'Delhi Public School',
  logo: '/logos/dps.svg',
  theme: 'emerald',
  colorMode: 'light',
}));
```

### 7. API Service Layer

Services are thin wrappers around `apiClient` (Axios). Business logic stays in React Query hooks, not in services:

```typescript
// services/admissionService.ts
export const admissionService = {
  getAll: (params: PaginationParams) =>
    apiClient.get<ApiResponse<Applicant[]>>('/admissions', { params }),
  approve: (id: string) =>
    apiClient.patch<ApiResponse<Applicant>>(`/admissions/${id}/approve`),
};

// In component:
const { data, isLoading } = useQuery({
  queryKey: ['admissions', params],
  queryFn: () => admissionService.getAll(params),
});
```

### 8. Form Handling Pattern

All forms use React Hook Form + Zod for type-safe validation:

```typescript
const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  classId: z.string().min(1, 'Select a class'),
});

type FormData = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

### 9. Reusable DataTable

The `DataTable<T>` component is generic and handles everything:

```typescript
<DataTable<Student>
  columns={[
    { key: 'name', header: 'Student', sortable: true,
      render: (_, row) => <Avatar name={row.name} /> },
    { key: 'status', header: 'Status',
      render: (_, row) => <StatusBadge status={row.status} /> },
  ]}
  data={students}
  total={totalCount}
  isLoading={isLoading}
  onStateChange={(state) => setQueryParams(state)} // server-side
  actions={(row) => <RowActions row={row} />}
/>
```

### 10. Toast System

Driven by Redux — call from anywhere:

```typescript
const { success, error, warning, info } = useToast();
success('Student Added', 'Rahul Singh was enrolled in Class 10-A');
error('Payment Failed', 'Transaction could not be processed');
```

---

## Adding a New Module (Step-by-Step)

1. **Add to module config:**
```typescript
// src/config/modules.config.ts
{ id: 'library', label: 'Library', icon: 'BookCopy',
  basePath: '/library', roles: ['admin', 'teacher', 'student'], lazy: true }
```

2. **Create the feature folder:**
```
src/features/library/
├── pages/LibraryPage.tsx
├── components/BookCard.tsx
├── hooks/useLibrary.ts
└── types.ts
```

3. **Add lazy import to router:**
```typescript
const LibraryPage = lazy(() => import('@/features/library/pages/LibraryPage'));
// Add route: { path: 'library/*', element: <Protected><LibraryPage /></Protected> }
```

4. **Create the service:**
```typescript
// src/services/libraryService.ts
export const libraryService = { getBooks: (...) => apiClient.get(...) };
```

The module auto-appears in the sidebar for allowed roles. No other files need changes.

---

## Environment Variables

```env
VITE_API_BASE_URL=https://api.yourdomain.com/v1
VITE_APP_NAME=EduCore ERP
VITE_TENANT_CODE=school-001
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Production Checklist

- [ ] Replace all mock data with real API calls in `services/`
- [ ] Configure `VITE_API_BASE_URL` for each environment
- [ ] Add real tenant branding via `setBranding()` after login
- [ ] Set up proper JWT refresh token flow in `apiClient.ts`
- [ ] Add React Query `prefetchQuery` for critical routes
- [ ] Configure CSP headers for production deployment
- [ ] Enable Sentry or similar for error tracking
- [ ] Add E2E tests with Playwright per module
- [ ] Set up CI/CD pipeline with build + lint gates

---

## Key Design Decisions

**Why feature-based over layer-based?**
As the app grows (25+ modules), grouping by feature (`features/fees/`) instead of by type (`components/`, `containers/`) means all related code lives together. A developer working on fees only touches `features/fees/`.

**Why Redux for global state instead of just React Query?**
React Query handles *server state* (what's in the database). Redux handles *client state* that doesn't come from an API: authentication session, UI preferences, theme, notification counts.

**Why CSS variables for theming instead of Tailwind config?**
CSS variables can be changed at runtime without re-rendering the entire component tree. Switching from Indigo to Emerald is a single DOM attribute change, not a class rebuild.

**Why lazy loading for all routes?**
The initial JS bundle stays small (<200KB gzipped). Each module loads only when accessed. A parent visiting the dashboard never downloads the Roles & Permissions module code.
