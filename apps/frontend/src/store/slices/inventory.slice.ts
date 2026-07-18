import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type InventoryTab =
  | 'dashboard'
  | 'stock'
  | 'low-stock'
  | 'out-of-stock'
  | 'movements'
  | 'adjustment'
  | 'purchase'
  | 'damaged'
  | 'expired'
  | 'batches';

interface InventoryFilters {
  search: string;
  category: string;
  stockStatus: '' | 'in' | 'low' | 'out';
  movementType: string;
  startDate: string;
  endDate: string;
  batchNumber: string;
}

interface InventoryState {
  activeTab: InventoryTab;
  filters: InventoryFilters;
}

const initialState: InventoryState = {
  activeTab: 'dashboard',
  filters: {
    search: '',
    category: '',
    stockStatus: '',
    movementType: '',
    startDate: '',
    endDate: '',
    batchNumber: '',
  },
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<InventoryTab>) {
      state.activeTab = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<InventoryFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
  },
});

export const { setActiveTab, setFilters, resetFilters } = inventorySlice.actions;
export const inventoryReducer = inventorySlice.reducer;
