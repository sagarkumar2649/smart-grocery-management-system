import { useState } from 'react';
import { formatINR } from '@/shared/lib/format-currency';

interface UPIPaymentProps {
  remaining: number;
  onPay: (payment: { method: 'upi'; amount: number; upiTransactionId?: string }) => void;
}

export function UPIPayment({ remaining, onPay }: UPIPaymentProps) {
  const [amount, setAmount] = useState(String(remaining > 0 ? remaining : ''));
  const [txnId, setTxnId] = useState('');

  const amountNum = parseFloat(amount) || 0;

  const handlePay = () => {
    if (amountNum > 0) {
      const payment: { method: 'upi'; amount: number; upiTransactionId?: string } = {
        method: 'upi',
        amount: amountNum,
      };
      if (txnId) payment.upiTransactionId = txnId;
      onPay(payment);
      setAmount('');
      setTxnId('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-purple-50 p-4 text-center">
        <p className="text-xs text-purple-600">Customer should pay via UPI</p>
        <p className="mt-1 text-xs text-gray-500">Collect UPI reference ID after payment</p>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-gray-500">Amount</p>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-center text-lg font-bold text-foreground focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          min="0"
        />
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-gray-500">UPI Transaction ID (optional)</p>
        <input
          type="text"
          value={txnId}
          onChange={(e) => setTxnId(e.target.value)}
          placeholder="e.g. 123456789012"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-foreground focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      <button
        onClick={handlePay}
        disabled={amountNum <= 0}
        className="w-full rounded-lg bg-purple-600 py-2.5 text-sm font-bold text-white transition hover:bg-purple-700 disabled:opacity-50"
      >
        Mark UPI Paid - {amountNum > 0 ? formatINR(amountNum) : '₹0'}
      </button>
    </div>
  );
}
