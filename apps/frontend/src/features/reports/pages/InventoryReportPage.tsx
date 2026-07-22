import { useInventoryReport } from "../hooks/use-reports";
import { ExportButtons } from "../components/ExportButtons";
import { ReportStatCard } from "../components/ReportStatCard";
import { ReportLoading, ReportError } from "../components/ReportStates";
import { formatINR, formatINRCompact } from "@/shared/lib/format-currency";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { ExportColumn } from "@/shared/lib/export-utils";

const PIE_COLORS = ["#059669", "#0F766E", "#D97706", "#DC2626", "#6B7280", "#8B5CF6", "#EC4899", "#0EA5E9"];

const Package = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
  </svg>
);
const IndianRupee = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 3h12" /><path d="M6 8h12" /><path d="m6 13 8.5 8" /><path d="M6 13h3" /><path d="M9 13c6.667 0 6.667-10 0-10" />
  </svg>
);
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

const categoryColumns: ExportColumn<{ categoryName: string; products: number; totalStock: number; stockValue: number; retailValue: number }>[] = [
  { header: "Category", key: "categoryName" },
  { header: "Products", key: "products" },
  { header: "Total Stock", key: "totalStock" },
  { header: "Stock Value", key: "stockValue", format: (v) => formatINR(Number(v) / 100) },
  { header: "Retail Value", key: "retailValue", format: (v) => formatINR(Number(v) / 100) },
];

export function InventoryReportPage() {
  const { data, isLoading, error } = useInventoryReport();

  if (isLoading) return <ReportLoading />;
  if (error) return <ReportError message={error.message} />;

  const report = data?.data;
  if (!report) return null;

  const { summary, byCategory, topValue, movements } = report;

  const catChartData = byCategory.filter((c) => c.categoryName).map((c) => ({
    name: c.categoryName,
    value: c.stockValue / 100,
    stock: c.totalStock,
  }));

  const movChartData = movements.map((m) => ({
    name: m._id.charAt(0).toUpperCase() + m._id.slice(1),
    quantity: m.quantity,
    count: m.count,
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Inventory Report</h2>
          <p className="text-sm text-muted-foreground">Stock levels, valuation, and movement analytics</p>
        </div>
        <ExportButtons columns={categoryColumns} rows={byCategory.map((c) => ({ ...c }))} title="Inventory Report" filename="inventory-report" />
      </div>

      <div id="report-content">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReportStatCard title="Total Products" value={String(summary.totalProducts)} icon={Package} iconBg="rgba(15,118,110,0.1)" iconColor="text-primary" />
          <ReportStatCard title="Stock Value" value={formatINRCompact(summary.totalStockValue / 100)} icon={IndianRupee} iconBg="rgba(5,150,105,0.1)" iconColor="text-success" />
          <ReportStatCard title="Low Stock" value={String(summary.lowStock)} subtitle="Below minimum level" icon={AlertTriangle} iconBg="rgba(217,119,6,0.1)" iconColor="text-warning" />
          <ReportStatCard title="Out of Stock" value={String(summary.outOfStock)} icon={XCircle} iconBg="rgba(220,38,38,0.1)" iconColor="text-danger" />
        </div>

        {/* Valuation bar */}
        <div className="mt-6 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 p-6 ring-1 ring-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Inventory Valuation</h3>
              <p className="text-sm text-muted-foreground">Stock value at cost vs. retail price</p>
            </div>
            <div className="flex items-center gap-6 text-right">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Cost Value</p>
                <p className="text-xl font-bold text-foreground">{formatINRCompact(summary.totalStockValue / 100)}</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Retail Value</p>
                <p className="text-xl font-bold text-success">{formatINRCompact(summary.totalRetailValue / 100)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Category Pie */}
          <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Stock Value by Category</h3>
            {catChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={catChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" nameKey="name">
                    {catChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length] ?? "#6B7280"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px" }} formatter={(v: unknown) => formatINR(Number(v))} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">No category data</div>
            )}
          </div>

          {/* Movements Bar */}
          <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Stock Movements (30 Days)</h3>
            {movChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={movChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#6B7280" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#6B7280" />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px" }} />
                  <Bar dataKey="quantity" fill="#0F766E" radius={[4, 4, 0, 0]} name="Quantity" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">No movement data</div>
            )}
          </div>
        </div>

        {/* Top Stock Value Table */}
        {topValue.length > 0 && (
          <div className="mt-6 rounded-xl bg-surface shadow-sm ring-1 ring-border">
            <div className="border-b border-border px-6 py-4">
              <h3 className="text-sm font-semibold text-foreground">Top Products by Stock Value</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">SKU</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Stock</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Unit Cost</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Unit Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topValue.map((p, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-foreground">{p.name}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-muted-foreground font-mono">{p.sku}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right text-foreground">{p.stock} {p.unit}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right text-muted-foreground">{formatINR(p.purchasePrice / 100)}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right text-muted-foreground">{formatINR(p.sellingPrice / 100)}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right font-medium text-foreground">{formatINR(p.totalValue / 100)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
