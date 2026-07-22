import type { POStatus } from "../api/suppliers-api";

const CONFIG: Record<POStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  pending: { label: "Pending", className: "bg-warning/10 text-warning" },
  confirmed: { label: "Confirmed", className: "bg-blue-500/10 text-blue-600" },
  received: { label: "Received", className: "bg-success/10 text-success" },
  cancelled: { label: "Cancelled", className: "bg-danger/10 text-danger" },
};

export function POStatusBadge({ status }: { status: POStatus }) {
  const c = CONFIG[status] ?? CONFIG.draft;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c.className}`}>
      {c.label}
    </span>
  );
}
