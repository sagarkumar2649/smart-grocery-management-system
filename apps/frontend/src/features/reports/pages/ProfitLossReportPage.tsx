import { useState } from "react";
import { useProfitLossReport } from "../hooks/use-reports";
import type { ReportDateRange } from "../api/reports-api";
import { DateFilter } from "../components/DateFilter";
import { ExportButtons } from "../components/ExportButtons";
import { ReportStatCard } from "../components/ReportStatCard";
import { ReportLoading, ReportError } from "../components/ReportStates";
import { formatINR, formatINRCompact } from "@/shared/lib/format-currency";
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line } from "recharts";
import type { ExportColumn } from "@/shared/lib/export-utils";

const IndianRupee = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 3h12" /><path d="M6 8h12" /><path d="m6 13 8.5 8" /><path d="M6 13h3" /><path d="M9 13c6.667 0 6.667-10 0-10" />
  </svg>
);
const TrendingUp = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
  </svg>
);
const TrendingDown = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" />
  </svg>
);
const Percent = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="19" x2="5" y1="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);
const ShoppingCart = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);

const plColumns: ExportColumn<{ label: string; amount: string; value: number }>[] = [
  { header: "Item", key: "label" },
  { header: "Amount", key: "amount" },
];

export function ProfitLossReportPage() {
  const [filters, setFilters] = useState<ReportDateRange>({ period: "monthly" });
  const { data, isLoading, error } = useProfitLossReport(filters);

  if (isLoading) return <ReportLoading />;
  if (error) return <ReportError message={error.message} />;

  const report = data?.data;
  if (!report) return null;

  const { summary, trend, purchaseTrend } = report;

  const chartData = trend.map((t, i) => {
    const purchaseEntry = purchaseTrend[i];
    return {
      label: `${t._id.month ?? ""}/${t._id.day ?? ""}`,
      revenue: t.revenue / 100,
      cost: purchaseEntry ? purchaseEntry.cost / 100 : 0,
      profit: (t.revenue - (purchaseEntry ? purchaseEntry.cost : 0)) / 100,
    };
  });

  const plRows = [
    { label: "Revenue (Sales)", amount: formatINR(summary.revenue / 100), value: summary.revenue },
    { label: "Cost of Goods (Purchases)", amount: `- ${formatINR(summary.costOfGoods / 100)}`, value: -summary.costOfGoods },
    { label: "GST", amount: formatINR(summary.gst / 100), value: summary.gst },
    { label: "", amount: "", value: 0 },
    { label: "Gross Profit", amount: formatINR(summary.grossProfit / 100), value: summary.grossProfit },
    { label: "Profit Margin", amount: `${summary.margin.toFixed(1)}%`, value: 0 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Profit & Loss Report</h2>
          <p className="text-sm text-muted-foreground">Revenue, costs, and profitability analysis</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DateFilter filters={filters} onChange={setFilters} />
          <ExportButtons columns={plColumns} rows={plRows.map((r) => ({ ...r }))} title="Profit & Loss Report" filename="profit-loss-report" />
        </div>
      </div>

      <div id="report-content">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReportStatCard title="Revenue" value={formatINRCompact(summary.revenue / 100)} icon={IndianRupee} iconBg="rgba(5,150,105,0.1)" iconColor="text-success" />
          <ReportStatCard title="Cost of Goods" value={formatINRCompact(summary.costOfGoods / 100)} icon={ShoppingCart} iconBg="rgba(220,38,38,0.1)" iconColor="text-danger" />
          <ReportStatCard title="Gross Profit" value={formatINRCompact(summary.grossProfit / 100)} icon={summary.grossProfit >= 0 ? TrendingUp : TrendingDown} iconBg={summary.grossProfit >= 0 ? "rgba(16,185,129,0.1)" : "rgba(220,38,38,0.1)"} iconColor={summary.grossProfit >= 0 ? "text-success" : "text-danger"} />
          <ReportStatCard title="Margin" value={`${summary.margin.toFixed(1)}%`} icon={Percent} iconBg="rgba(139,92,246,0.1)" iconColor="text-purple-500" />
        </div>

        {/* P&L Summary Card */}
        <div className="mt-6 rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Profit & Loss Statement</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm font-medium text-foreground">Revenue (Sales)</span>
              <span className="text-sm font-bold text-success">{formatINR(summary.revenue / 100)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm font-medium text-foreground">Cost of Goods Sold</span>
              <span className="text-sm font-bold text-danger">- {formatINR(summary.costOfGoods / 100)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm font-medium text-foreground">GST (Purchases)</span>
              <span className="text-sm text-muted-foreground">{formatINR(summary.gst / 100)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-t-2 border-foreground">
              <span className="text-base font-bold text-foreground">Gross Profit</span>
              <span className={`text-lg font-bold ${summary.grossProfit >= 0 ? "text-success" : "text-danger"}`}>
                {formatINR(summary.grossProfit / 100)}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-muted-foreground">Units Sold</span>
              <span className="text-xs text-muted-foreground">{summary.unitsSold}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-muted-foreground">Profit Margin</span>
              <span className={`text-xs font-medium ${summary.margin >= 0 ? "text-success" : "text-danger"}`}>
                {summary.margin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mt-6 rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Revenue vs Cost Trend</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#6B7280" />
                <YAxis tick={{ fontSize: 11 }} stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px" }} formatter={(v: unknown) => formatINR(Number(v))} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="revenue" fill="#059669" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="cost" fill="#DC2626" radius={[4, 4, 0, 0]} name="Cost" />
                <Line type="monotone" dataKey="profit" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Profit" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">No data for selected period</div>
          )}
        </div>
      </div>
    </div>
  );
}
