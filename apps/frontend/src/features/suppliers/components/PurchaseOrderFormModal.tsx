import { useState } from "react";
import { useProducts } from "@/features/products/hooks/use-products";
import { useCreatePurchaseOrder } from "../hooks/use-suppliers";
import type { Supplier } from "../api/suppliers-api";
import { formatINRCompact } from "@/shared/lib/format-currency";

interface Props {
  supplier: Supplier;
  onClose: () => void;
}

interface LineItem {
  product: string;
  productName: string;
  quantity: number;
  unitCost: number;
}

export function PurchaseOrderFormModal({ supplier, onClose }: Props) {
  const { mutate, isPending } = useCreatePurchaseOrder();
  const { data: productsRes } = useProducts({ limit: 200 });
  const products = productsRes?.data ?? [];

  const [items, setItems] = useState<LineItem[]>([
    { product: "", productName: "", quantity: 1, unitCost: 0 },
  ]);
  const [gstAmount, setGstAmount] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      const current = next[index];
      if (!current) return prev;
      if (field === "product" && typeof value === "string") {
        const prod = products.find((p) => p._id === value);
        next[index] = {
          product: value,
          productName: prod?.name ?? "",
          quantity: current.quantity,
          unitCost: prod?.purchasePrice ?? 0,
        };
      } else {
        const updated = { ...current };
        if (field === "quantity") updated.quantity = value as number;
        if (field === "unitCost") updated.unitCost = value as number;
        if (field === "productName") updated.productName = value as string;
        next[index] = updated;
      }
      return next;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { product: "", productName: "", quantity: 1, unitCost: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.unitCost * item.quantity, 0);
  const gst = parseFloat(gstAmount) || 0;
  const total = subtotal + gst;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter((item) => item.product && item.quantity > 0);
    if (validItems.length === 0) return;

    mutate(
      {
        supplier: supplier._id,
        items: validItems.map((item) => ({
          product: item.product,
          productName: item.productName,
          quantity: item.quantity,
          unitCost: item.unitCost,
        })),
        ...(gst ? { gstAmount: gst } : {}),
        ...(expectedDelivery ? { expectedDeliveryDate: expectedDelivery } : {}),
        ...(invoiceNumber.trim() ? { invoiceNumber: invoiceNumber.trim() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      },
      { onSuccess: onClose },
    );
  };

  const inputCls = "block h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all";
  const selectCls = `${inputCls} cursor-pointer`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl ring-1 ring-border" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Create Purchase Order</h2>
            <p className="text-sm text-muted-foreground">From {supplier.companyName}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Items */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Items</h4>
            {items.map((item, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1">
                  {i === 0 && <label className="block text-xs font-medium text-muted-foreground mb-1">Product</label>}
                  <select value={item.product} onChange={(e) => updateItem(i, "product", e.target.value)} required className={selectCls}>
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>
                <div className="w-20">
                  {i === 0 && <label className="block text-xs font-medium text-muted-foreground mb-1">Qty</label>}
                  <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value, 10) || 1)} required className={inputCls} />
                </div>
                <div className="w-28">
                  {i === 0 && <label className="block text-xs font-medium text-muted-foreground mb-1">Unit Cost (₹)</label>}
                  <input type="number" min="0" step="0.01" value={item.unitCost} onChange={(e) => updateItem(i, "unitCost", parseFloat(e.target.value) || 0)} required className={inputCls} />
                </div>
                <div className="w-28 text-right">
                  {i === 0 && <label className="block text-xs font-medium text-muted-foreground mb-1">Total</label>}
                  <p className="h-10 flex items-center justify-end text-sm font-medium text-foreground pr-1">{formatINRCompact(item.unitCost * item.quantity)}</p>
                </div>
                <button type="button" onClick={() => removeItem(i)} disabled={items.length <= 1} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:opacity-30 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            ))}
            <button type="button" onClick={addItem} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Add Item
            </button>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">GST Amount (₹)</label>
              <input type="number" min="0" step="0.01" value={gstAmount} onChange={(e) => setGstAmount(e.target.value)} placeholder="0.00" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Expected Delivery</label>
              <input type="date" value={expectedDelivery} onChange={(e) => setExpectedDelivery(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Invoice Number</label>
              <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="Optional" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={1000} placeholder="Order notes..." className={`${inputCls} resize-none h-auto py-2`} />
          </div>

          {/* Summary */}
          <div className="rounded-xl bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">{formatINRCompact(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST</span>
              <span className="font-medium text-foreground">{formatINRCompact(gst)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="text-sm font-semibold text-foreground">Total</span>
              <span className="text-lg font-bold text-primary">{formatINRCompact(total)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isPending} className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
              {isPending ? "Creating..." : "Create Purchase Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
