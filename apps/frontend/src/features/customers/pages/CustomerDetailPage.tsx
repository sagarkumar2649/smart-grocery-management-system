import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useCustomer,
  useUpdateCustomerStatus,
} from "../hooks/use-customers";
import { formatINRCompact } from "@/shared/lib/format-currency";
import { CustomerStatusBadge } from "../components/CustomerStatusBadge";
import { CustomerFormModal } from "../components/CustomerFormModal";
import { DeleteCustomerDialog } from "../components/DeleteCustomerDialog";
import { CustomerNotesEditor } from "../components/CustomerNotesEditor";

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
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

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useCustomer(id ?? "");
  const { mutate: mutateStatus } = useUpdateCustomerStatus();

  const [editingCustomer, setEditingCustomer] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showNotesEditor, setShowNotesEditor] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);

  const customer = data?.data;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        <button
          type="button"
          onClick={() => navigate("/customers")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <BackIcon /> Back to Customers
        </button>
        <div className="flex h-48 items-center justify-center rounded-xl bg-surface ring-1 ring-border">
          <p className="text-sm text-danger">Customer not found</p>
        </div>
      </div>
    );
  }

  const handleStatusToggle = () => {
    const newStatus = customer.status === "active" ? "blocked" : "active";
    mutateStatus(
      { id: customer._id, status: newStatus },
      { onSuccess: () => setShowStatusConfirm(false) },
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate("/customers")}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <BackIcon /> Back to Customers
      </button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{customer.name}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{customer.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <CustomerStatusBadge status={customer.status} />
              {customer.phone && (
                <span className="text-sm text-muted-foreground">{customer.phone}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowNotesEditor(true)}
            className="inline-flex h-9 items-center rounded-lg border border-warning bg-warning/10 px-4 text-sm font-medium text-warning transition-colors hover:bg-warning/20"
          >
            Notes
          </button>
          <button
            type="button"
            onClick={() => setShowStatusConfirm(true)}
            className={`inline-flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors ${
              customer.status === "active"
                ? "border-danger bg-danger/10 text-danger hover:bg-danger/20"
                : "border-success bg-success/10 text-success hover:bg-success/20"
            }`}
          >
            {customer.status === "active" ? "Block Customer" : "Activate Customer"}
          </button>
          <button
            type="button"
            onClick={() => setEditingCustomer(true)}
            className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Edit Customer
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            className="inline-flex h-9 items-center rounded-lg border border-danger bg-danger/10 px-4 text-sm font-medium text-danger transition-colors hover:bg-danger/20"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-surface p-5 shadow-sm ring-1 ring-border">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{customer.totalOrders}</p>
        </div>
        <div className="rounded-xl bg-surface p-5 shadow-sm ring-1 ring-border">
          <p className="text-sm text-muted-foreground">Total Spending</p>
          <p className="mt-1 text-3xl font-bold text-primary">{formatINRCompact(customer.totalSpending)}</p>
        </div>
        <div className="rounded-xl bg-surface p-5 shadow-sm ring-1 ring-border">
          <p className="text-sm text-muted-foreground">Loyalty Points</p>
          <p className="mt-1 text-3xl font-bold text-warning">{customer.loyaltyPoints}</p>
        </div>
        <div className="rounded-xl bg-surface p-5 shadow-sm ring-1 ring-border">
          <p className="text-sm text-muted-foreground">Wishlist Items</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{customer.wishlist?.length ?? 0}</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Information */}
        <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Email" value={customer.email} />
            <InfoRow label="Phone" value={customer.phone || "\u2014"} />
            <InfoRow label="Status" value={<CustomerStatusBadge status={customer.status} />} />
            <InfoRow label="Loyalty Points" value={customer.loyaltyPoints.toLocaleString("en-IN")} />
            <InfoRow label="Last Active" value={formatDateTime(customer.lastActiveAt)} />
            <InfoRow label="Joined" value={formatDate(customer.createdAt)} />
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Admin Notes</h3>
            <button
              type="button"
              onClick={() => setShowNotesEditor(true)}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Edit
            </button>
          </div>
          {customer.notes ? (
            <div className="rounded-lg bg-warning/5 border border-warning/20 p-4">
              <p className="text-sm text-foreground whitespace-pre-wrap">{customer.notes}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No notes yet</p>
          )}
        </div>

        {/* Addresses */}
        <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            Saved Addresses ({customer.addresses?.length ?? 0})
          </h3>
          {customer.addresses?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No addresses saved</p>
          ) : (
            <div className="space-y-3">
              {customer.addresses?.map((addr) => (
                <div
                  key={addr._id}
                  className={`rounded-lg border p-3 ${
                    addr.isDefault
                      ? "border-primary/20 bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {addr.isDefault && (
                      <span className="text-xs font-medium text-primary">Default</span>
                    )}
                    <span className="text-xs text-muted-foreground">{addr.label}</span>
                  </div>
                  <p className="text-sm text-foreground">
                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}
                  </p>
                  <p className="text-sm text-foreground">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wishlist */}
        <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            Wishlist ({customer.wishlist?.length ?? 0})
          </h3>
          {customer.wishlist?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items in wishlist</p>
          ) : (
            <div className="space-y-2">
              {customer.wishlist?.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatINRCompact(item.sellingPrice)} / {item.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {editingCustomer && (
        <CustomerFormModal customer={customer} onClose={() => setEditingCustomer(false)} />
      )}
      {showDeleteDialog && (
        <DeleteCustomerDialog customer={customer} onClose={() => setShowDeleteDialog(false)} />
      )}
      {showNotesEditor && (
        <CustomerNotesEditor customer={customer} onClose={() => setShowNotesEditor(false)} />
      )}

      {/* Status Change Confirmation */}
      {showStatusConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
          onClick={() => setShowStatusConfirm(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl ring-1 ring-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-foreground">
              {customer.status === "active" ? "Block Customer" : "Activate Customer"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to {customer.status === "active" ? "block" : "activate"}{" "}
              <span className="font-medium text-foreground">{customer.name}</span>?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowStatusConfirm(false)}
                className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusToggle}
                className={`inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-white transition-colors ${
                  customer.status === "active"
                    ? "bg-danger hover:bg-danger/90"
                    : "bg-success hover:bg-success/90"
                }`}
              >
                {customer.status === "active" ? "Block" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
