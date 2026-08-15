import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import { server } from './server';
import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { clearToasts } from '@/store/slices/uiSlice';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

beforeEach(() => {
  localStorage.clear();
  store.dispatch(logout());
  store.dispatch(clearToasts());
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
