import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { setCredentials } from '@/store/slices/authSlice';
import { useToast } from '@/hooks';
import type { ApiResponse, LoginCredentials, OtpPayload, User } from '@/types';

export interface AuthSession {
  user: User;
  token: string;
  refreshToken?: string;
}

export const authService = {
  login: (credentials: LoginCredentials) =>
    apiClient
      .post<ApiResponse<AuthSession>>('/auth/login', credentials)
      .then(unwrapApi),

  logout: (refreshToken?: string) =>
    apiClient
      .post<ApiResponse<null>>('/auth/logout', { refreshToken })
      .then(unwrapApi),

  forgotPassword: (email: string) =>
    apiClient
      .post<ApiResponse<{ message: string; devOtp?: string }>>('/auth/forgot-password', { email })
      .then(unwrapApi),

  resetPassword: (payload: { email: string; otp: string; newPassword: string }) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', payload).then(unwrapApi),

  verifyOtp: (payload: OtpPayload) =>
    apiClient
      .post<ApiResponse<{ message: string; verified: boolean }>>('/auth/verify-otp', payload)
      .then(unwrapApi),

  resendOtp: (payload: { email: string; purpose: 'login' | 'reset-password' | 'verify-email' }) =>
    apiClient
      .post<ApiResponse<{ message: string; devOtp?: string }>>('/auth/resend-otp', payload)
      .then(unwrapApi),

  getMe: () =>
    apiClient.get<ApiResponse<{ user: User }>>('/auth/me').then(unwrapApi),

  refreshToken: () =>
    apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh').then(unwrapApi),
};

// ─── React Query hooks ──────────────────────────────────────────────────────────
export function useLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (session) => {
      dispatch(
        setCredentials({ user: session.user, token: session.token, refreshToken: session.refreshToken })
      );
      success('Welcome back!', `Logged in as ${session.user.name}`);
      navigate('/dashboard', { replace: true });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid email or password';
      error('Login failed', message);
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.getMe,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLogout() {
  const { success } = useToast();
  return useMutation({
    mutationFn: () => {
      const refreshToken = localStorage.getItem('refresh_token') ?? undefined;
      return authService.logout(refreshToken);
    },
    onSuccess: () => {
      success('Signed out', 'You have been logged out successfully.');
    },
  });
}
