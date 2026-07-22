import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCustomerInfo, type POSCustomerInfo } from '@/store/slices/pos.slice';

export function CustomerInfoPanel() {
  const dispatch = useAppDispatch();
  const customerInfo = useAppSelector((state) => state.pos.customerInfo);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<POSCustomerInfo>(customerInfo);

  const handleSave = () => {
    dispatch(setCustomerInfo(form));
    setIsOpen(false);
  };

  const hasInfo = customerInfo.name || customerInfo.phone || customerInfo.email;

  return (
    <div>
      {hasInfo ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs"
        >
          <span className="font-medium text-teal-700">
            {customerInfo.name || customerInfo.phone || 'Customer'}
          </span>
          <span className="text-teal-500">Edit</span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-left text-xs font-medium text-gray-600 transition hover:bg-gray-100"
        >
          + Customer Info (F7)
        </button>
      )}

      {isOpen && (
        <div className="mt-1.5 rounded-lg border border-gray-200 bg-surface p-2 shadow-sm space-y-1.5">
          <input
            type="text"
            placeholder="Customer name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
          />
          <input
            type="tel"
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
          />
          <input
            type="email"
            placeholder="Email (for invoice)"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
          />
          <button
            onClick={handleSave}
            className="w-full rounded bg-teal-600 py-1 text-xs font-medium text-white hover:bg-teal-700"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
