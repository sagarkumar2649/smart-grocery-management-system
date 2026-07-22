interface ReportStatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  iconBg: string;
  iconColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function ReportStatCard({ title, value, subtitle, icon: Icon, iconBg, iconColor }: ReportStatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-surface p-5 shadow-sm ring-1 ring-border transition-all hover:shadow-md">
      <div className="absolute rounded-lg p-2.5" style={{ backgroundColor: iconBg }}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="ml-14">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
        {subtitle && <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}
