import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  useSuppliers, useSupplierStats,
  usePurchaseOrders, usePayments,
} from "../hooks/use-suppliers";
import { formatINRCompact } from "@/shared/lib/format-currency";
import { SupplierStatusBadge } from "../components/SupplierStatusBadge";
import { POStatusBadge } from "../components/POStatusBadge";
import { SupplierFormModal } from "../components/SupplierFormModal";
import { DeleteSupplierDialog } from "../components/DeleteSupplierDialog";
import { PurchaseOrderFormModal } from "../components/PurchaseOrderFormModal";
import { PurchaseOrderDetailModal } from "../components/PurchaseOrderDetailModal";
import type { Supplier, PurchaseOrder, SupplierFilters, POFilters, PaymentFilters, SupplierStatus } from "../api/suppliers-api";

// ── Icons ─────────────────────────────────────────────────────────────────────
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const TruckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>;
const CreditCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;

// ── Pagination Component ──────────────────────────────────────────────────────
function Pagination({ page, pages, total, onPage }: { page: number; pages: number; total: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">{total.toLocaleString("en-IN")} results</p>
      <div className="flex items-center gap-1">
        <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeftIcon /></button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map((p) => (
          <button key={p} type="button" onClick={() => onPage(p)} className={`h-8 min-w-8 rounded-md border px-2.5 text-sm transition-colors ${p === page ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-foreground hover:bg-muted"}`}>{p}</button>
        ))}
        <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRightIcon /></button>
      </div>
    </div>
  );
}

