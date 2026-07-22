import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setBillDiscount, clearBillDiscount, selectPOSBillDiscount } from '@/store/slices/pos.slice';

export function DiscountPanel() {
  const dispatch = useAppDispatch();
  const currentDiscount = useAppSelector(selectPOSBillDiscount);
  const [isOpen, setIsOpen] = useState(false);
  const [discountValue, setDiscountValue] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('flat');

  const handleApply = () => {
    const val = parseFloat(discountValue);
    if (!isNaN(val) && val >= 0) {
      dispatch(setBillDiscount({ discount: val, discountType }));
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    dispatch(clearBillDiscount());
    setDiscountValue('');
    setIsOpen(false);
  };

  return (
    <div>
      {currentDiscount > 0 ? (
        <button
          onClick={handleClear}
          className="flex w-full items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs"
        >
          <span className="font-medium text-green-700">Discount Applied</span>
          <span className="font-bold text-green-600">-{currentDiscount > 0 ? `₹${currentDiscount.toFixed(2)}` : ''}</span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-left text-xs font-medium text-gray-600 transition hover:bg-gray-100"
        >
          + Add Discount (Alt+D)
        </button>
      )}

      {isOpen && (
        <div className="mt-1.5 rounded-lg border border-gray-200 bg-surface p-2 shadow-sm">
          <div className="flex gap-1.5">
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'flat')}
              className="rounded border border-gray-300 px-2 py-1 text-xs"
            >
              <option value="flat">₹ Flat</option>
              <option value="percentage">% Percent</option>
            </select>
            <input
              type="number"
              placeholder="0"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
              min="0"
            />
            <button
              onClick={handleApply}
              className="rounded bg-teal-600 px-3 py-1 text-xs font-medium text-white hover:bg-teal-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
