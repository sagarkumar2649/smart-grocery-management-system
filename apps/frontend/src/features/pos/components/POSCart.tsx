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
}

export function POSCart({ onPay }: POSCartProps) {
  const items = useAppSelector(selectPOSItems);
  const itemCount = useAppSelector(selectPOSItemCount);
  const subtotal = useAppSelector(selectPOSSubtotal);
  const itemDiscount = useAppSelector(selectPOSTotalItemDiscount);
  const gst = useAppSelector(selectPOSTotalGST);
  const billDiscount = useAppSelector(selectPOSBillDiscount);
  const couponDiscount = useAppSelector(selectPOSCouponDiscount);
  const grandTotal = useAppSelector(selectPOSGrandTotal);

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
          <button className="text-xs text-red-500 hover:text-red-700" title="Clear all items">
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
    </div>
  );
}
