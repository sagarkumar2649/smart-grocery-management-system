import { useState } from 'react';
import { formatINR } from '@/shared/lib/format-currency';

interface CardPaymentProps {
  remaining: number;
  onPay: (payment: { method: 'card'; amount: number; cardType?: string; cardLast4?: string }) => void;
}

const CARD_TYPES = ['Visa', 'Mastercard', 'RuPay', 'Amex'];

export function CardPayment({ remaining, onPay }: CardPaymentProps) {
  const [amount, setAmount] = useState(String(remaining > 0 ? remaining : ''));
  const [cardType, setCardType] = useState('');
  const [last4, setLast4] = useState('');

  const amountNum = parseFloat(amount) || 0;

  const handlePay = () => {
    if (amountNum > 0) {
      const payment: { method: 'card'; amount: number; cardType?: string; cardLast4?: string } = {
        method: 'card',
        amount: amountNum,
      };
      if (cardType) payment.cardType = cardType;
      if (last4) payment.cardLast4 = last4;
      onPay(payment);
      setAmount('');
      setCardType('');
      setLast4('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-blue-50 p-4 text-center">
        <p className="text-xs text-blue-600">Collect card payment from customer</p>
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
        <p className="mb-1 text-xs font-medium text-gray-500">Card Type</p>
        <div className="grid grid-cols-4 gap-1.5">
          {CARD_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setCardType(type)}
              className={`rounded-lg border py-2 text-xs font-medium transition ${
                cardType === type
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-gray-500">Last 4 Digits (optional)</p>
        <input
          type="text"
          value={last4}
          onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="XXXX"
          maxLength={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium tracking-[0.3em] text-foreground focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      <button
        onClick={handlePay}
        disabled={amountNum <= 0}
        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        Mark Card Paid - {amountNum > 0 ? formatINR(amountNum) : '₹0'}
      </button>
    </div>
  );
}
