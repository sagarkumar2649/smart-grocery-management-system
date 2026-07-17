import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark';

interface AppUiState {
  isSidebarCollapsed: boolean;
  theme: ThemeMode;
}

const initialState: AppUiState = {
  isSidebarCollapsed: false,
  theme: 'light',
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
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed, setTheme } = appUiSlice.actions;
export const appUiReducer = appUiSlice.reducer;
