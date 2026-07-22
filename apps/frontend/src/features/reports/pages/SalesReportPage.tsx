import { useState } from "react";
import { useSalesReport } from "../hooks/use-reports";
import type { ReportDateRange } from "../api/reports-api";
import { DateFilter } from "../components/DateFilter";
import { ExportButtons } from "../components/ExportButtons";
import { ReportStatCard } from "../components/ReportStatCard";
import { ReportLoading, ReportError } from "../components/ReportStates";
import { formatINR, formatINRCompact } from "@/shared/lib/format-currency";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import type { ExportColumn } from "@/shared/lib/export-utils";

const TrendingUp = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
  </svg>
);
const IndianRupee = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 3h12" /><path d="M6 8h12" /><path d="m6 13 8.5 8" /><path d="M6 13h3" /><path d="M9 13c6.667 0 6.667-10 0-10" />
  </svg>
);
const ShoppingCart = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);
const BarChartIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" />
  </svg>
);

const productColumns: ExportColumn<{ productName: string; sku: string; quantity: number; revenue: number }>[] = [
  { header: "Product", key: "productName" },
  { header: "SKU", key: "sku" },
  { header: "Qty Sold", key: "quantity" },
  { header: "Revenue", key: "revenue", format: (v) => formatINR(Number(v)) },
];

export function SalesReportPage() {
  const [filters, setFilters] = useState<ReportDateRange>({ period: "monthly" });
  const { data, isLoading, error } = useSalesReport(filters);

  if (isLoading) return <ReportLoading />;
  if (error) return <ReportError message={error.message} />;

  const report = data?.data;
  if (!report) return null;

  const { summary, trend, byProduct } = report;

  const chartData = trend.map((t) => ({
    label: `${t._id.month ?? ""}/${t._id.day ?? ""}`,
    revenue: t.revenue / 100,
    quantity: t.quantity,
    transactions: t.transactions,
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Sales Report</h2>
          <p className="text-sm text-muted-foreground">Track your sales performance and revenue trends</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DateFilter filters={filters} onChange={setFilters} />
          <ExportButtons
            columns={productColumns}
            rows={byProduct.map((p) => ({ ...p }))}
            title="Sales Report"
            filename="sales-report"
          />
        </div>
      </div>

      <div id="report-content">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReportStatCard title="Total Revenue" value={formatINRCompact(summary.totalRevenue / 100)} icon={IndianRupee} iconBg="rgba(5,150,105,0.1)" iconColor="text-success" />
          <ReportStatCard title="Units Sold" value={String(summary.totalSales)} icon={ShoppingCart} iconBg="rgba(15,118,110,0.1)" iconColor="text-primary" />
          <ReportStatCard title="Transactions" value={String(summary.transactions)} icon={BarChartIcon} iconBg="rgba(217,119,6,0.1)" iconColor="text-warning" />
          <ReportStatCard title="Avg Transaction" value={formatINRCompact(summary.avgOrderValue / 100)} icon={TrendingUp} iconBg="rgba(139,92,246,0.1)" iconColor="text-purple-500" />
        </div>

        {/* Charts */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Revenue Trend</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#6B7280" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#6B7280" />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px" }} formatter={(v: unknown) => formatINR(Number(v))} />
                  <Line type="monotone" dataKey="revenue" stroke="#0F766E" strokeWidth={2} dot={false} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">No trend data</div>
            )}
          </div>

          <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Sales by Product</h3>
            {byProduct.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byProduct.slice(0, 10)} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="productName" tick={{ fontSize: 10 }} stroke="#6B7280" interval={0} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} stroke="#6B7280" />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px" }} />
                  <Bar dataKey="quantity" fill="#0F766E" radius={[4, 4, 0, 0]} name="Quantity Sold" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">No product data</div>
            )}
          </div>
        </div>

        {/* Table */}
        {byProduct.length > 0 && (
          <div className="mt-6 rounded-xl bg-surface shadow-sm ring-1 ring-border">
            <div className="border-b border-border px-6 py-4">
              <h3 className="text-sm font-semibold text-foreground">Product Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">SKU</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Qty Sold</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {byProduct.map((p, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-foreground">{p.productName}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-muted-foreground font-mono">{p.sku}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right text-foreground">{p.quantity}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right font-medium text-foreground">{formatINR(p.revenue / 100)}</td>
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
