import { useState } from "react";
import { useTopSellingReport } from "../hooks/use-reports";
import type { ReportDateRange } from "../api/reports-api";
import { DateFilter } from "../components/DateFilter";
import { ExportButtons } from "../components/ExportButtons";
import { ReportLoading, ReportError } from "../components/ReportStates";
import { formatINR } from "@/shared/lib/format-currency";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { ExportColumn } from "@/shared/lib/export-utils";

const Crown = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </svg>
);
const ArrowUpDown = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21 16-4 4-4-4" /><path d="M17 20V4" /><path d="m3 8 4-4 4 4" /><path d="M7 4v16" />
  </svg>
);

const productColumns: ExportColumn<{ name: string; sku: string; totalSold: number; totalRevenue: number; transactions: number }>[] = [
  { header: "Product", key: "name" },
  { header: "SKU", key: "sku" },
  { header: "Qty Sold", key: "totalSold" },
  { header: "Revenue", key: "totalRevenue", format: (v) => formatINR(Number(v) / 100) },
  { header: "Transactions", key: "transactions" },
];

export function TopSellingReportPage() {
  const [filters, setFilters] = useState<ReportDateRange>({ period: "monthly" });
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const { data, isLoading, error } = useTopSellingReport({ ...filters, sort, limit: "20" });

  if (isLoading) return <ReportLoading />;
  if (error) return <ReportError message={error.message} />;

  const report = data?.data;
  if (!report) return null;

  const { products } = report;
  const isTop = sort === "desc";

  const chartData = products.slice(0, 10).map((p) => ({
    name: p.name.length > 20 ? p.name.slice(0, 18) + "..." : p.name,
    sold: p.totalSold,
    revenue: p.totalRevenue / 100,
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {isTop ? "Top Selling" : "Least Selling"} Products
          </h2>
          <p className="text-sm text-muted-foreground">
            {isTop ? "Best performing products by sales volume" : "Products with lowest sales volume"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DateFilter filters={filters} onChange={setFilters} />
          <div className="flex rounded-lg bg-muted p-0.5">
            <button
              type="button"
              onClick={() => setSort("desc")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                sort === "desc" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Top
            </button>
            <button
              type="button"
              onClick={() => setSort("asc")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                sort === "asc" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Least
            </button>
          </div>
          <ExportButtons columns={productColumns} rows={products.map((p) => ({ ...p }))} title={`${isTop ? "Top" : "Least"} Selling Products`} filename={`${isTop ? "top" : "least"}-selling`} />
        </div>
      </div>

      <div id="report-content">
        {/* Chart */}
        <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border">
          <h3 className="mb-4 text-sm font-semibold text-foreground">{isTop ? "Top" : "Least"} 10 Products</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#6B7280" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="#6B7280" width={100} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px" }} />
                <Bar dataKey="sold" fill={isTop ? "#059669" : "#DC2626"} radius={[0, 4, 4, 0]} name="Qty Sold" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">No sales data for this period</div>
          )}
        </div>

        {/* Table */}
        {products.length > 0 && (
          <div className="mt-6 rounded-xl bg-surface shadow-sm ring-1 ring-border">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">SKU</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Qty Sold</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Revenue</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Transactions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((p, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-muted-foreground">
                        {i === 0 && isTop ? <Crown className="h-4 w-4 text-yellow-500 inline" /> : i + 1}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-foreground">{p.name}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-muted-foreground font-mono">{p.sku}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right font-medium text-foreground">{p.totalSold}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right text-foreground">{formatINR(p.totalRevenue / 100)}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right text-muted-foreground">{p.transactions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {products.length === 0 && (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-surface p-12 ring-1 ring-border">
            <ArrowUpDown className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">No sales data for the selected period</span>
          </div>
        )}
      </div>
    </div>
  );
}
