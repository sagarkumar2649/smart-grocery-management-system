import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SettingsTab =
  | "store"
  | "payment"
  | "tax"
  | "invoice"
  | "printer"
  | "notifications"
  | "security"
  | "appearance"
  | "backup"
  | "cloudinary"
  | "profile";

interface SettingsState {
  activeTab: SettingsTab;
}

const initialState: SettingsState = {
  activeTab: "store",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<SettingsTab>) {
      state.activeTab = action.payload;
    },
  },
});

export const { setActiveTab } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
