import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Toast } from '@/types';

interface UIState {
  toasts: Toast[];
  globalLoading: boolean;
  pageTitle: string;
  breadcrumbs: { label: string; path?: string }[];
}

const initialState: UIState = {
  toasts: [],
  globalLoading: false,
  pageTitle: 'Dashboard',
  breadcrumbs: [],
};

let toastCounter = 0;

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const id = `toast-${++toastCounter}`;
      state.toasts.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    setPageTitle: (state, action: PayloadAction<string>) => {
      state.pageTitle = action.payload;
    },
    setBreadcrumbs: (
      state,
      action: PayloadAction<{ label: string; path?: string }[]>
    ) => {
      state.breadcrumbs = action.payload;
    },
  },
});

export const {
  addToast,
  removeToast,
  clearToasts,
  setGlobalLoading,
  setPageTitle,
  setBreadcrumbs,
} = uiSlice.actions;
export default uiSlice.reducer;
