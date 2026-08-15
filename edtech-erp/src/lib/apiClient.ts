import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import type { ApiResponse } from '@/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export function unwrapApi<T>(response: AxiosResponse<ApiResponse<T>>): T {
  return response.data.data;
}

// Request interceptor — attach token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message ?? 'Something went wrong';

    if (status === 401) {
      store.dispatch(logout());
      store.dispatch(
        addToast({ type: 'error', title: 'Session Expired', description: 'Please log in again.' })
      );
    } else if (status === 403) {
      store.dispatch(
        addToast({ type: 'error', title: 'Access Denied', description: 'You do not have permission.' })
      );
    } else if (status === 500) {
      store.dispatch(
        addToast({ type: 'error', title: 'Server Error', description: message })
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;
