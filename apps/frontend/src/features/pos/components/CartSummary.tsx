import { formatINR } from '@/shared/lib/format-currency';

interface CartSummaryProps {
  subtotal: number;
  itemDiscount: number;
  billDiscount: number;
  couponDiscount: number;
  gst: number;
  grandTotal: number;
}

export function CartSummary({
  subtotal,
  itemDiscount,
  billDiscount,
  couponDiscount,
  gst,
  grandTotal,
}: CartSummaryProps) {
  const totalDiscount = itemDiscount + billDiscount + couponDiscount;

  return (
    <div className="px-4 py-3 space-y-1.5">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Subtotal</span>
        <span>{formatINR(subtotal)}</span>
      </div>

      {itemDiscount > 0 && (
        <div className="flex justify-between text-xs text-red-500">
          <span>Item Discount</span>
          <span>-{formatINR(itemDiscount)}</span>
        </div>
      )}

      {billDiscount > 0 && (
        <div className="flex justify-between text-xs text-red-500">
          <span>Bill Discount</span>
          <span>-{formatINR(billDiscount)}</span>
        </div>
      )}

      {couponDiscount > 0 && (
        <div className="flex justify-between text-xs text-red-500">
          <span>Coupon</span>
          <span>-{formatINR(couponDiscount)}</span>
        </div>
      )}

      {gst > 0 && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>GST</span>
          <span>{formatINR(gst)}</span>
        </div>
      )}

      {totalDiscount > 0 && (
        <div className="flex justify-between border-t border-dashed border-gray-200 pt-1.5 text-xs text-success">
          <span>Total Savings</span>
          <span>-{formatINR(totalDiscount)}</span>
        </div>
      )}

      <div className="flex items-baseline justify-between border-t border-gray-300 pt-2">
        <span className="text-sm font-bold text-foreground">Grand Total</span>
        <span className="text-lg font-bold text-teal-700">{formatINR(grandTotal)}</span>
      </div>
    </div>
  );
}
