import { configureStore } from '@reduxjs/toolkit';
import { appUiReducer } from '@/store/slices/app-ui.slice';
import { cartReducer } from '@/store/slices/cart.slice';
import { inventoryReducer } from '@/store/slices/inventory.slice';

export const store = configureStore({
  reducer: {
    appUi: appUiReducer,
    cart: cartReducer,
    inventory: inventoryReducer,
  },
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
