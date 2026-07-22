import { useState } from 'react';
import { formatINR } from '@/shared/lib/format-currency';
import type { POSInvoicePayment } from '../api/pos-api';

interface SplitPaymentProps {
  grandTotal: number;
  payments: POSInvoicePayment[];
  onAddPayment: (payment: POSInvoicePayment) => void;
  onRemovePayment: (index: number) => void;
}

const METHODS = ['cash', 'upi', 'card'] as const;

export function SplitPayment({ grandTotal, payments, onAddPayment }: SplitPaymentProps) {
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = grandTotal - totalPaid;

  const [method, setMethod] = useState<'cash' | 'upi' | 'card'>('cash');
  const [amount, setAmount] = useState(String(remaining > 0 ? remaining : ''));
  const [reference, setReference] = useState('');

  const amountNum = parseFloat(amount) || 0;

  const handleAdd = () => {
    if (amountNum > 0 && amountNum <= remaining + 0.01) {
      const payment: POSInvoicePayment = {
        method,
        amount: amountNum,
      };
      if (reference) payment.reference = reference;
      onAddPayment(payment);
      setAmount('');
      setReference('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-amber-50 p-3 text-center">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Grand Total</span>
          <span className="font-bold text-foreground">{formatINR(grandTotal)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Already Paid</span>
          <span className="font-bold text-green-600">{formatINR(totalPaid)}</span>
        </div>
        <div className="mt-1 flex justify-between text-xs">
          <span className="font-medium text-foreground">Remaining</span>
          <span className="font-bold text-red-600">{formatINR(Math.max(0, remaining))}</span>
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-gray-500">Payment Method</p>
        <div className="grid grid-cols-3 gap-1.5">
          {METHODS.map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`rounded-lg border py-2 text-xs font-medium uppercase transition ${
                method === m
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-gray-500">Amount</p>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-center text-lg font-bold text-foreground focus:border-teal-500 focus:outline-none"
          min="0"
          max={remaining}
        />
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-gray-500">Reference (optional)</p>
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="e.g. UPI txn ID, card last 4"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-foreground focus:border-teal-500 focus:outline-none"
        />
      </div>

      <button
        onClick={handleAdd}
        disabled={amountNum <= 0 || amountNum > remaining + 0.01}
        className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700 disabled:opacity-50"
      >
        Add Payment - {amountNum > 0 ? formatINR(amountNum) : '₹0'}
      </button>
    </div>
  );
}
