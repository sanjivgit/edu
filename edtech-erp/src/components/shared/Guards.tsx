import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import type { UserRole } from '@/types';
import { PageError } from '@/components/shared/ErrorBoundary';

// ─── Require Auth ───────────────────────────────────────────────────────────────
interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// ─── Require Role ───────────────────────────────────────────────────────────────
interface RequireRoleProps {
  children: React.ReactNode;
  roles: UserRole[];
  redirectTo?: string;
}

export function RequireRole({ children, roles, redirectTo = '/dashboard' }: RequireRoleProps) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    if (redirectTo) return <Navigate to={redirectTo} replace />;
    return (
      <PageError
        title="Access Denied"
        message="You do not have permission to view this page."
      />
    );
  }

  return <>{children}</>;
}

// ─── Require Permission ─────────────────────────────────────────────────────────
interface RequirePermissionProps {
  children: React.ReactNode;
  permission: string | string[];
  requireAll?: boolean;
}

export function RequirePermission({
  children,
  permission,
  requireAll = false,
}: RequirePermissionProps) {
  const { user } = useAuth();

  if (!user) return null;

  const perms = Array.isArray(permission) ? permission : [permission];
  const hasAccess = requireAll
    ? perms.every((p) => user.permissions.includes(p))
    : perms.some((p) => user.permissions.includes(p));

  if (!hasAccess) return null;

  return <>{children}</>;
}

// ─── Guest Only (redirect if logged in) ────────────────────────────────────────
interface GuestOnlyProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function GuestOnly({ children, redirectTo = '/dashboard' }: GuestOnlyProps) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
