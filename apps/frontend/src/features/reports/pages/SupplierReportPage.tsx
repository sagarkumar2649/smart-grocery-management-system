import { useState } from "react";
import { useSupplierReport } from "../hooks/use-reports";
import type { ReportDateRange } from "../api/reports-api";
import { DateFilter } from "../components/DateFilter";
import { ExportButtons } from "../components/ExportButtons";
import { ReportStatCard } from "../components/ReportStatCard";
import { ReportLoading, ReportError } from "../components/ReportStates";
import { formatINR, formatINRCompact } from "@/shared/lib/format-currency";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { ExportColumn } from "@/shared/lib/export-utils";

const PIE_COLORS = ["#059669", "#D97706", "#DC2626", "#8B5CF6", "#0EA5E9", "#6B7280"];

const Building = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" />
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

const supplierColumns: ExportColumn<{ companyName: string; contactPerson: string; totalOrders: number; totalPurchases: number; paidAmount: number; pendingPayments: number }>[] = [
  { header: "Company", key: "companyName" },
  { header: "Contact", key: "contactPerson" },
  { header: "Orders", key: "totalOrders" },
  { header: "Total Purchases", key: "totalPurchases", format: (v) => formatINR(Number(v) / 100) },
  { header: "Paid", key: "paidAmount", format: (v) => formatINR(Number(v) / 100) },
  { header: "Pending", key: "pendingPayments", format: (v) => formatINR(Number(v) / 100) },
];

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
  blacklisted: "bg-red-100 text-red-700",
};

export function SupplierReportPage() {
  const [filters, setFilters] = useState<ReportDateRange>({ period: "monthly" });
  const { data, isLoading, error } = useSupplierReport(filters);

  if (isLoading) return <ReportLoading />;
  if (error) return <ReportError message={error.message} />;

  const report = data?.data;
  if (!report) return null;

  const { summary, byStatus, topSuppliers, paymentMethods, ordersByStatus } = report;

  const statusData = byStatus.map((s) => ({
    name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
    value: s.count,
  }));

  const paymentData = paymentMethods.map((p) => ({
    name: p._id.charAt(0).toUpperCase() + p._id.slice(1).replace("_", " "),
    value: p.total / 100,
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Supplier Report</h2>
          <p className="text-sm text-muted-foreground">Supplier performance, procurement, and payment analytics</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DateFilter filters={filters} onChange={setFilters} />
          <ExportButtons columns={supplierColumns} rows={topSuppliers.map((s) => ({ ...s }))} title="Supplier Report" filename="supplier-report" />
        </div>
      </div>

      <div id="report-content">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReportStatCard title="Total Suppliers" value={String(summary.totalSuppliers)} icon={Building} iconBg="rgba(15,118,110,0.1)" iconColor="text-primary" />
          <ReportStatCard title="Total Purchases" value={formatINRCompact(summary.totalPurchases / 100)} icon={IndianRupee} iconBg="rgba(5,150,105,0.1)" iconColor="text-success" />
          <ReportStatCard title="Total Paid" value={formatINRCompact(summary.totalPaid / 100)} icon={CheckCircle} iconBg="rgba(16,185,129,0.1)" iconColor="text-emerald-500" />
          <ReportStatCard title="Pending Payments" value={formatINRCompact(summary.totalPending / 100)} icon={Clock} iconBg="rgba(220,38,38,0.1)" iconColor="text-danger" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Status Pie */}
          <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Supplier Status</h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" nameKey="name">
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length] ?? "#6B7280"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">No data</div>
            )}
          </div>

          {/* Payment Methods Pie */}
          <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Payment Methods</h3>
            {paymentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" nameKey="name">
                    {paymentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length] ?? "#6B7280"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px" }} formatter={(v: unknown) => formatINR(Number(v))} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">No payment data</div>
            )}
          </div>

          {/* Orders by Status */}
          <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Orders by Status</h3>
            {ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ordersByStatus.map((o) => ({ ...o, name: o._id.charAt(0).toUpperCase() + o._id.slice(1) }))} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#6B7280" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#6B7280" />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px" }} />
                  <Bar dataKey="count" fill="#0F766E" radius={[4, 4, 0, 0]} name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">No data</div>
            )}
          </div>
        </div>

        {/* Top Suppliers Table */}
        {topSuppliers.length > 0 && (
          <div className="mt-6 rounded-xl bg-surface shadow-sm ring-1 ring-border">
            <div className="border-b border-border px-6 py-4">
              <h3 className="text-sm font-semibold text-foreground">Top Suppliers</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Contact</th>
                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Orders</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Paid</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Pending</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topSuppliers.map((s, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-foreground">{s.companyName}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-muted-foreground">{s.contactPerson}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-center">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[s.status] || ""}`}>{s.status}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right text-foreground">{s.totalOrders}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right font-medium text-foreground">{formatINR(s.totalPurchases / 100)}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right text-success">{formatINR(s.paidAmount / 100)}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-right text-danger">{formatINR(s.pendingPayments / 100)}</td>
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
