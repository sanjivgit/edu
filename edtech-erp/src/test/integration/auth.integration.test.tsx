import { describe, it, expect, beforeEach } from 'vitest';
import { act, waitFor } from '@testing-library/react';
import { renderHookWithProviders } from '@/test/utils';
import { useLogin, useMe } from '@/features/auth/services/auth.service';
import { store } from '@/store';
import { logout, setCredentials } from '@/store/slices/authSlice';
import { makeUser } from '@/test/factories';
import type { User } from '@/types';

const credentials = { email: 'admin@educore.test', password: 'secret123' };

describe('auth integration', () => {
  beforeEach(() => {
    localStorage.clear();
    store.dispatch(logout());
  });

  it('login posts credentials and persists the session to redux + localStorage', async () => {
    const { result } = renderHookWithProviders(() => useLogin());

    await act(async () => {
      result.current.mutate(credentials);
    });

    expect(result.current.isSuccess).toBe(true);
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('jwt-access-token');
    expect(state.user?.email).toBe('admin@educore.test');
    expect(state.user?.role).toBe('superadmin');
    expect(localStorage.getItem('auth_token')).toBe('jwt-access-token');
    expect(localStorage.getItem('refresh_token')).toBe('jwt-refresh-token');
    expect(localStorage.getItem('user')).toContain('Admin User');
  });

  it('attaches the bearer token to authenticated requests', async () => {
    store.dispatch(
      setCredentials({
        user: makeUser() as User,
        token: 'jwt-access-token',
        refreshToken: 'jwt-refresh-token',
      })
    );

    const { result } = renderHookWithProviders(() => useMe());

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 });
    expect(result.current.data?.user.email).toBe('admin@educore.test');
    expect(result.current.data?.user.name).toBe('Admin User');
  });

  it('clears the session and shows an error toast when the API returns 401', async () => {
    const { result } = renderHookWithProviders(() => useMe());

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });

    const auth = store.getState().auth;
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.token).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();

    const toasts = store.getState().ui.toasts;
    expect(toasts.some((t) => t.type === 'error')).toBe(true);
  });
});
