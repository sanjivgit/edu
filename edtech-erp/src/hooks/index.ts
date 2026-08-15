import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import { logout } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import { setColorMode, setThemeVariant, toggleSidebar } from '@/store/slices/themeSlice';
import { authService } from '@/features/auth/services/auth.service';
import type { ColorMode, ThemeVariant, UserRole, Toast } from '@/types';

// ─── Auth Hook ──────────────────────────────────────────────────────────────────
export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoading } = useAppSelector((s) => s.auth);

  const handleLogout = useCallback(() => {
    const refreshToken = localStorage.getItem('refresh_token') ?? undefined;
    authService.logout(refreshToken).catch(() => {
      // Ignore network errors — local session is cleared regardless
    });
    dispatch(logout());
  }, [dispatch]);

  const hasRole = useCallback(
    (roles: UserRole[]) => !!user && roles.includes(user.role),
    [user]
  );

  const hasPermission = useCallback(
    (permission: string) => !!user && user.permissions.includes(permission),
    [user]
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]) =>
      !!user && permissions.some((p) => user.permissions.includes(p)),
    [user]
  );

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    logout: handleLogout,
    hasRole,
    hasPermission,
    hasAnyPermission,
    role: user?.role,
    isSuperAdmin: user?.role === 'superadmin',
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
    isParent: user?.role === 'parent',
  };
}

// ─── Theme Hook ─────────────────────────────────────────────────────────────────
export function useTheme() {
  const dispatch = useAppDispatch();
  const { colorMode, variant, branding, sidebarCollapsed } = useAppSelector(
    (s) => s.theme
  );

  const changeColorMode = useCallback(
    (mode: ColorMode) => dispatch(setColorMode(mode)),
    [dispatch]
  );

  const changeThemeVariant = useCallback(
    (v: ThemeVariant) => dispatch(setThemeVariant(v)),
    [dispatch]
  );

  const handleToggleSidebar = useCallback(
    () => dispatch(toggleSidebar()),
    [dispatch]
  );

  return {
    colorMode,
    variant,
    branding,
    sidebarCollapsed,
    isDark: colorMode === 'dark',
    changeColorMode,
    changeThemeVariant,
    toggleSidebar: handleToggleSidebar,
  };
}

// ─── Toast Hook ─────────────────────────────────────────────────────────────────
export function useToast() {
  const dispatch = useAppDispatch();

  const toast = useCallback(
    (payload: Omit<Toast, 'id'>) => {
      dispatch(addToast(payload));
    },
    [dispatch]
  );

  const success = useCallback(
    (title: string, description?: string) =>
      toast({ type: 'success', title, description, duration: 3000 }),
    [toast]
  );

  const error = useCallback(
    (title: string, description?: string) =>
      toast({ type: 'error', title, description, duration: 5000 }),
    [toast]
  );

  const warning = useCallback(
    (title: string, description?: string) =>
      toast({ type: 'warning', title, description, duration: 4000 }),
    [toast]
  );

  const info = useCallback(
    (title: string, description?: string) =>
      toast({ type: 'info', title, description, duration: 3000 }),
    [toast]
  );

  return { toast, success, error, warning, info };
}

// ─── Notifications Hook ─────────────────────────────────────────────────────────
export function useNotifications() {
  const { items, unreadCount } = useAppSelector((s) => s.notifications);
  return { notifications: items, unreadCount };
}

// ─── UI Hook ───────────────────────────────────────────────────────────────────
export function useUI() {
  // const dispatch = useAppDispatch();
  const { toasts, globalLoading, pageTitle, breadcrumbs } = useAppSelector(
    (s) => s.ui
  );
  return { toasts, globalLoading, pageTitle, breadcrumbs };
}
