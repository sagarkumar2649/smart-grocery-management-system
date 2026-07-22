import { useUpdatePOStatus } from "../hooks/use-suppliers";
import { POStatusBadge } from "./POStatusBadge";
import { PaymentFormModal } from "./PaymentFormModal";
import type { PurchaseOrder, POStatus } from "../api/suppliers-api";
import { formatINRCompact } from "@/shared/lib/format-currency";
import { useState } from "react";

interface Props {
  order: PurchaseOrder;
  onClose: () => void;
}

const STATUS_FLOW: Record<POStatus, POStatus[]> = {
  draft: ["pending", "cancelled"],
  pending: ["confirmed", "cancelled"],
  confirmed: ["received", "cancelled"],
  received: [],
  cancelled: [],
};

export function PurchaseOrderDetailModal({ order, onClose }: Props) {
  const { mutate: mutateStatus, isPending } = useUpdatePOStatus();
  const [showPayment, setShowPayment] = useState(false);

  const nextStatuses = STATUS_FLOW[order.status] ?? [];
  const supplier = typeof order.supplier === "object" ? order.supplier : null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-surface shadow-2xl ring-1 ring-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{order.orderNumber}</h2>
            {supplier && <p className="text-sm text-muted-foreground">{supplier.companyName}</p>}
          </div>
          <div className="flex items-center gap-2">
            <POStatusBadge status={order.status} />
            <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Financials */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="mt-1 text-xl font-bold text-foreground">{formatINRCompact(order.totalAmount)}</p>
            </div>
            <div className="rounded-xl bg-primary/5 p-3 text-center ring-1 ring-primary/20">
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="mt-1 text-xl font-bold text-danger">{formatINRCompact(order.remainingBalance)}</p>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Paid {formatINRCompact(order.paidAmount)}</span>
              <span>{order.totalAmount > 0 ? Math.round((order.paidAmount / order.totalAmount) * 100) : 0}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{ width: `${order.totalAmount > 0 ? Math.min((order.paidAmount / order.totalAmount) * 100, 100) : 0}%` }}
              />
            </div>
          </div>

          {/* Items */}
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Items</h4>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{item.quantity} x {formatINRCompact(item.unitCost)}</p>
                  </div>
                  <p className="text-sm font-medium text-foreground">{formatINRCompact(item.total)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Summary */}
          <div className="rounded-xl bg-muted/50 p-4 space-y-1.5">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{formatINRCompact(order.subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST</span><span className="font-medium">{formatINRCompact(order.gstAmount)}</span></div>
            <div className="border-t border-border pt-1.5 flex justify-between"><span className="text-sm font-semibold">Total</span><span className="font-bold text-primary">{formatINRCompact(order.totalAmount)}</span></div>
          </div>

          {/* Info */}
          <section className="space-y-2">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Order Date</span><p className="font-medium">{new Date(order.orderDate).toLocaleDateString("en-IN")}</p></div>
              {order.expectedDeliveryDate && <div><span className="text-muted-foreground">Expected</span><p className="font-medium">{new Date(order.expectedDeliveryDate).toLocaleDateString("en-IN")}</p></div>}
              {order.invoiceNumber && <div><span className="text-muted-foreground">Invoice #</span><p className="font-medium">{order.invoiceNumber}</p></div>}
            </div>
            {order.notes && <div className="rounded-lg bg-warning/5 border border-warning/20 p-3"><p className="text-sm whitespace-pre-wrap">{order.notes}</p></div>}
          </section>

          {/* Payment History */}
          {order.payments.length > 0 && (
            <section className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Payment History</h4>
              <div className="space-y-2">
                {order.payments.map((p, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{formatINRCompact(p.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.method.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())} &middot; {new Date(p.date).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    {p.reference && <p className="text-xs text-muted-foreground">{p.reference}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
          {order.status !== "received" && order.status !== "cancelled" && order.remainingBalance > 0 && (
            <button type="button" onClick={() => setShowPayment(true)} className="inline-flex h-9 items-center rounded-lg bg-success px-4 text-sm font-medium text-white transition-colors hover:bg-success/90">
              Record Payment
            </button>
          )}
          {nextStatuses.map((s) => (
            <button
              key={s}
              type="button"
              disabled={isPending}
              onClick={() => mutateStatus({ id: order._id, status: s }, { onSuccess: onClose })}
              className={`inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                s === "received" ? "bg-success hover:bg-success/90" :
                s === "cancelled" ? "bg-danger hover:bg-danger/90" :
                "bg-primary hover:bg-primary/90"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </aside>

      {showPayment && <PaymentFormModal order={order} onClose={() => setShowPayment(false)} />}
    </>
  );
}
