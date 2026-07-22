import { useState } from "react";
import { useAddPayment } from "../hooks/use-suppliers";
import type { PurchaseOrder } from "../api/suppliers-api";
import { PAYMENT_METHODS, type PaymentMethod } from "../api/suppliers-api";
import { formatINRCompact } from "@/shared/lib/format-currency";

interface Props {
  order: PurchaseOrder;
  onClose: () => void;
}

export function PaymentFormModal({ order, onClose }: Props) {
  const { mutate, isPending } = useAddPayment();

  const [amount, setAmount] = useState(String(order.remainingBalance));
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;

    mutate(
      {
        orderId: order._id,
        data: {
          amount: amt,
          ...(date ? { date } : {}),
          method,
          ...(reference.trim() ? { reference: reference.trim() } : {}),
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        },
      },
      { onSuccess: onClose },
    );
  };

  const inputCls = "block h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl ring-1 ring-border" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-foreground">Record Payment</h2>
          <p className="text-sm text-muted-foreground">Order {order.orderNumber}</p>
        </div>

        {/* Balance Info */}
        <div className="mb-5 rounded-xl bg-muted/50 p-4 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Amount</span>
            <span className="font-medium text-foreground">{formatINRCompact(order.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Already Paid</span>
            <span className="font-medium text-success">{formatINRCompact(order.paidAmount)}</span>
          </div>
          <div className="border-t border-border pt-1.5 flex justify-between">
            <span className="text-sm font-semibold text-foreground">Remaining</span>
            <span className="text-lg font-bold text-danger">{formatINRCompact(order.remainingBalance)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Amount (₹) *</label>
            <input type="number" min="0.01" step="0.01" max={order.remainingBalance} value={amount} onChange={(e) => setAmount(e.target.value)} required className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Method *</label>
              <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className={`${inputCls} cursor-pointer`}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Reference</label>
            <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Transaction ID, cheque number..." className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Notes</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" className={inputCls} />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={isPending} className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="inline-flex h-9 items-center rounded-lg bg-success px-4 text-sm font-medium text-white transition-colors hover:bg-success/90 disabled:opacity-50">
              {isPending ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
