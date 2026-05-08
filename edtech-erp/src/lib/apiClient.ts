import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';

const BASE_URL = 'https://api.educore.app/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

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
