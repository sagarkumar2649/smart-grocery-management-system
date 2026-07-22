import { useState } from "react";
import { usePurchaseReport } from "../hooks/use-reports";
import type { ReportDateRange } from "../api/reports-api";
import { DateFilter } from "../components/DateFilter";
import { ExportButtons } from "../components/ExportButtons";
import { ReportStatCard } from "../components/ReportStatCard";
import { ReportLoading, ReportError } from "../components/ReportStates";
import { formatINR, formatINRCompact } from "@/shared/lib/format-currency";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
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
const CheckCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const Clock = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  received: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const supplierColumns: ExportColumn<{ companyName: string; orders: number; totalAmount: number; paidAmount: number }>[] = [
  { header: "Supplier", key: "companyName" },
  { header: "Orders", key: "orders" },
  { header: "Total Amount", key: "totalAmount", format: (v) => formatINR(Number(v) / 100) },
  { header: "Paid", key: "paidAmount", format: (v) => formatINR(Number(v) / 100) },
];

export function PurchaseReportPage() {
  const [filters, setFilters] = useState<ReportDateRange>({ period: "monthly" });
  const { data, isLoading, error } = usePurchaseReport(filters);

  if (isLoading) return <ReportLoading />;
  if (error) return <ReportError message={error.message} />;

  const report = data?.data;
  if (!report) return null;

  const { summary, byStatus, trend, bySupplier } = report;

  const chartData = trend.map((t) => ({
    label: `${t._id.month ?? ""}/${t._id.day ?? ""}`,
    amount: t.amount / 100,
    orders: t.orders,
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Purchase Report</h2>
          <p className="text-sm text-muted-foreground">Monitor procurement and supplier payments</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DateFilter filters={filters} onChange={setFilters} />
          <ExportButtons
            columns={supplierColumns}
            rows={bySupplier.map((s) => ({ ...s }))}
            title="Purchase Report"
            filename="purchase-report"
          />
        </div>
      </div>

      <div id="report-content">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReportStatCard title="Total Orders" value={String(summary.totalOrders)} icon={Package} iconBg="rgba(15,118,110,0.1)" iconColor="text-primary" />
          <ReportStatCard title="Total Spent" value={formatINRCompact(summary.totalAmount / 100)} icon={IndianRupee} iconBg="rgba(5,150,105,0.1)" iconColor="text-success" />
          <ReportStatCard title="Paid" value={formatINRCompact(summary.totalPaid / 100)} icon={CheckCircle} iconBg="rgba(16,185,129,0.1)" iconColor="text-emerald-500" />
          <ReportStatCard title="Pending" value={formatINRCompact(summary.totalPending / 100)} icon={Clock} iconBg="rgba(220,38,38,0.1)" iconColor="text-danger" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Trend */}
          <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Purchase Trend</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#6B7280" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#6B7280" />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px" }} formatter={(v: unknown) => formatINR(Number(v))} />
                  <Bar dataKey="amount" fill="#0F766E" radius={[4, 4, 0, 0]} name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">No trend data</div>
            )}
          </div>

          {/* By Status Pie */}
          <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Orders by Status</h3>
            {byStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={byStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="count" nameKey="_id">
                    {byStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length] ?? "#6B7280"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px" }} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} formatter={(value: string) => value.charAt(0).toUpperCase() + value.slice(1)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">No data</div>
            )}
          </div>
        </div>

        {/* Status Summary */}
        {byStatus.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {byStatus.map((s) => (
              <div key={s._id} className="flex items-center gap-2 rounded-lg bg-surface px-4 py-2 ring-1 ring-border">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[s._id] || "bg-gray-100 text-gray-700"}`}>
                  {s._id.charAt(0).toUpperCase() + s._id.slice(1)}
                </span>
                <span className="text-sm font-medium text-foreground">{s.count}</span>
                <span className="text-xs text-muted-foreground">({formatINR(s.amount / 100)})</span>
              </div>
            ))}
          </div>
        )}

        {/* Supplier Table */}
        {bySupplier.length > 0 && (
          <div className="mt-6 rounded-xl bg-surface shadow-sm ring-1 ring-border">
            <div className="border-b border-border px-6 py-4">
              <h3 className="text-sm font-semibold text-foreground">Purchases by Supplier</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Supplier</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Orders</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Paid</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Pending</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bySupplier.map((s, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-foreground">{s.companyName}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right text-foreground">{s.orders}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right font-medium text-foreground">{formatINR(s.totalAmount / 100)}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right text-success">{formatINR(s.paidAmount / 100)}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right text-danger">{formatINR((s.totalAmount - s.paidAmount) / 100)}</td>
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
