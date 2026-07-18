import { cn } from "@/shared/lib/cn";

type StockStatus = "in" | "low" | "out";

interface StockStatusBadgeProps {
  status: StockStatus;
  className?: string;
}

const STATUS_CONFIG: Record<StockStatus, { label: string; classes: string }> = {
  out: {
    label: "Out of Stock",
    classes: "bg-danger/10 text-danger",
  },
  low: {
    label: "Low Stock",
    classes: "bg-warning/10 text-warning",
  },
  in: {
    label: "In Stock",
    classes: "bg-success/10 text-success",
  },
};

export function StockStatusBadge({ status, className }: StockStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        config.classes,
        className,
      )}
    >
      {config.label}
    </span>
  );
}

interface StockLevelBarProps {
  current: number;
  minimum: number;
  maximum: number;
  className?: string;
}

export function StockLevelBar({ current, minimum, maximum, className }: StockLevelBarProps) {
  const max = maximum > 0 ? maximum : Math.max(current, minimum * 3, 1);
  const percentage = Math.min(100, (current / max) * 100);
  const minThreshold = (minimum / max) * 100;

  let barColor = "bg-success";
  if (current <= 0) barColor = "bg-danger";
  else if (current <= minimum) barColor = "bg-warning";

  return (
    <div className={cn("relative h-2 w-full rounded-full bg-muted/50", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-300", barColor)}
        style={{ width: `${percentage}%` }}
      />
      {minimum > 0 && maximum > 0 && (
        <div
          className="absolute top-0 h-full w-px bg-foreground/30"
          style={{ left: `${minThreshold}%` }}
          title={`Min: ${minimum}`}
        />
      )}
    </div>
  );
}
