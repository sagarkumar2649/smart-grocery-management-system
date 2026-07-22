import { useState } from "react";
import { useLowStockReport, useOutOfStockReport, useExpiredReport } from "../hooks/use-reports";
import { ExportButtons } from "../components/ExportButtons";
import { ReportStatCard } from "../components/ReportStatCard";
import { ReportLoading, ReportError } from "../components/ReportStates";
import type { ExportColumn } from "@/shared/lib/export-utils";
import type { LowStockItem, OutOfStockItem, ExpiredProduct } from "../api/reports-api";

const AlertTriangle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);
const XCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
  </svg>
);
const Clock = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

type StockAlertTab = "low" | "out" | "expired";

const lowStockColumns: ExportColumn<LowStockItem>[] = [
  { header: "Product", key: "name" },
  { header: "SKU", key: "sku" },
  { header: "Category", key: "categoryName" },
  { header: "Stock", key: "stock" },
  { header: "Min Stock", key: "minimumStock" },
  { header: "Deficit", key: "deficit" },
  { header: "Unit", key: "unit" },
];

const outOfStockColumns: ExportColumn<OutOfStockItem>[] = [
  { header: "Product", key: "name" },
  { header: "SKU", key: "sku" },
  { header: "Category", key: "categoryName" },
  { header: "Unit", key: "unit" },
];

const expiredColumns: ExportColumn<ExpiredProduct>[] = [
  { header: "Product", key: "name" },
  { header: "SKU", key: "sku" },
  { header: "Expired Qty", key: "totalExpired" },
  { header: "Batches", key: "batches", format: (v) => (v as string[]).join(", ") },
  { header: "Last Expired", key: "lastExpired", format: (v) => new Date(v as string).toLocaleDateString("en-IN") },
];

export function StockAlertsReportPage() {
  const [tab, setTab] = useState<StockAlertTab>("low");
  const { data: lowData, isLoading: lowLoading, error: lowError } = useLowStockReport();
  const { data: outData, isLoading: outLoading, error: outError } = useOutOfStockReport();
  const { data: expiredData, isLoading: expiredLoading, error: expiredError } = useExpiredReport();

  const isLoading = (tab === "low" && lowLoading) || (tab === "out" && outLoading) || (tab === "expired" && expiredLoading);
  const error = (tab === "low" && lowError) || (tab === "out" && outError) || (tab === "expired" && expiredError);

  if (isLoading) return <ReportLoading />;
  if (error) return <ReportError message={error.message} />;

  const lowProducts = lowData?.data?.products ?? [];
  const outProducts = outData?.data?.products ?? [];
  const expiredProducts = expiredData?.data?.products ?? [];
  const expiredSummary = expiredData?.data?.summary;

  const tabs: { key: StockAlertTab; label: string; count: number }[] = [
    { key: "low", label: "Low Stock", count: lowProducts.length },
    { key: "out", label: "Out of Stock", count: outProducts.length },
    { key: "expired", label: "Expired", count: expiredProducts.length },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Stock Alerts</h2>
          <p className="text-sm text-muted-foreground">Low stock, out of stock, and expired product reports</p>
        </div>
      </div>

      <div id="report-content">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ReportStatCard title="Low Stock" value={String(lowProducts.length)} subtitle="Below minimum" icon={AlertTriangle} iconBg="rgba(217,119,6,0.1)" iconColor="text-warning" />
          <ReportStatCard title="Out of Stock" value={String(outProducts.length)} subtitle="Need restock" icon={XCircle} iconBg="rgba(220,38,38,0.1)" iconColor="text-danger" />
          <ReportStatCard title="Expired" value={String(expiredSummary?.totalExpiredQuantity ?? 0)} subtitle={`${expiredProducts.length} products`} icon={Clock} iconBg="rgba(107,114,128,0.1)" iconColor="text-gray-500" />
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 rounded-lg bg-muted p-0.5 w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-md px-4 py-2 text-xs font-medium transition-colors ${
                tab === t.key ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              <span className={`ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                tab === t.key ? "bg-primary/10 text-primary" : "bg-border text-muted-foreground"
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Low Stock Table */}
        {tab === "low" && (
          <div className="mt-4 rounded-xl bg-surface shadow-sm ring-1 ring-border">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-sm font-semibold text-foreground">Low Stock Products</h3>
              <ExportButtons columns={lowStockColumns} rows={lowProducts.map((p) => ({ ...p }))} title="Low Stock Report" filename="low-stock-report" />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Stock</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Min</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Deficit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lowProducts.map((p, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-foreground">{p.name}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-muted-foreground font-mono">{p.sku}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-muted-foreground">{p.categoryName || "-"}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right">
                        <span className="font-medium text-warning">{p.stock}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right text-muted-foreground">{p.minimumStock}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right">
                        <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">{p.deficit}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-muted-foreground">{p.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {lowProducts.length === 0 && (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">All products are well-stocked</div>
              )}
            </div>
          </div>
        )}

        {/* Out of Stock Table */}
        {tab === "out" && (
          <div className="mt-4 rounded-xl bg-surface shadow-sm ring-1 ring-border">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-sm font-semibold text-foreground">Out of Stock Products</h3>
              <ExportButtons columns={outOfStockColumns} rows={outProducts.map((p) => ({ ...p }))} title="Out of Stock Report" filename="out-of-stock-report" />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {outProducts.map((p, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-foreground">{p.name}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-muted-foreground font-mono">{p.sku}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-muted-foreground">{p.categoryName || "-"}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-muted-foreground">{p.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {outProducts.length === 0 && (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">No out of stock products</div>
              )}
            </div>
          </div>
        )}

        {/* Expired Table */}
        {tab === "expired" && (
          <div className="mt-4 rounded-xl bg-surface shadow-sm ring-1 ring-border">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-sm font-semibold text-foreground">Expired Products</h3>
              <ExportButtons columns={expiredColumns} rows={expiredProducts.map((p) => ({ ...p }))} title="Expired Products Report" filename="expired-products-report" />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">SKU</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Expired Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Batches</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Last Expired</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {expiredProducts.map((p, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-foreground">{p.name}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-muted-foreground font-mono">{p.sku}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right">
                        <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">{p.totalExpired}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-muted-foreground">{p.batches.join(", ")}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-muted-foreground">{new Date(p.lastExpired).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {expiredProducts.length === 0 && (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">No expired products</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
