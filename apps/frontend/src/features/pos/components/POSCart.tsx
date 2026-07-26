import { useState, useCallback, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  selectPOSItems,
  selectPOSSubtotal,
  selectPOSTotalItemDiscount,
  selectPOSTotalGST,
  selectPOSBillDiscount,
  selectPOSCouponDiscount,
  selectPOSGrandTotal,
  selectPOSItemCount,
} from '@/store/slices/pos.slice';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { DiscountPanel } from './DiscountPanel';
import { CouponInput } from './CouponInput';
import { CustomerInfoPanel } from './CustomerInfoPanel';

interface POSCartProps {
  onPay: () => void;
  onClearAll: () => void;
}

export function POSCart({ onPay, onClearAll }: POSCartProps) {
  const items = useAppSelector(selectPOSItems);
  const itemCount = useAppSelector(selectPOSItemCount);
  const subtotal = useAppSelector(selectPOSSubtotal);
  const itemDiscount = useAppSelector(selectPOSTotalItemDiscount);
  const gst = useAppSelector(selectPOSTotalGST);
  const billDiscount = useAppSelector(selectPOSBillDiscount);
  const couponDiscount = useAppSelector(selectPOSCouponDiscount);
  const grandTotal = useAppSelector(selectPOSGrandTotal);

  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleClearAll = useCallback(() => {
    onClearAll();
    setShowConfirmClear(false);
    showToast('Cart cleared successfully.');
  }, [onClearAll, showToast]);

  return (
    <div className="flex h-full flex-col">
      {/* Cart Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2.5">
        <h2 className="text-sm font-bold text-foreground">
          Current Bill
          {itemCount > 0 && (
            <span className="ml-1.5 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700">
              {itemCount}
            </span>
          )}
        </h2>
        {items.length > 0 && (
          <button
            onClick={() => setShowConfirmClear(true)}
            className="text-xs text-red-500 hover:text-red-700"
            title="Clear all items"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="mb-2 h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <p className="text-xs font-medium">Cart is empty</p>
            <p className="mt-1 text-[10px]">Scan or click products to add</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Customer Info + Discount + Coupon */}
      {items.length > 0 && (
        <div className="border-t border-gray-200 px-4 py-2 space-y-2">
          <CustomerInfoPanel />
          <DiscountPanel />
          <CouponInput />
        </div>
      )}

      {/* Cart Summary + Pay Button */}
      {items.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50">
          <CartSummary
            subtotal={subtotal}
            itemDiscount={itemDiscount}
            billDiscount={billDiscount}
            couponDiscount={couponDiscount}
            gst={gst}
            grandTotal={grandTotal}
          />
          <div className="px-4 pb-3">
            <button
              onClick={onPay}
              className="w-full rounded-lg bg-teal-700 py-3 text-base font-bold text-white shadow-md transition hover:bg-teal-800 active:scale-[0.98]"
              title="Pay (F10)"
            >
              PAY {grandTotal > 0 ? `₹${grandTotal.toFixed(2)}` : ''}
            </button>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Dialog */}
      {showConfirmClear && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setShowConfirmClear(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl ring-1 ring-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" x2="12" y1="9" y2="13" />
                <line x1="12" x2="12.01" y1="17" y2="17" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground">Clear Cart</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to remove all items from the cart?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmClear(false)}
                className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex h-9 items-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {toastMessage && (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center">
          <div className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
