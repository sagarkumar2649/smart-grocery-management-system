import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectPOSItems,
  selectPOSBillDiscount,
  clearPOSState,
} from '@/store/slices/pos.slice';
import { useCheckout } from '../hooks/use-pos';
import { formatINR } from '@/shared/lib/format-currency';
import { CashPayment } from './CashPayment';
import { UPIPayment } from './UPIPayment';
import { CardPayment } from './CardPayment';
import { SplitPayment } from './SplitPayment';
import type { POSInvoicePayment } from '../api/pos-api';

interface PaymentModalProps {
  grandTotal: number;
  onClose: () => void;
  onComplete: (invoiceId: string) => void;
}

export function PaymentModal({ grandTotal, onClose, onComplete }: PaymentModalProps) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectPOSItems);
  const billDiscount = useAppSelector(selectPOSBillDiscount);
  const couponCode = useAppSelector((state) => state.pos.couponCode);
  const customerInfo = useAppSelector((state) => state.pos.customerInfo);

  const [activeTab, setActiveTab] = useState<'cash' | 'upi' | 'card' | 'split'>('cash');
  const [payments, setPayments] = useState<POSInvoicePayment[]>([]);
  const [error, setError] = useState('');

  const checkout = useCheckout();

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = grandTotal - totalPaid;

  const handlePay = (payment: POSInvoicePayment) => {
    setPayments((prev) => [...prev, payment]);
  };

  const handleRemovePayment = (index: number) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (Math.abs(totalPaid - grandTotal) > 0.01) {
      setError('Payment amount must match grand total');
      return;
    }

    setError('');
    checkout.mutate(
      {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          ...(item.discount > 0 && { discount: item.discount, discountType: item.discountType }),
        })),
        payments,
        ...(billDiscount > 0 && { discount: billDiscount, discountType: 'flat' as const }),
        ...(couponCode != null && { couponCode }),
        ...(customerInfo.name && { customerName: customerInfo.name }),
        ...(customerInfo.phone && { customerPhone: customerInfo.phone }),
        ...(customerInfo.email && { customerEmail: customerInfo.email }),
      },
      {
        onSuccess: (res) => {
          dispatch(clearPOSState());
          onComplete(res.data._id);
        },
        onError: (err: Error) => {
          setError(err.message || 'Checkout failed');
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Payment</h2>
            <p className="text-xs text-gray-500">{items.length} items</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Grand Total Display */}
        <div className="bg-teal-700 px-6 py-5 text-center text-white">
          <p className="text-xs uppercase tracking-wider text-teal-200">Amount to Pay</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">{formatINR(grandTotal)}</p>
          {totalPaid > 0 && (
            <p className="mt-1 text-xs text-teal-200">
              Paid: {formatINR(totalPaid)} | Remaining: {formatINR(Math.max(0, remaining))}
            </p>
          )}
        </div>

        {/* Payment Tabs */}
        <div className="flex border-b border-gray-200">
          {(['cash', 'upi', 'card', 'split'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setError(''); }}
              className={`flex-1 py-3 text-sm font-medium transition ${
                activeTab === tab
                  ? 'border-b-2 border-teal-600 text-teal-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Payment Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'cash' && (
            <CashPayment
              remaining={remaining}
              onPay={handlePay}
            />
          )}
          {activeTab === 'upi' && (
            <UPIPayment remaining={remaining} onPay={handlePay} />
          )}
          {activeTab === 'card' && (
            <CardPayment remaining={remaining} onPay={handlePay} />
          )}
          {activeTab === 'split' && (
            <SplitPayment
              grandTotal={grandTotal}
              payments={payments}
              onAddPayment={handlePay}
              onRemovePayment={handleRemovePayment}
            />
          )}

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 p-2 text-center text-xs text-red-600">{error}</p>
          )}

          {/* Existing Payments */}
          {payments.length > 0 && (
            <div className="mt-4 space-y-1.5">
              <p className="text-xs font-medium text-gray-500">Payments Added:</p>
              {payments.map((p, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs">
                  <span className="font-medium capitalize text-gray-700">{p.method}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{formatINR(p.amount)}</span>
                    <button
                      onClick={() => handleRemovePayment(i)}
                      className="text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={handleSubmit}
            disabled={Math.abs(totalPaid - grandTotal) > 0.01 || checkout.isPending}
            className="w-full rounded-lg bg-teal-700 py-3 text-base font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checkout.isPending ? 'Processing...' : `Confirm Payment - ${formatINR(grandTotal)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
