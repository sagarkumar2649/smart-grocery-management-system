import { useState } from "react";
import { useCustomerReport } from "../hooks/use-reports";
import type { ReportDateRange } from "../api/reports-api";
import { DateFilter } from "../components/DateFilter";
import { ExportButtons } from "../components/ExportButtons";
import { ReportStatCard } from "../components/ReportStatCard";
import { ReportLoading, ReportError } from "../components/ReportStates";
import { formatINR, formatINRCompact } from "@/shared/lib/format-currency";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { ExportColumn } from "@/shared/lib/export-utils";

const PIE_COLORS = ["#059669", "#D97706", "#DC2626"];

const Users = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IndianRupee = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 3h12" /><path d="M6 8h12" /><path d="m6 13 8.5 8" /><path d="M6 13h3" /><path d="M9 13c6.667 0 6.667-10 0-10" />
  </svg>
);
const Star = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const UserPlus = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" />
  </svg>
);

const spenderColumns: ExportColumn<{ name: string; email: string; totalSpending: number; totalOrders: number; loyaltyPoints: number }>[] = [
  { header: "Name", key: "name" },
  { header: "Email", key: "email" },
  { header: "Total Spent", key: "totalSpending", format: (v) => formatINR(Number(v) / 100) },
  { header: "Orders", key: "totalOrders" },
  { header: "Loyalty Points", key: "loyaltyPoints" },
];

export function CustomerReportPage() {
  const [filters, setFilters] = useState<ReportDateRange>({ period: "monthly" });
  const { data, isLoading, error } = useCustomerReport(filters);

  if (isLoading) return <ReportLoading />;
  if (error) return <ReportError message={error.message} />;

  const report = data?.data;
  if (!report) return null;

  const { summary, newCount, byStatus, topSpenders } = report;

  const statusData = byStatus.map((s) => ({
    name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
    value: s.count,
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Customer Report</h2>
          <p className="text-sm text-muted-foreground">Customer demographics, spending, and loyalty analytics</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DateFilter filters={filters} onChange={setFilters} />
          <ExportButtons columns={spenderColumns} rows={topSpenders.map((c) => ({ ...c }))} title="Customer Report" filename="customer-report" />
        </div>
      </div>

      <div id="report-content">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReportStatCard title="Total Customers" value={String(summary.totalCustomers)} icon={Users} iconBg="rgba(15,118,110,0.1)" iconColor="text-primary" />
          <ReportStatCard title="Active Customers" value={String(summary.activeCustomers)} icon={UserPlus} iconBg="rgba(5,150,105,0.1)" iconColor="text-success" />
          <ReportStatCard title="Total Spending" value={formatINRCompact(summary.totalSpending / 100)} icon={IndianRupee} iconBg="rgba(217,119,6,0.1)" iconColor="text-warning" />
          <ReportStatCard title="Loyalty Points" value={String(summary.totalLoyaltyPoints)} icon={Star} iconBg="rgba(139,92,246,0.1)" iconColor="text-purple-500" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Status Pie */}
          <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Customer Status Distribution</h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" nameKey="name">
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length] ?? "#6B7280"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px" }} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">No data</div>
            )}
          </div>

          {/* Stats Summary */}
          <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Customer Insights</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">New Customers (Period)</span>
                <span className="text-sm font-bold text-foreground">{newCount}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Avg Spending per Customer</span>
                <span className="text-sm font-bold text-foreground">{formatINR(summary.avgSpending / 100)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Total Orders</span>
                <span className="text-sm font-bold text-foreground">{summary.totalOrders}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Avg Orders per Customer</span>
                <span className="text-sm font-bold text-foreground">
                  {summary.totalCustomers > 0 ? (summary.totalOrders / summary.totalCustomers).toFixed(1) : "0"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Spenders */}
        {topSpenders.length > 0 && (
          <div className="mt-6 rounded-xl bg-surface shadow-sm ring-1 ring-border">
            <div className="border-b border-border px-6 py-4">
              <h3 className="text-sm font-semibold text-foreground">Top Spenders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Spent</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Orders</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topSpenders.map((c, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-muted-foreground">{i + 1}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-foreground">{c.name}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-muted-foreground">{c.email}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right font-medium text-foreground">{formatINR(c.totalSpending / 100)}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right text-foreground">{c.totalOrders}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right text-muted-foreground">{c.loyaltyPoints}</td>
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
