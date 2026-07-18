import { useState } from "react";
import { useStockMovements } from "../hooks/use-inventory";
import { MOVEMENT_TYPE_LABELS, MOVEMENT_TYPE_COLORS } from "../api/inventory-api";
import { formatINRCompact } from "@/shared/lib/format-currency";

// ── Icons ─────────────────────────────────────────────────────────────────────
const History = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
);
const PackageIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
  </svg>
);

const MOVEMENT_TYPES_FILTER: Array<{ value: string; label: string }> = [
  { value: "", label: "All Types" },
  ...Object.entries(MOVEMENT_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

// ── Page ──────────────────────────────────────────────────────────────────────

export function InventoryMovementsPage() {
  const [type, setType] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  const filters: Record<string, string> = {
    page: String(page),
    limit: "20",
    type,
    batchNumber,
    startDate,
    endDate,
  };

  const { data: movementsRes, isLoading } = useStockMovements(filters);
  const movements = movementsRes?.data ?? [];
  const pagination = movementsRes?.meta?.pagination;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Stock Movements</h1>
        <p className="mt-1 text-sm text-muted-foreground">Complete audit trail of all stock changes</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          {MOVEMENT_TYPES_FILTER.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="relative flex items-center">
          <input
            type="text"
            value={batchNumber}
            onChange={(e) => { setBatchNumber(e.target.value); setPage(1); }}
            placeholder="Batch number"
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        {(type || batchNumber || startDate || endDate) && (
          <button
            type="button"
            onClick={() => { setType(""); setBatchNumber(""); setStartDate(""); setEndDate(""); setPage(1); }}
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          </div>
        ) : movements.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
            <History className="h-10 w-10" />
            <p className="text-sm">No stock movements found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  {["Product", "Type", "Qty", "Previous", "New", "Unit Cost", "Reference", "Batch", "Date"].map(
                    (h) => (
                      <th key={h} scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground first:pl-6 last:pr-6">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {movements.map((movement) => (
                  <tr key={movement._id} className="hover:bg-muted/30 transition-colors">
                    <td className="pl-6 py-3 pr-2">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                          {movement.product?.imageUrl ? (
                            <img src={movement.product.imageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <PackageIcon className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {movement.product?.name ?? "Product"}
                          </p>
                          <p className="text-xs text-muted-foreground">{movement.product?.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${MOVEMENT_TYPE_COLORS[movement.type] ?? "bg-muted text-muted-foreground"}`}>
                        {MOVEMENT_TYPE_LABELS[movement.type] ?? movement.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${movement.quantity > 0 ? "text-success" : "text-danger"}`}>
                        {movement.quantity > 0 ? "+" : ""}{movement.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{movement.previousStock}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{movement.newStock}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {movement.unitCost != null ? formatINRCompact(movement.unitCost) : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {movement.reference || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                      {movement.batchNumber || "—"}
                    </td>
                    <td className="px-4 py-3 pr-6 text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(movement.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit + 1)}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} movements
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon />
            </button>
            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`h-8 min-w-8 rounded-md border px-2.5 text-sm transition-colors ${
                    pageNum === pagination.page
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-foreground hover:bg-muted"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              type="button"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
