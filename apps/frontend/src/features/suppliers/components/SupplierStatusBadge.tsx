import type { SupplierStatus } from "../api/suppliers-api";

const CONFIG: Record<SupplierStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-success/10 text-success" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground" },
  blacklisted: { label: "Blacklisted", className: "bg-danger/10 text-danger" },
};

export function SupplierStatusBadge({ status }: { status: SupplierStatus }) {
  const c = CONFIG[status] ?? CONFIG.inactive;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c.className}`}>
      {c.label}
    </span>
  );
}