// ── Suppliers Tab ─────────────────────────────────────────────────────────────
function SuppliersTab() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SupplierFilters>({ page: 1, limit: 20, search: "", status: "", sortBy: "createdAt", sortOrder: "desc" });
  const [searchInput, setSearchInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [creatingPO, setCreatingPO] = useState<Supplier | null>(null);

  const { data, isLoading, isError } = useSuppliers(filters);
  const suppliers = data?.data ?? [];
  const pagination = data?.meta?.pagination;

  const handleSearch = useCallback(() => setFilters((f) => ({ ...f, search: searchInput, page: 1 })), [searchInput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex min-w-0 flex-1 basis-56 items-center">
          <span className="absolute left-3 text-muted-foreground"><SearchIcon /></span>
          <input type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} onBlur={handleSearch} placeholder="Search suppliers..." className="block h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
        </div>
        <select value={filters.status ?? ""} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as SupplierStatus | "", page: 1 }))} className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="blacklisted">Blacklisted</option>
        </select>
        <button type="button" onClick={() => { setEditingSupplier(null); setShowForm(true); }} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
          <PlusIcon /> Add Supplier
        </button>
      </div>

      <div className="rounded-xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
        ) : isError ? (
          <div className="flex h-48 items-center justify-center text-sm text-danger">Failed to load suppliers</div>
        ) : suppliers.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
            <TruckIcon />
            <p className="text-sm">No suppliers found</p>
            <button type="button" onClick={() => { setEditingSupplier(null); setShowForm(true); }} className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"><PlusIcon /> Add First Supplier</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  {["Company", "Contact", "Phone", "Status", "Orders", "Purchases", "Pending", "Actions"].map((h) => (
                    <th key={h} scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground first:pl-6 last:pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {suppliers.map((s) => (
                  <tr key={s._id} className="group hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => navigate(`/suppliers/${s._id}`)}>
                    <td className="pl-6 py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 flex-shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{s.companyName.charAt(0).toUpperCase()}</div>
                        <div className="min-w-0"><p className="truncate text-sm font-medium text-foreground">{s.companyName}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{s.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{s.contactPerson}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{s.phone}</td>
                    <td className="px-4 py-3"><SupplierStatusBadge status={s.status} /></td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{s.totalOrders}</td>
                    <td className="px-4 py-3 text-sm font-medium text-primary">{formatINRCompact(s.totalPurchases)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-danger">{formatINRCompact(s.pendingPayments)}</td>
                    <td className="py-3 pl-4 pr-6">
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => navigate(`/suppliers/${s._id}`)} title="View" className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><EyeIcon /></button>
                        <button type="button" onClick={() => { setEditingSupplier(s); setShowForm(true); }} title="Edit" className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"><EditIcon /></button>
                        <button type="button" onClick={() => setCreatingPO(s)} title="Create PO" className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-success/10 hover:text-success transition-colors"><FileTextIcon /></button>
                        <button type="button" onClick={() => setDeletingSupplier(s)} title="Delete" className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors"><TrashIcon /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPage={(p) => setFilters((f) => ({ ...f, page: p }))} />}

      {showForm && <SupplierFormModal supplier={editingSupplier} onClose={() => { setShowForm(false); setEditingSupplier(null); }} />}
      {deletingSupplier && <DeleteSupplierDialog supplier={deletingSupplier} onClose={() => setDeletingSupplier(null)} />}
      {creatingPO && <PurchaseOrderFormModal supplier={creatingPO} onClose={() => setCreatingPO(null)} />}
    </div>
  );
}

// ── Purchase Orders Tab ───────────────────────────────────────────────────────
function PurchaseOrdersTab() {
  const [filters, setFilters] = useState<POFilters>({ page: 1, limit: 20, status: "", search: "" });
  const [searchInput, setSearchInput] = useState("");
  const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null);

  const { data, isLoading, isError } = usePurchaseOrders(filters);
  const orders = data?.data ?? [];
  const pagination = data?.meta?.pagination;

  const handleSearch = useCallback(() => setFilters((f) => ({ ...f, search: searchInput, page: 1 })), [searchInput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex min-w-0 flex-1 basis-56 items-center">
          <span className="absolute left-3 text-muted-foreground"><SearchIcon /></span>
          <input type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} onBlur={handleSearch} placeholder="Search by order number..." className="block h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
        </div>
        <select value={filters.status ?? ""} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as never, page: 1 }))} className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="rounded-xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
        ) : isError ? (
          <div className="flex h-48 items-center justify-center text-sm text-danger">Failed to load orders</div>
        ) : orders.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
            <FileTextIcon />
            <p className="text-sm">No purchase orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  {["Order #", "Supplier", "Date", "Amount", "Paid", "Balance", "Status", "Actions"].map((h) => (
                    <th key={h} scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground first:pl-6 last:pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {orders.map((o) => (
                  <tr key={o._id} className="group hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setViewingPO(o)}>
                    <td className="pl-6 py-3 pr-4 text-sm font-medium text-foreground">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{typeof o.supplier === "object" ? o.supplier.companyName : ""}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(o.orderDate).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{formatINRCompact(o.totalAmount)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-success">{formatINRCompact(o.paidAmount)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-danger">{formatINRCompact(o.remainingBalance)}</td>
                    <td className="px-4 py-3"><POStatusBadge status={o.status} /></td>
                    <td className="py-3 pl-4 pr-6">
                      <div onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => setViewingPO(o)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><EyeIcon /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPage={(p) => setFilters((f) => ({ ...f, page: p }))} />}

      {viewingPO && <PurchaseOrderDetailModal order={viewingPO} onClose={() => setViewingPO(null)} />}
    </div>
  );
}

// ── Payments Tab ──────────────────────────────────────────────────────────────
function PaymentsTab() {
  const [filters, setFilters] = useState<PaymentFilters>({ page: 1, limit: 20 });
  const { data, isLoading, isError } = usePayments(filters);
  const payments = data?.data ?? [];
  const pagination = data?.meta?.pagination;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
        ) : isError ? (
          <div className="flex h-48 items-center justify-center text-sm text-danger">Failed to load payments</div>
        ) : payments.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
            <CreditCardIcon />
            <p className="text-sm">No payments recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  {["Order", "Supplier", "Amount", "Method", "Date", "Reference"].map((h) => (
                    <th key={h} scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground first:pl-6 last:pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-muted/30 transition-colors">
                    <td className="pl-6 py-3 pr-4 text-sm font-medium text-foreground">{p.orderNumber}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{p.supplierName}</td>
                    <td className="px-4 py-3 text-sm font-bold text-success">{formatINRCompact(p.amount)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{p.method.replace("_", " ")}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(p.date).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{p.reference || "\u2014"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPage={(p) => setFilters((f) => ({ ...f, page: p }))} />}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
type Tab = "suppliers" | "orders" | "payments";
const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "suppliers", label: "Suppliers", icon: <TruckIcon /> },
  { key: "orders", label: "Purchase Orders", icon: <FileTextIcon /> },
  { key: "payments", label: "Payments", icon: <CreditCardIcon /> },
];

export function SuppliersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("suppliers");
  const { data: statsRes } = useSupplierStats();
  const stats = statsRes?.data;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Suppliers</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage suppliers, purchase orders and payments</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-surface p-4 shadow-sm ring-1 ring-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><TruckIcon /></div>
              <div><p className="text-xs text-muted-foreground">Total Suppliers</p><p className="text-xl font-bold text-foreground">{stats.total}</p></div>
            </div>
          </div>
          <div className="rounded-xl bg-surface p-4 shadow-sm ring-1 ring-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileTextIcon /></div>
              <div><p className="text-xs text-muted-foreground">Total Purchases</p><p className="text-xl font-bold text-foreground">{formatINRCompact(stats.totalPurchases)}</p></div>
            </div>
          </div>
          <div className="rounded-xl bg-surface p-4 shadow-sm ring-1 ring-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success"><CreditCardIcon /></div>
              <div><p className="text-xs text-muted-foreground">Total Paid</p><p className="text-xl font-bold text-foreground">{formatINRCompact(stats.totalPaid)}</p></div>
            </div>
          </div>
          <div className="rounded-xl bg-surface p-4 shadow-sm ring-1 ring-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger/10 text-danger"><CreditCardIcon /></div>
              <div><p className="text-xs text-muted-foreground">Pending</p><p className="text-xl font-bold text-foreground">{formatINRCompact(stats.totalPending)}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-1 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "suppliers" && <SuppliersTab />}
      {activeTab === "orders" && <PurchaseOrdersTab />}
      {activeTab === "payments" && <PaymentsTab />}
    </div>
  );
}
