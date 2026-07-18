import { useState } from "react";
import { useAdjustStock } from "../hooks/use-inventory";
import { useProducts } from "@/features/products/hooks/use-products";
import type { MovementType } from "../api/inventory-api";

// ── Icons ─────────────────────────────────────────────────────────────────────
const ArrowUpDown = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21 16-4 4-4-4" /><path d="M17 20V4" /><path d="m3 8 4-4 4 4" /><path d="M7 4v16" />
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

const ADJUSTMENT_TYPES: Array<{ value: MovementType; label: string; description: string; color: string }> = [
  { value: "adjustment", label: "Manual Adjustment", description: "Correct stock count", color: "border-gray-300 bg-gray-50 text-gray-700" },
  { value: "return", label: "Customer Return", description: "Returned from customer", color: "border-warning/30 bg-warning/5 text-warning" },
  { value: "damaged", label: "Mark as Damaged", description: "Damaged items", color: "border-danger/30 bg-danger/5 text-danger" },
  { value: "expired", label: "Mark as Expired", description: "Expired products", color: "border-danger/30 bg-danger/5 text-danger" },
  { value: "transfer", label: "Transfer", description: "Move between locations", color: "border-primary/30 bg-primary/5 text-primary" },
  { value: "opening", label: "Opening Stock", description: "Initial stock entry", color: "border-success/30 bg-success/5 text-success" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export function InventoryAdjustmentPage() {
  const { data: productsRes, isLoading: productsLoading } = useProducts({ limit: 200 });
  const products = productsRes?.data ?? [];

  const adjustStock = useAdjustStock();

  const [selectedProduct, setSelectedProduct] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<MovementType>("adjustment");
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const selectedProductData = products.find((p) => p._id === selectedProduct);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!selectedProduct || !quantity) {
      setError("Please select a product and enter a quantity.");
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty === 0) {
      setError("Quantity must be a non-zero number.");
      return;
    }

    if (adjustmentType === "damaged" || adjustmentType === "expired" || adjustmentType === "sale") {
      if (Math.abs(qty) > (selectedProductData?.stock ?? 0)) {
        setError(`Cannot process ${Math.abs(qty)} items. Only ${selectedProductData?.stock} in stock.`);
        return;
      }
    }

    try {
      await adjustStock.mutateAsync({
        productId: selectedProduct,
        type: adjustmentType,
        quantity: qty,
        ...(reference ? { reference } : {}),
        ...(batchNumber ? { batchNumber } : {}),
        ...(expiryDate ? { expiryDate } : {}),
        ...(notes ? { notes } : {}),
        ...(unitCost ? { unitCost: parseFloat(unitCost) } : {}),
      });
      setSuccess(true);
      setSelectedProduct("");
      setQuantity("");
      setReference("");
      setBatchNumber("");
      setExpiryDate("");
      setNotes("");
      setUnitCost("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to adjust stock");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Stock Adjustment</h1>
        <p className="mt-1 text-sm text-muted-foreground">Modify stock levels with tracking and audit trail</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="rounded-xl bg-surface shadow-sm ring-1 ring-border p-6 space-y-6">
            {/* Success/Error Messages */}
            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
                <CheckCircle className="h-4 w-4" />
                Stock adjusted successfully!
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* Adjustment Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Adjustment Type</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ADJUSTMENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setAdjustmentType(type.value)}
                    className={`rounded-lg border-2 p-3 text-left text-sm transition-all ${
                      adjustmentType === type.value
                        ? `${type.color} ring-2 ring-primary/20`
                        : "border-border bg-background text-muted-foreground hover:border-muted-foreground/30"
                    }`}
                  >
                    <p className="font-medium">{type.label}</p>
                    <p className="mt-0.5 text-xs opacity-70">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Product</label>
              {productsLoading ? (
                <div className="h-10 animate-pulse rounded-lg bg-muted" />
              ) : (
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.sku}) — Stock: {p.stock} {p.unit}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Quantity */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder={adjustmentType === "adjustment" ? "Use negative to decrease" : "Enter quantity"}
                  required
                />
                {adjustmentType === "adjustment" && (
                  <p className="mt-1 text-xs text-muted-foreground">Use negative values to decrease stock</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Unit Cost (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Reference & Batch */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Reference Number</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g., PO-001, INV-123"
                />
              </div>
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
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                placeholder="Additional notes about this adjustment"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={adjustStock.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adjustStock.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <ArrowUpDown className="h-4 w-4" />
              )}
              {adjustStock.isPending ? "Processing..." : "Apply Adjustment"}
            </button>
          </form>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          {selectedProductData && (
            <div className="rounded-xl bg-surface shadow-sm ring-1 ring-border p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Product Preview</h3>
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
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Stock</span>
                  <span className="font-medium text-foreground">{selectedProductData.stock} {selectedProductData.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Min Stock</span>
                  <span className="text-foreground">{selectedProductData.minimumStock}</span>
                </div>
                {quantity && (
                  <>
                    <div className="h-px bg-border my-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Adjustment</span>
                      <span className={`font-medium ${
                        (adjustmentType === "adjustment" ? parseInt(quantity, 10) : Math.abs(parseInt(quantity, 10))) > 0
                          ? (["return", "purchase", "opening"].includes(adjustmentType) ? "text-success" : "text-danger")
                          : "text-danger"
                      }`}>
                        {["return", "purchase", "opening"].includes(adjustmentType) ? "+" : ""}
                        {["return", "purchase", "opening"].includes(adjustmentType) ? Math.abs(parseInt(quantity, 10) || 0) : -(Math.abs(parseInt(quantity, 10) || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-foreground">New Stock</span>
                      <span className="text-primary">
                        {Math.max(0, selectedProductData.stock + (
                          ["return", "purchase", "opening"].includes(adjustmentType)
                            ? Math.abs(parseInt(quantity, 10) || 0)
                            : parseInt(quantity, 10) || 0
                        ))} {selectedProductData.unit}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Quick Guide */}
          <div className="rounded-xl bg-background ring-1 ring-border p-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Adjustment Guide</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-success" />
                <span><strong>Purchase/Return/Opening</strong> — increases stock</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-danger" />
                <span><strong>Damaged/Expired</strong> — decreases stock</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                <span><strong>Manual Adjustment</strong> — use negative to decrease</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <span>All changes are tracked with full audit trail</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
