import type { CustomerStatus } from "../api/customers-api";

const STATUS_CONFIG: Record<
  CustomerStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-success/10 text-success",
  },
  blocked: {
    label: "Blocked",
    className: "bg-danger/10 text-danger",
  },
  inactive: {
    label: "Inactive",
    className: "bg-muted text-muted-foreground",
  },
};

export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.inactive;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
