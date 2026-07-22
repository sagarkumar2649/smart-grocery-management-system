import { formatINRCompact } from "@/shared/lib/format-currency";
import { CustomerStatusBadge } from "./CustomerStatusBadge";
import type { Customer } from "../api/customers-api";

interface Props {
  customer: Customer;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onNotes: (customer: Customer) => void;
  onStatusChange: (customer: Customer) => void;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground">{value ?? "\u2014"}</span>
    </div>
  );
}

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string | undefined) {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CustomerDetailDrawer({
  customer,
  onClose,
  onEdit,
  onNotes,
  onStatusChange,
}: Props) {
  const defaultAddress = customer.addresses?.find((a) => a.isDefault);
  const otherAddresses = customer.addresses?.filter((a) => !a.isDefault) ?? [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-surface shadow-2xl ring-1 ring-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            Customer Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Avatar + Name */}
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground leading-tight">
                {customer.name}
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground truncate">
                {customer.email}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <CustomerStatusBadge status={customer.status} />
                {customer.phone && (
                  <span className="text-xs text-muted-foreground">
                    {customer.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Total Orders</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {customer.totalOrders}
              </p>
            </div>
            <div className="rounded-xl bg-primary/5 p-3 text-center ring-1 ring-primary/20">
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="mt-1 text-xl font-bold text-primary">
                {formatINRCompact(customer.totalSpending)}
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Loyalty Pts</p>
              <p className="mt-1 text-xl font-bold text-warning">
                {customer.loyaltyPoints}
              </p>
            </div>
          </div>

          {/* Info */}
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              Information
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Phone" value={customer.phone || "\u2014"} />
              <InfoRow label="Status" value={<CustomerStatusBadge status={customer.status} />} />
              <InfoRow
                label="Loyalty Points"
                value={customer.loyaltyPoints.toLocaleString("en-IN")}
              />
              <InfoRow label="Last Active" value={formatDateTime(customer.lastActiveAt)} />
              <InfoRow label="Joined" value={formatDate(customer.createdAt)} />
            </div>
          </section>

          {/* Notes */}
          {customer.notes && (
            <section className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Notes</h4>
              <div className="rounded-lg bg-warning/5 border border-warning/20 p-3">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {customer.notes}
                </p>
              </div>
            </section>
          )}

          {/* Addresses */}
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              Addresses ({customer.addresses?.length ?? 0})
            </h4>
            {customer.addresses?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No addresses saved</p>
            ) : (
              <div className="space-y-2">
                {defaultAddress && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-primary">
                        Default
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {defaultAddress.label}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">
                      {defaultAddress.line1}
                      {defaultAddress.line2
                        ? `, ${defaultAddress.line2}`
                        : ""}
                    </p>
                    <p className="text-sm text-foreground">
                      {defaultAddress.city}, {defaultAddress.state} -{" "}
                      {defaultAddress.pincode}
                    </p>
                  </div>
                )}
                {otherAddresses.map((addr) => (
                  <div
                    key={addr._id}
                    className="rounded-lg border border-border p-3"
                  >
                    <span className="text-xs text-muted-foreground">
                      {addr.label}
                    </span>
                    <p className="text-sm text-foreground mt-0.5">
                      {addr.line1}
                      {addr.line2 ? `, ${addr.line2}` : ""}
                    </p>
                    <p className="text-sm text-foreground">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Wishlist */}
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              Wishlist ({customer.wishlist?.length ?? 0})
            </h4>
            {customer.wishlist?.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No items in wishlist
              </p>
            ) : (
              <div className="space-y-2">
                {customer.wishlist?.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 rounded-lg border border-border p-2.5"
                  >
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <rect
                              width="18"
                              height="18"
                              x="3"
                              y="3"
                              rx="2"
                            />
                            <circle cx="9" cy="9" r="2" />
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatINRCompact(item.sellingPrice)} / {item.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onNotes(customer)}
            className="inline-flex h-9 items-center rounded-lg border border-warning bg-warning/10 px-4 text-sm font-medium text-warning transition-colors hover:bg-warning/20"
          >
            Notes
          </button>
          <button
            type="button"
            onClick={() => onStatusChange(customer)}
            className={`inline-flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors ${
              customer.status === "active"
                ? "border-danger bg-danger/10 text-danger hover:bg-danger/20"
                : "border-success bg-success/10 text-success hover:bg-success/20"
            }`}
          >
            {customer.status === "active" ? "Block" : "Activate"}
          </button>
          <button
            type="button"
            onClick={() => onEdit(customer)}
            className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Edit
          </button>
        </div>
      </aside>
    </>
  );
}
