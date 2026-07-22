import { useState, useCallback } from "react";
import {
  useCustomers,
  useCustomerStats,
  useUpdateCustomerStatus,
} from "../hooks/use-customers";
import { formatINRCompact } from "@/shared/lib/format-currency";
import { CustomerStatusBadge } from "../components/CustomerStatusBadge";
import { CustomerFormModal } from "../components/CustomerFormModal";
import { CustomerDetailDrawer } from "../components/CustomerDetailDrawer";
import { DeleteCustomerDialog } from "../components/DeleteCustomerDialog";
import { CustomerNotesEditor } from "../components/CustomerNotesEditor";
import type { Customer, CustomerFilters } from "../api/customers-api";

// ── Icons ─────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const ShieldCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
);
const BanIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
);
const IndianRupeeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/></svg>
);
const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

// ── Sort Options ──────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { label: "Newest first", sortBy: "createdAt", sortOrder: "desc" as const },
  { label: "Oldest first", sortBy: "createdAt", sortOrder: "asc" as const },
  { label: "Name A\u2013Z", sortBy: "name", sortOrder: "asc" as const },
  { label: "Name Z\u2013A", sortBy: "name", sortOrder: "desc" as const },
  { label: "Spending: Low to High", sortBy: "totalSpending", sortOrder: "asc" as const },
  { label: "Spending: High to Low", sortBy: "totalSpending", sortOrder: "desc" as const },
  { label: "Orders: Low to High", sortBy: "totalOrders", sortOrder: "asc" as const },
  { label: "Orders: High to Low", sortBy: "totalOrders", sortOrder: "desc" as const },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export function CustomersPage() {
  const { data: statsRes } = useCustomerStats();
  const stats = statsRes?.data;

  const [filters, setFilters] = useState<CustomerFilters>({
    page: 1,
    limit: 20,
    search: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [searchInput, setSearchInput] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [notesCustomer, setNotesCustomer] = useState<Customer | null>(null);
  const [statusChangeCustomer, setStatusChangeCustomer] = useState<Customer | null>(null);

  const { data, isLoading, isError } = useCustomers(filters);
  const customers = data?.data ?? [];
  const pagination = data?.meta?.pagination;

  const { mutate: mutateStatus } = useUpdateCustomerStatus();

  const handleSearch = useCallback(() => {
    setFilters((f) => ({ ...f, search: searchInput, page: 1 }));
  }, [searchInput]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleStatusFilter = (status: "" | "active" | "blocked" | "inactive") => {
    setFilters((f) => ({ ...f, status, page: 1 }));
  };

  const handleSort = (value: string) => {
    const opt = SORT_OPTIONS[parseInt(value, 10)];
    if (!opt) return;
    setFilters((f) => ({ ...f, sortBy: opt.sortBy, sortOrder: opt.sortOrder, page: 1 }));
  };

  const handleStatusChange = (customer: Customer) => {
    setStatusChangeCustomer(customer);
  };

  const confirmStatusChange = () => {
    if (!statusChangeCustomer) return;
    const newStatus = statusChangeCustomer.status === "active" ? "blocked" : "active";
    mutateStatus(
      { id: statusChangeCustomer._id, status: newStatus },
      {
        onSuccess: () => {
          setStatusChangeCustomer(null);
          setViewingCustomer(null);
        },
      },
    );
  };

  const openEdit = (c: Customer) => { setEditingCustomer(c); setViewingCustomer(null); };
  const openDelete = (c: Customer) => setDeletingCustomer(c);
  const openView = (c: Customer) => setViewingCustomer(c);
  const openNotes = (c: Customer) => { setNotesCustomer(c); setViewingCustomer(null); };
  const closeForm = () => setEditingCustomer(null);
  const closeDelete = () => setDeletingCustomer(null);
  const closeView = () => setViewingCustomer(null);
  const closeNotes = () => setNotesCustomer(null);
  const closeStatusChange = () => setStatusChangeCustomer(null);

  const currentSortIndex = SORT_OPTIONS.findIndex(
    (o) => o.sortBy === filters.sortBy && o.sortOrder === filters.sortOrder,
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your customer base
          {pagination ? ` \u00B7 ${pagination.total.toLocaleString("en-IN")} customers` : ""}
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-surface p-4 shadow-sm ring-1 ring-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UsersIcon />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Customers</p>
                <p className="text-xl font-bold text-foreground">{stats.total.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-surface p-4 shadow-sm ring-1 ring-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                <ShieldCheckIcon />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-xl font-bold text-foreground">{stats.active.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-surface p-4 shadow-sm ring-1 ring-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger/10 text-danger">
                <BanIcon />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Blocked</p>
                <p className="text-xl font-bold text-foreground">{stats.blocked.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-surface p-4 shadow-sm ring-1 ring-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <IndianRupeeIcon />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-bold text-foreground">{formatINRCompact(stats.totalSpending)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex min-w-0 flex-1 basis-56 items-center">
          <span className="absolute left-3 text-muted-foreground"><SearchIcon /></span>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onBlur={handleSearch}
            placeholder="Search by name, email, phone..."
            className="block h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* Status */}
        <select
          value={filters.status ?? ""}
          onChange={(e) => handleStatusFilter(e.target.value as "" | "active" | "blocked" | "inactive")}
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Sort */}
        <select
          value={currentSortIndex >= 0 ? currentSortIndex : 0}
          onChange={(e) => handleSort(e.target.value)}
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          {SORT_OPTIONS.map((o, i) => (
            <option key={i} value={i}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          </div>
        ) : isError ? (
          <div className="flex h-48 items-center justify-center text-sm text-danger">
            Failed to load customers. Please try again.
          </div>
        ) : customers.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <p className="text-sm">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  {["Customer", "Phone", "Status", "Orders", "Spending", "Loyalty", "Joined", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        scope="col"
                        className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground first:pl-6 last:pr-6"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {customers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="group hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => openView(customer)}
                  >
                    {/* Customer */}
                    <td className="pl-6 py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{customer.name}</p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">{customer.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {customer.phone || "\u2014"}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <CustomerStatusBadge status={customer.status} />
                    </td>

                    {/* Orders */}
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {customer.totalOrders}
                    </td>

                    {/* Spending */}
                    <td className="px-4 py-3 text-sm font-medium text-primary">
                      {formatINRCompact(customer.totalSpending)}
                    </td>

                    {/* Loyalty */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-sm text-warning">
                        <StarIcon />
                        {customer.loyaltyPoints}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(customer.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3 pl-4 pr-6">
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => openView(customer)}
                          title="View"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <EyeIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(customer)}
                          title="Edit"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDelete(customer)}
                          title="Delete"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            {((pagination.page - 1) * pagination.limit + 1).toLocaleString("en-IN")}–
            {Math.min(pagination.page * pagination.limit, pagination.total).toLocaleString("en-IN")}{" "}
            of {pagination.total.toLocaleString("en-IN")} customers
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon />
            </button>
            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, page: pageNum }))}
                  className={`h-8 min-w-8 rounded-md border px-2.5 text-sm transition-colors ${
                    pageNum === pagination.page
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-foreground hover:bg-muted"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              type="button"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {editingCustomer && (
        <CustomerFormModal customer={editingCustomer} onClose={closeForm} />
      )}
      {deletingCustomer && (
        <DeleteCustomerDialog customer={deletingCustomer} onClose={closeDelete} />
      )}
      {notesCustomer && (
        <CustomerNotesEditor customer={notesCustomer} onClose={closeNotes} />
      )}
      {viewingCustomer && !editingCustomer && !notesCustomer && (
        <CustomerDetailDrawer
          customer={viewingCustomer}
          onClose={closeView}
          onEdit={openEdit}
          onNotes={openNotes}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Status Change Confirmation */}
      {statusChangeCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
          onClick={closeStatusChange}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl ring-1 ring-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
              statusChangeCustomer.status === "active" ? "bg-danger/10" : "bg-success/10"
            }`}>
              {statusChangeCustomer.status === "active" ? (
                <BanIcon />
              ) : (
                <ShieldCheckIcon />
              )}
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              {statusChangeCustomer.status === "active" ? "Block Customer" : "Activate Customer"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to {statusChangeCustomer.status === "active" ? "block" : "activate"}{" "}
              <span className="font-medium text-foreground">{statusChangeCustomer.name}</span>?
              {statusChangeCustomer.status === "active"
                ? " They won't be able to access the store."
                : " They will regain access to the store."}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeStatusChange}
                className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmStatusChange}
                className={`inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-white transition-colors ${
                  statusChangeCustomer.status === "active"
                    ? "bg-danger hover:bg-danger/90"
                    : "bg-success hover:bg-success/90"
                }`}
              >
                {statusChangeCustomer.status === "active" ? "Block" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
