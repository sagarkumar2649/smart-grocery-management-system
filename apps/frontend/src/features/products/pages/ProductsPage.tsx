import { useState, useCallback } from "react";
import { useProducts, useCategories } from "../hooks/use-products";
import { formatINRCompact } from "@/shared/lib/format-currency";
import { ProductFormModal } from "../components/ProductFormModal";
import { DeleteProductDialog } from "../components/DeleteProductDialog";
import { ProductDetailDrawer } from "../components/ProductDetailDrawer";
import type { Product, ProductFilters } from "../api/products-api";

// ── Icons ─────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
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

// ── Subcomponents ─────────────────────────────────────────────────────────────

function StockBadge({ stock, minimumStock }: { stock: number; minimumStock: number }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
        Out of Stock
      </span>
    );
  }
  if (stock <= minimumStock) {
    return (
      <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
        Low Stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
      In Stock
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { label: "Newest first", sortBy: "createdAt", sortOrder: "desc" as const },
  { label: "Oldest first", sortBy: "createdAt", sortOrder: "asc" as const },
  { label: "Name A–Z", sortBy: "name", sortOrder: "asc" as const },
  { label: "Name Z–A", sortBy: "name", sortOrder: "desc" as const },
  { label: "Price: Low to High", sortBy: "sellingPrice", sortOrder: "asc" as const },
  { label: "Price: High to Low", sortBy: "sellingPrice", sortOrder: "desc" as const },
];

export function ProductsPage() {
  const { data: categoriesRes } = useCategories();
  const categories = categoriesRes?.data ?? [];

  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 20,
    search: "",
    category: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    lowStock: false,
  });

  const [searchInput, setSearchInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const { data, isLoading, isError } = useProducts(filters);
  const products = data?.data ?? [];
  const pagination = data?.meta?.pagination;

  const handleSearch = useCallback(() => {
    setFilters((f) => ({ ...f, search: searchInput, page: 1 }));
  }, [searchInput]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleCategoryFilter = (categoryId: string) => {
    setFilters((f) => ({ ...f, category: categoryId, page: 1 }));
  };

  const handleStatusFilter = (status: "" | "active" | "inactive") => {
    setFilters((f) => ({ ...f, status, page: 1 }));
  };

  const handleSort = (value: string) => {
    const opt = SORT_OPTIONS[parseInt(value, 10)];
    if (!opt) return;
    setFilters((f) => ({ ...f, sortBy: opt.sortBy, sortOrder: opt.sortOrder, page: 1 }));
  };

  const handleLowStockToggle = () => {
    setFilters((f) => ({ ...f, lowStock: !f.lowStock, page: 1 }));
  };

  const openAdd = () => { setEditingProduct(null); setShowForm(true); };
  const openEdit = (p: Product) => { setEditingProduct(p); setShowForm(true); setViewingProduct(null); };
  const openDelete = (p: Product) => setDeletingProduct(p);
  const openView = (p: Product) => setViewingProduct(p);
  const closeForm = () => { setShowForm(false); setEditingProduct(null); };
  const closeDelete = () => setDeletingProduct(null);
  const closeView = () => setViewingProduct(null);

  const currentSortIndex = SORT_OPTIONS.findIndex(
    (o) => o.sortBy === filters.sortBy && o.sortOrder === filters.sortOrder,
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your product catalogue
            {pagination ? ` · ${pagination.total.toLocaleString("en-IN")} products` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <PlusIcon />
          Add Product
        </button>
      </div>

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
            placeholder="Search products…"
            className="block h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* Category */}
        <select
          value={filters.category ?? ""}
          onChange={(e) => handleCategoryFilter(e.target.value)}
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={filters.status ?? ""}
          onChange={(e) => handleStatusFilter(e.target.value as "" | "active" | "inactive")}
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
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

        {/* Low stock toggle */}
        <button
          type="button"
          onClick={handleLowStockToggle}
          className={`inline-flex h-9 items-center rounded-lg border px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
            filters.lowStock
              ? "border-warning bg-warning/10 text-warning"
              : "border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          Low Stock
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          </div>
        ) : isError ? (
          <div className="flex h-48 items-center justify-center text-sm text-danger">
            Failed to load products. Please try again.
          </div>
        ) : products.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            <p className="text-sm">No products found</p>
            <button
              type="button"
              onClick={openAdd}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <PlusIcon /> Add First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  {["Image", "Product", "Category", "Stock", "Purchase (₹)", "Selling (₹)", "MRP (₹)", "GST", "Status", "Actions"].map(
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
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="group hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => openView(product)}
                  >
                    {/* Image */}
                    <td className="pl-6 py-3 pr-2">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="max-w-[180px]">
                        <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          SKU: {product.sku}
                          {product.brand ? ` · ${product.brand}` : ""}
                        </p>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {typeof product.category === "object" ? product.category.name : product.category}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-foreground">
                          {product.stock} {product.unit}
                        </span>
                        <StockBadge stock={product.stock} minimumStock={product.minimumStock} />
                      </div>
                    </td>

                    {/* Purchase */}
                    <td className="px-4 py-3 text-sm text-foreground">
                      {formatINRCompact(product.purchasePrice)}
                    </td>

                    {/* Selling */}
                    <td className="px-4 py-3 text-sm font-medium text-primary">
                      {formatINRCompact(product.sellingPrice)}
                    </td>

                    {/* MRP */}
                    <td className="px-4 py-3 text-sm text-foreground">
                      {formatINRCompact(product.mrp)}
                    </td>

                    {/* GST */}
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {product.gstPercent}%
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          product.isActive
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 pl-4 pr-6">
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => openView(product)}
                          title="View"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <EyeIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          title="Edit"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDelete(product)}
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
            of {pagination.total.toLocaleString("en-IN")} products
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
      {showForm && (
        <ProductFormModal product={editingProduct} onClose={closeForm} />
      )}
      {deletingProduct && (
        <DeleteProductDialog product={deletingProduct} onClose={closeDelete} />
      )}
      {viewingProduct && !showForm && (
        <ProductDetailDrawer
          product={viewingProduct}
          onClose={closeView}
          onEdit={(p) => { closeView(); openEdit(p); }}
        />
      )}
    </div>
  );
}
