import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSupplier, useUpdateSupplierStatus, usePurchaseOrders } from "../hooks/use-suppliers";
import { formatINRCompact } from "@/shared/lib/format-currency";
import { SupplierStatusBadge } from "../components/SupplierStatusBadge";
import { POStatusBadge } from "../components/POStatusBadge";
import { SupplierFormModal } from "../components/SupplierFormModal";
import { PurchaseOrderFormModal } from "../components/PurchaseOrderFormModal";
import { DeleteSupplierDialog } from "../components/DeleteSupplierDialog";
import { PurchaseOrderDetailModal } from "../components/PurchaseOrderDetailModal";
import type { PurchaseOrder } from "../api/suppliers-api";

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value ?? "\u2014"}</span>
    </div>
  );
}

export function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useSupplier(id ?? "");
  const { mutate: mutateStatus } = useUpdateSupplierStatus();
  const { data: poData } = usePurchaseOrders({ supplier: id ?? "", limit: 50 });

  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [creatingPO, setCreatingPO] = useState(false);
  const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);

  const supplier = data?.data;
  const allPOs = poData?.data ?? [];

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;
  }

  if (isError || !supplier) {
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        <button type="button" onClick={() => navigate("/suppliers")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"><BackIcon /> Back to Suppliers</button>
        <div className="flex h-48 items-center justify-center rounded-xl bg-surface ring-1 ring-border"><p className="text-sm text-danger">Supplier not found</p></div>
      </div>
    );
  }

  const handleStatusToggle = () => {
    const newStatus = supplier.status === "active" ? "inactive" : "active";
    mutateStatus({ id: supplier._id, status: newStatus }, { onSuccess: () => setShowStatusConfirm(false) });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <button type="button" onClick={() => navigate("/suppliers")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"><BackIcon /> Back to Suppliers</button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">{supplier.companyName.charAt(0).toUpperCase()}</div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{supplier.companyName}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{supplier.contactPerson} &middot; {supplier.email}</p>
            <div className="mt-2"><SupplierStatusBadge status={supplier.status} /></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setCreatingPO(true)} className="inline-flex items-center gap-1.5 h-9 rounded-lg bg-success px-4 text-sm font-medium text-white transition-colors hover:bg-success/90"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg> Create PO</button>
          <button type="button" onClick={() => setShowStatusConfirm(true)} className={`inline-flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors ${supplier.status === "active" ? "border-danger bg-danger/10 text-danger hover:bg-danger/20" : "border-success bg-success/10 text-success hover:bg-success/20"}`}>{supplier.status === "active" ? "Deactivate" : "Activate"}</button>
          <button type="button" onClick={() => setEditing(true)} className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Edit</button>
          <button type="button" onClick={() => setShowDelete(true)} className="inline-flex h-9 items-center rounded-lg border border-danger bg-danger/10 px-4 text-sm font-medium text-danger transition-colors hover:bg-danger/20">Delete</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-surface p-5 shadow-sm ring-1 ring-border"><p className="text-sm text-muted-foreground">Total Orders</p><p className="mt-1 text-3xl font-bold text-foreground">{supplier.totalOrders}</p></div>
        <div className="rounded-xl bg-surface p-5 shadow-sm ring-1 ring-border"><p className="text-sm text-muted-foreground">Total Purchases</p><p className="mt-1 text-3xl font-bold text-primary">{formatINRCompact(supplier.totalPurchases)}</p></div>
        <div className="rounded-xl bg-surface p-5 shadow-sm ring-1 ring-border"><p className="text-sm text-muted-foreground">Paid</p><p className="mt-1 text-3xl font-bold text-success">{formatINRCompact(supplier.paidAmount)}</p></div>
        <div className="rounded-xl bg-surface p-5 shadow-sm ring-1 ring-border"><p className="text-sm text-muted-foreground">Pending</p><p className="mt-1 text-3xl font-bold text-danger">{formatINRCompact(supplier.pendingPayments)}</p></div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Company Info */}
        <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Company Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Company" value={supplier.companyName} />
            <InfoRow label="Contact Person" value={supplier.contactPerson} />
            <InfoRow label="Phone" value={supplier.phone} />
            <InfoRow label="Email" value={supplier.email} />
            <InfoRow label="GST Number" value={supplier.gstNumber || "\u2014"} />
            <InfoRow label="Payment Terms" value={supplier.paymentTerms} />
            <InfoRow label="Status" value={<SupplierStatusBadge status={supplier.status} />} />
          </div>
        </div>

        {/* Address */}
        <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Address</h3>
          {supplier.address ? (
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-foreground">{supplier.address.line1}{supplier.address.line2 ? `, ${supplier.address.line2}` : ""}</p>
              <p className="text-sm text-foreground">{supplier.address.city}, {supplier.address.state} - {supplier.address.pincode}</p>
            </div>
          ) : <p className="text-sm text-muted-foreground">No address on file</p>}

          {supplier.notes && (
            <>
              <h3 className="text-sm font-semibold text-foreground pt-2">Notes</h3>
              <div className="rounded-lg bg-warning/5 border border-warning/20 p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap">{supplier.notes}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Purchase Orders */}
      <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Purchase Orders ({allPOs.length})</h3>
          <button type="button" onClick={() => setCreatingPO(true)} className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">Create New</button>
        </div>
        {allPOs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No purchase orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  {["Order #", "Date", "Amount", "Paid", "Balance", "Status"].map((h) => (
                    <th key={h} scope="col" className="whitespace-nowrap px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allPOs.map((o) => (
                  <tr key={o._id} className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setViewingPO(o)}>
                    <td className="px-4 py-2.5 text-sm font-medium text-foreground">{o.orderNumber}</td>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground">{new Date(o.orderDate).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-foreground">{formatINRCompact(o.totalAmount)}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-success">{formatINRCompact(o.paidAmount)}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-danger">{formatINRCompact(o.remainingBalance)}</td>
                    <td className="px-4 py-2.5"><POStatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {editing && <SupplierFormModal supplier={supplier} onClose={() => setEditing(false)} />}
      {showDelete && <DeleteSupplierDialog supplier={supplier} onClose={() => setShowDelete(false)} />}
      {creatingPO && <PurchaseOrderFormModal supplier={supplier} onClose={() => setCreatingPO(false)} />}
      {viewingPO && <PurchaseOrderDetailModal order={viewingPO} onClose={() => setViewingPO(null)} />}

      {showStatusConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4" onClick={() => setShowStatusConfirm(false)}>
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl ring-1 ring-border" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-foreground">{supplier.status === "active" ? "Deactivate" : "Activate"} Supplier</h2>
            <p className="mt-2 text-sm text-muted-foreground">Are you sure you want to {supplier.status === "active" ? "deactivate" : "activate"} <span className="font-medium text-foreground">{supplier.companyName}</span>?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowStatusConfirm(false)} className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted">Cancel</button>
              <button type="button" onClick={handleStatusToggle} className={`inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-white transition-colors ${supplier.status === "active" ? "bg-danger hover:bg-danger/90" : "bg-success hover:bg-success/90"}`}>{supplier.status === "active" ? "Deactivate" : "Activate"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
