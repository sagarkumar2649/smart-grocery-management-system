import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCoupon, clearCoupon, selectPOSCouponDiscount, selectPOSSubtotal, selectPOSTotalItemDiscount } from '@/store/slices/pos.slice';
import { useValidateCoupon } from '../hooks/use-pos';

export function CouponInput() {
  const dispatch = useAppDispatch();
  const couponDiscount = useAppSelector(selectPOSCouponDiscount);
  const subtotal = useAppSelector(selectPOSSubtotal);
  const itemDiscount = useAppSelector(selectPOSTotalItemDiscount);
  const [code, setCode] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const validateCoupon = useValidateCoupon();

  const handleApply = () => {
    if (!code.trim()) return;
    setError('');
    const afterItemDiscount = subtotal - itemDiscount;
    validateCoupon.mutate(
      { code: code.trim(), subtotal: afterItemDiscount },
      {
        onSuccess: (res) => {
          dispatch(setCoupon({ code: res.data.code, discount: res.data.calculatedDiscount }));
          setIsOpen(false);
        },
        onError: (err: Error) => {
          setError(err.message || 'Invalid coupon');
        },
      },
    );
  };

  const handleClear = () => {
    dispatch(clearCoupon());
    setCode('');
    setError('');
  };

  return (
    <div>
      {couponDiscount > 0 ? (
        <button
          onClick={handleClear}
          className="flex w-full items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs"
        >
          <span className="font-medium text-green-700">Coupon Applied</span>
          <span className="font-bold text-green-600">-{couponDiscount > 0 ? `₹${couponDiscount.toFixed(2)}` : ''}</span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-left text-xs font-medium text-gray-600 transition hover:bg-gray-100"
        >
          + Apply Coupon (Alt+C)
        </button>
      )}

      {isOpen && (
        <div className="mt-1.5 rounded-lg border border-gray-200 bg-surface p-2 shadow-sm">
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs uppercase"
            />
            <button
              onClick={handleApply}
              disabled={validateCoupon.isPending}
              className="rounded bg-teal-600 px-3 py-1 text-xs font-medium text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {validateCoupon.isPending ? '...' : 'Apply'}
            </button>
          </div>
          {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
}
