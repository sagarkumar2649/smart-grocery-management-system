import { formatINRCompact } from "@/shared/lib/format-currency";
import type { Product } from "../api/products-api";

interface Props {
  product: Product;
  onClose: () => void;
  onEdit: (product: Product) => void;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value ?? "—"}</span>
    </div>
  );
}

export function ProductDetailDrawer({ product, onClose, onEdit }: Props) {
  const stockStatus =
    product.stock <= 0
      ? { label: "Out of Stock", cls: "bg-danger/10 text-danger" }
      : product.stock <= product.minimumStock
        ? { label: "Low Stock", cls: "bg-warning/10 text-warning" }
        : { label: "In Stock", cls: "bg-success/10 text-success" };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-surface shadow-2xl ring-1 ring-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Product Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Image + name */}
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground leading-tight">{product.name}</h3>
              {product.brand && <p className="mt-0.5 text-sm text-muted-foreground">{product.brand}</p>}
              <span className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stockStatus.cls}`}>
                {stockStatus.label}
              </span>
            </div>
          </div>

          {/* Identifiers */}
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Identification</h4>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="SKU" value={product.sku} />
              <InfoRow label="Barcode" value={product.barcode} />
              <InfoRow label="HSN Code" value={product.hsnCode} />
              <InfoRow label="Category" value={typeof product.category === "object" ? product.category.name : product.category} />
            </div>
          </section>

          {/* Pricing */}
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Pricing (₹)</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Purchase</p>
                <p className="mt-1 text-base font-bold text-foreground">{formatINRCompact(product.purchasePrice)}</p>
              </div>
              <div className="rounded-lg bg-primary/5 p-3 text-center ring-1 ring-primary/20">
                <p className="text-xs text-muted-foreground">Selling</p>
                <p className="mt-1 text-base font-bold text-primary">{formatINRCompact(product.sellingPrice)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">MRP</p>
                <p className="mt-1 text-base font-bold text-foreground">{formatINRCompact(product.mrp)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="GST %" value={`${product.gstPercent}%`} />
              <InfoRow label="Unit" value={product.unit} />
            </div>
          </section>

          {/* Stock */}
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Stock</h4>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Current Stock" value={`${product.stock} ${product.unit}`} />
              <InfoRow label="Minimum Stock" value={`${product.minimumStock} ${product.unit}`} />
            </div>
          </section>

          {/* Status */}
          <section>
            <InfoRow
              label="Status"
              value={
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${product.isActive ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  {product.isActive ? "Active" : "Inactive"}
                </span>
              }
            />
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Edit Product
          </button>
        </div>
      </aside>
    </>
  );
}
