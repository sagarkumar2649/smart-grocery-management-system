import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type POSDiscountType = 'percentage' | 'flat';

export interface POSCartItem {
  productId: string;
  name: string;
  sku: string;
  imageUrl?: string;
  unitPrice: number;
  mrp: number;
  gstPercent: number;
  stock: number;
  unit: string;
  quantity: number;
  discount: number;
  discountType: POSDiscountType;
}

export interface POSCustomerInfo {
  name: string;
  phone: string;
  email: string;
}

interface POSState {
  items: POSCartItem[];
  billDiscount: number;
  billDiscountType: POSDiscountType;
  couponCode: string | null;
  couponDiscount: number;
  customerInfo: POSCustomerInfo;
  selectedCartItemIndex: number;
}

const initialState: POSState = {
  items: [],
  billDiscount: 0,
  billDiscountType: 'flat',
  couponCode: null,
  couponDiscount: 0,
  customerInfo: { name: '', phone: '', email: '' },
  selectedCartItemIndex: -1,
};

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    addPOSItem(state, action: PayloadAction<Omit<POSCartItem, 'quantity' | 'discount' | 'discountType'>>) {
      const existing = state.items.find((i) => i.productId === action.payload.productId);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + 1, existing.stock);
      } else {
        state.items.push({ ...action.payload, quantity: 1, discount: 0, discountType: 'flat' });
      }
    },
    removePOSItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
      if (state.selectedCartItemIndex >= state.items.length) {
        state.selectedCartItemIndex = state.items.length - 1;
      }
    },
    updatePOSQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const item = state.items.find((i) => i.productId === action.payload.productId);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((i) => i.productId !== action.payload.productId);
          if (state.selectedCartItemIndex >= state.items.length) {
            state.selectedCartItemIndex = state.items.length - 1;
          }
        } else {
          item.quantity = Math.min(action.payload.quantity, item.stock);
        }
      }
    },
    updateItemDiscount(
      state,
      action: PayloadAction<{ productId: string; discount: number; discountType: POSDiscountType }>,
    ) {
      const item = state.items.find((i) => i.productId === action.payload.productId);
      if (item) {
        item.discount = action.payload.discount;
        item.discountType = action.payload.discountType;
      }
    },
    setBillDiscount(state, action: PayloadAction<{ discount: number; discountType: POSDiscountType }>) {
      state.billDiscount = action.payload.discount;
      state.billDiscountType = action.payload.discountType;
    },
    clearBillDiscount(state) {
      state.billDiscount = 0;
      state.billDiscountType = 'flat';
    },
    setCoupon(state, action: PayloadAction<{ code: string; discount: number }>) {
      state.couponCode = action.payload.code;
      state.couponDiscount = action.payload.discount;
    },
    clearCoupon(state) {
      state.couponCode = null;
      state.couponDiscount = 0;
    },
    setCustomerInfo(state, action: PayloadAction<POSCustomerInfo>) {
      state.customerInfo = action.payload;
    },
    setSelectedCartItemIndex(state, action: PayloadAction<number>) {
      state.selectedCartItemIndex = action.payload;
    },
    clearPOSState() {
      return initialState;
    },
  },
});

export const {
  addPOSItem,
  removePOSItem,
  updatePOSQuantity,
  updateItemDiscount,
  setBillDiscount,
  clearBillDiscount,
  setCoupon,
  clearCoupon,
  setCustomerInfo,
  setSelectedCartItemIndex,
  clearPOSState,
} = posSlice.actions;

export const posReducer = posSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────

import type { RootState } from '@/store';

export const selectPOSItems = (state: RootState) => state.pos.items;
export const selectPOSItemCount = (state: RootState) =>
  state.pos.items.reduce((n, i) => n + i.quantity, 0);

export const selectPOSSubtotal = (state: RootState) =>
  state.pos.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

export const selectPOSTotalItemDiscount = (state: RootState) =>
  state.pos.items.reduce((sum, i) => {
    if (i.discountType === 'percentage') {
      return sum + Math.round((i.unitPrice * i.quantity * i.discount) / 100);
    }
    return sum + i.discount * i.quantity;
  }, 0);

export const selectPOSTotalGST = (state: RootState) =>
  state.pos.items.reduce((sum, i) => {
    const lineBeforeDiscount = i.unitPrice * i.quantity;
    const itemDiscount =
      i.discountType === 'percentage'
        ? Math.round((lineBeforeDiscount * i.discount) / 100)
        : i.discount * i.quantity;
    const taxable = lineBeforeDiscount - itemDiscount;
    return sum + Math.round(taxable * (i.gstPercent / 100));
  }, 0);

export const selectPOSBillDiscount = (state: RootState) => {
  const { billDiscount, billDiscountType } = state.pos;
  if (billDiscountType === 'percentage') {
    const subtotal = selectPOSSubtotal(state);
    const itemDiscount = selectPOSTotalItemDiscount(state);
    return Math.round(((subtotal - itemDiscount) * billDiscount) / 100);
  }
  return billDiscount;
};

export const selectPOSCouponDiscount = (state: RootState) => state.pos.couponDiscount;

export const selectPOSGrandTotal = (state: RootState) => {
  const subtotal = selectPOSSubtotal(state);
  const itemDiscount = selectPOSTotalItemDiscount(state);
  const billDiscount = selectPOSBillDiscount(state);
  const couponDiscount = selectPOSCouponDiscount(state);
  const gst = selectPOSTotalGST(state);
  return subtotal - itemDiscount - billDiscount - couponDiscount + gst;
};
