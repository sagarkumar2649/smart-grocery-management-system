import type { ReportDateRange } from "../api/reports-api";

const PERIODS = [
  { value: "daily", label: "Today" },
  { value: "weekly", label: "This Week" },
  { value: "monthly", label: "This Month" },
  { value: "yearly", label: "This Year" },
  { value: "custom", label: "Custom" },
] as const;

interface DateFilterProps {
  filters: ReportDateRange;
  onChange: (filters: ReportDateRange) => void;
}

export function DateFilter({ filters, onChange }: DateFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex rounded-lg bg-muted p-0.5">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange({ period: p.value })}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              (filters.period || "monthly") === p.value
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {filters.period === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                onChange({ ...filters, startDate: value });
              } else {
                const { startDate: _, ...rest } = filters;
                onChange(rest);
              }
            }}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                onChange({ ...filters, endDate: value });
              } else {
                const { endDate: _, ...rest } = filters;
                onChange(rest);
              }
            }}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      )}
    </div>
  );
}
