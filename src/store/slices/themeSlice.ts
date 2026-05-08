import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ColorMode, ThemeVariant, TenantBranding } from '@/types';

interface ThemeState {
  colorMode: ColorMode;
  variant: ThemeVariant;
  branding: TenantBranding | null;
  sidebarCollapsed: boolean;
}

const savedMode = localStorage.getItem('color_mode') as ColorMode | null;
const savedVariant = localStorage.getItem('theme_variant') as ThemeVariant | null;

const initialState: ThemeState = {
  colorMode: savedMode ?? 'light',
  variant: savedVariant ?? 'indigo',
  branding: null,
  sidebarCollapsed: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setColorMode: (state, action: PayloadAction<ColorMode>) => {
      state.colorMode = action.payload;
      localStorage.setItem('color_mode', action.payload);
    },
    setThemeVariant: (state, action: PayloadAction<ThemeVariant>) => {
      state.variant = action.payload;
      localStorage.setItem('theme_variant', action.payload);
    },
    setBranding: (state, action: PayloadAction<TenantBranding>) => {
      state.branding = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
  },
});

export const {
  setColorMode,
  setThemeVariant,
  setBranding,
  toggleSidebar,
  setSidebarCollapsed,
} = themeSlice.actions;
export default themeSlice.reducer;
