import { useState } from "react";
import { useReportDamaged, useStockMovements } from "../hooks/use-inventory";
import { useProducts } from "@/features/products/hooks/use-products";

// ── Icons ─────────────────────────────────────────────────────────────────────
const AlertTriangle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);
const CheckCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const PackageIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
  </svg>
);

// ── Page ──────────────────────────────────────────────────────────────────────

export function InventoryDamagedPage() {
  const { data: productsRes, isLoading: productsLoading } = useProducts({ limit: 200 });
  const products = productsRes?.data ?? [];
  const reportDamaged = useReportDamaged();
  const { data: damagedMovements, isLoading: movementsLoading } = useStockMovements({ type: "damaged", limit: "50" });

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const selectedProductData = products.find((p) => p._id === selectedProduct);
  const recentDamaged = damagedMovements?.data ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!selectedProduct || !quantity) {
      setError("Please select a product and enter a quantity.");
      return;
    }

    const qty = parseInt(quantity, 10);
    if (qty <= 0) {
      setError("Quantity must be positive.");
      return;
    }

    if (qty > (selectedProductData?.stock ?? 0)) {
      setError(`Cannot mark ${qty} as damaged. Only ${selectedProductData?.stock} in stock.`);
      return;
    }

    try {
      await reportDamaged.mutateAsync({
        productId: selectedProduct,
        quantity: qty,
        ...(notes ? { notes } : {}),
        ...(batchNumber ? { batchNumber } : {}),
      });
      setSuccess(true);
      setSelectedProduct("");
      setQuantity("");
      setBatchNumber("");
      setNotes("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to report damaged stock");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Damaged Stock</h1>
        <p className="mt-1 text-sm text-muted-foreground">Report and track damaged inventory items</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Report Form */}
        <div className="rounded-xl bg-surface shadow-sm ring-1 ring-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-danger" />
            <h2 className="text-lg font-semibold text-foreground">Report Damaged Items</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
                <CheckCircle className="h-4 w-4" />
                Damaged stock reported successfully!
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}

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
                  {products.filter((p) => p.stock > 0).map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.sku}) — Stock: {p.stock} {p.unit}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProductData?.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Qty"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Batch Number</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Reason / Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                placeholder="Describe the damage"
              />
            </div>

            <button
              type="submit"
              disabled={reportDamaged.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-danger px-4 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-danger/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reportDamaged.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              {reportDamaged.isPending ? "Processing..." : "Report Damaged"}
            </button>
          </form>
        </div>

        {/* Recent Damaged Items */}
        <div className="rounded-xl bg-surface shadow-sm ring-1 ring-border">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Damaged Items</h2>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {movementsLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
              </div>
            ) : recentDamaged.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
                <AlertTriangle className="h-8 w-8" />
                <p className="text-sm">No damaged items reported yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentDamaged.map((item) => (
                  <li key={item._id} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors">
                    <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                      {item.product?.imageUrl ? (
                        <img src={item.product.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <PackageIcon className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{item.product?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.notes || "No notes"} {item.batchNumber ? `· Batch: ${item.batchNumber}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-danger">{item.quantity} units</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
