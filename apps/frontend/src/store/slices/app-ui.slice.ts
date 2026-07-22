import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_KEY = 'smart-inventory-theme';

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'light';
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveEffectiveTheme(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? getSystemTheme() : mode;
}

function applyThemeToDom(effective: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (effective === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

const initialMode = getInitialTheme();
applyThemeToDom(resolveEffectiveTheme(initialMode));

interface AppUiState {
  isSidebarCollapsed: boolean;
  theme: ThemeMode;
}

const initialState: AppUiState = {
  isSidebarCollapsed: false,
  theme: initialMode,
};

const appUiSlice = createSlice({
  name: 'appUi',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.isSidebarCollapsed = action.payload;
    },
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
      localStorage.setItem(THEME_KEY, action.payload);
      applyThemeToDom(resolveEffectiveTheme(action.payload));
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed, setTheme } = appUiSlice.actions;
export { getSystemTheme, resolveEffectiveTheme, applyThemeToDom };
export const appUiReducer = appUiSlice.reducer;
