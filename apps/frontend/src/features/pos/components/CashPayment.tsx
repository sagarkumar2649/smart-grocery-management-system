import { useState } from 'react';
import { formatINR } from '@/shared/lib/format-currency';

interface CashPaymentProps {
  remaining: number;
  onPay: (payment: { method: 'cash'; amount: number }) => void;
}

const QUICK_AMOUNTS = [10, 20, 50, 100, 200, 500, 1000, 2000];

export function CashPayment({ remaining, onPay }: CashPaymentProps) {
  const [tendered, setTendered] = useState('');

  const tenderedNum = parseFloat(tendered) || 0;
  const change = tenderedNum - remaining;

  const handleExact = () => {
    if (remaining > 0) {
      onPay({ method: 'cash', amount: remaining });
      setTendered('');
    }
  };

  const handlePay = () => {
    if (tenderedNum > 0 && tenderedNum >= remaining) {
      onPay({ method: 'cash', amount: remaining });
      setTendered('');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium text-gray-500">Quick Amounts</p>
        <div className="grid grid-cols-4 gap-1.5">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => setTendered(String(amt))}
              className="rounded-lg border border-gray-200 bg-gray-50 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
            >
              {formatINR(amt)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-gray-500">Amount Tendered</p>
        <input
          type="number"
          value={tendered}
          onChange={(e) => setTendered(e.target.value)}
          placeholder="0.00"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-center text-lg font-bold text-foreground focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          min="0"
        />
      </div>

      {change > 0 && (
        <div className="rounded-lg bg-green-50 p-3 text-center">
          <p className="text-xs text-green-600">Change</p>
          <p className="text-xl font-bold text-green-700">{formatINR(change)}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleExact}
          className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Exact Amount
        </button>
        <button
          onClick={handlePay}
          disabled={tenderedNum < remaining || remaining <= 0}
          className="flex-1 rounded-lg bg-teal-600 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700 disabled:opacity-50"
        >
          Pay Cash
        </button>
      </div>
    </div>
  );
}
