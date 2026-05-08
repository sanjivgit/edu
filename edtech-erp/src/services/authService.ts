import apiClient from '@/lib/apiClient';
import type { ApiResponse, LoginCredentials, OtpPayload, User } from '@/types';

export const authService = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/login', credentials),

  logout: () => apiClient.post('/auth/logout'),

  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<null>>('/auth/forgot-password', { email }),

  resetPassword: (payload: { token: string; password: string }) =>
    apiClient.post<ApiResponse<null>>('/auth/reset-password', payload),

  verifyOtp: (payload: OtpPayload) =>
    apiClient.post<ApiResponse<{ token?: string }>>('/auth/verify-otp', payload),

  resendOtp: (email: string) =>
    apiClient.post<ApiResponse<null>>('/auth/resend-otp', { email }),

  getMe: () => apiClient.get<ApiResponse<User>>('/auth/me'),

  refreshToken: () =>
    apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh'),
};
