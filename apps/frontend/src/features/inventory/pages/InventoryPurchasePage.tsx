import { useState } from "react";
import { usePurchaseStock } from "../hooks/use-inventory";
import { useProducts } from "@/features/products/hooks/use-products";
import { formatINRCompact } from "@/shared/lib/format-currency";

// ── Icons ─────────────────────────────────────────────────────────────────────
const ShoppingCart = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);
const CheckCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const AlertCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

// ── Page ──────────────────────────────────────────────────────────────────────

export function InventoryPurchasePage() {
  const { data: productsRes, isLoading: productsLoading } = useProducts({ limit: 200 });
  const products = productsRes?.data ?? [];
  const purchaseStock = usePurchaseStock();

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const selectedProductData = products.find((p) => p._id === selectedProduct);
  const totalCost = (parseFloat(quantity) || 0) * (parseFloat(unitCost) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!selectedProduct || !quantity || !unitCost) {
      setError("Please fill in all required fields.");
      return;
    }

    const qty = parseInt(quantity, 10);
    const cost = parseFloat(unitCost);
    if (qty <= 0 || cost < 0) {
      setError("Quantity must be positive and cost must be ≥ 0.");
      return;
    }

    try {
      await purchaseStock.mutateAsync({
        productId: selectedProduct,
        quantity: qty,
        unitCost: cost,
        ...(batchNumber ? { batchNumber } : {}),
        ...(expiryDate ? { expiryDate } : {}),
        ...(reference ? { reference } : {}),
        ...(notes ? { notes } : {}),
      });
      setSuccess(true);
      setSelectedProduct("");
      setQuantity("");
      setUnitCost("");
      setBatchNumber("");
      setExpiryDate("");
      setReference("");
      setNotes("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record purchase");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Purchase Stock</h1>
        <p className="mt-1 text-sm text-muted-foreground">Record new stock purchases and update inventory</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="rounded-xl bg-surface shadow-sm ring-1 ring-border p-6 space-y-6">
            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
                <CheckCircle className="h-4 w-4" />
                Purchase recorded successfully! Stock has been updated.
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Product *</label>
              {productsLoading ? (
                <div className="h-10 animate-pulse rounded-lg bg-muted" />
              ) : (
                <select
                  value={selectedProduct}
                  onChange={(e) => {
                    setSelectedProduct(e.target.value);
                    const p = products.find((p) => p._id === e.target.value);
                    if (p) setUnitCost(String(p.purchasePrice));
                  }}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.sku}) — Current: {p.stock} {p.unit}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Enter quantity"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Unit Cost (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Cost per unit"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Batch Number</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Optional batch/lot number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Purchase Reference</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g., PO-001, Invoice #12345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                placeholder="Additional notes about this purchase"
              />
            </div>

            <button
              type="submit"
              disabled={purchaseStock.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {purchaseStock.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
              {purchaseStock.isPending ? "Processing..." : "Record Purchase"}
            </button>
          </form>
        </div>

        {/* Summary Panel */}
        <div className="space-y-4">
          {selectedProductData && (
            <div className="rounded-xl bg-surface shadow-sm ring-1 ring-border p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Purchase Summary</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                  {selectedProductData.imageUrl ? (
                    <img src={selectedProductData.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{selectedProductData.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedProductData.sku}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Stock</span>
                  <span className="text-foreground">{selectedProductData.stock} {selectedProductData.unit}</span>
                </div>
                {quantity && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Adding</span>
                      <span className="text-success font-medium">+{parseInt(quantity, 10) || 0}</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-foreground">New Stock</span>
                      <span className="text-primary">{selectedProductData.stock + (parseInt(quantity, 10) || 0)} {selectedProductData.unit}</span>
                    </div>
                  </>
                )}
                {totalCost > 0 && (
                  <>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-foreground">Total Cost</span>
                      <span className="text-primary">{formatINRCompact(totalCost)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="rounded-xl bg-background ring-1 ring-border p-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Purchase Tips</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <span>Unit cost is auto-filled from the product's purchase price</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <span>Batch numbers help track specific purchase lots</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <span>Expiry dates are useful for perishable items</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <span>All purchases are logged in stock movement history</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
