import { useExpiredProducts } from "../hooks/use-inventory";
import { formatINRCompact } from "@/shared/lib/format-currency";

// ── Icons ─────────────────────────────────────────────────────────────────────
const Clock = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const PackageIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
  </svg>
);

// ── Page ──────────────────────────────────────────────────────────────────────

export function InventoryExpiredPage() {
  const { data: expiredRes, isLoading } = useExpiredProducts();
  const expiredItems = expiredRes?.data ?? [];

  const totalExpiredQuantity = expiredItems.reduce((sum, item) => sum + Math.abs(item.quantity), 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Expired Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track products marked as expired</p>
        </div>
        {expiredItems.length > 0 && (
          <div className="inline-flex items-center gap-2 rounded-lg bg-danger/10 px-4 py-2 text-sm font-medium text-danger">
            <Clock className="h-4 w-4" />
            {totalExpiredQuantity} total expired items
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border">
          <p className="text-sm font-medium text-muted-foreground">Total Expired Records</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{expiredItems.length}</p>
        </div>
        <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border">
          <p className="text-sm font-medium text-muted-foreground">Total Expired Qty</p>
          <p className="mt-1 text-2xl font-bold text-danger">{totalExpiredQuantity}</p>
        </div>
        <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border">
          <p className="text-sm font-medium text-muted-foreground">Unique Products</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {new Set(expiredItems.map((item) => item.product?._id)).size}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          </div>
        ) : expiredItems.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
            <Clock className="h-10 w-10" />
            <p className="text-sm">No expired products found</p>
            <p className="text-xs">Products marked as expired will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  {["Product", "SKU", "Quantity", "Batch", "Expiry Date", "Unit Cost", "Notes", "Date Reported"].map(
                    (h) => (
                      <th key={h} scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground first:pl-6 last:pr-6">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {expiredItems.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/30 transition-colors">
                    <td className="pl-6 py-3 pr-2">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                          {item.product?.imageUrl ? (
                            <img src={item.product.imageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <PackageIcon className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.product?.name ?? "Product"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                      {item.product?.sku}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
                        {Math.abs(item.quantity)} units
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                      {item.batchNumber || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {item.expiryDate
                        ? new Date(item.expiryDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {item.unitCost != null ? formatINRCompact(item.unitCost) : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
                      {item.notes || "—"}
                    </td>
                    <td className="px-4 py-3 pr-6 text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
