import { useState, useCallback } from "react";
import {
  useCurrentStock,
  useLowStockProducts,
  useOutOfStockProducts,
} from "../hooks/use-inventory";
import { formatINRCompact } from "@/shared/lib/format-currency";
import { StockStatusBadge, StockLevelBar } from "../components/StockStatusBadge";
import { useCategories } from "@/features/products/hooks/use-products";
import type { InventoryProduct } from "../api/inventory-api";

// ── Icons ─────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
);
const PackageIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
  </svg>
);
const BarcodeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 5v14" /><path d="M8 5v14" /><path d="M12 5v14" /><path d="M17 5v14" /><path d="M20 5v14" /><path d="M6 5v14" /><path d="M15 5v14" />
  </svg>
);

type StockTab = "all" | "low" | "out";

const SORT_OPTIONS = [
  { label: "Name A–Z", sortBy: "name", sortOrder: "asc" as const },
  { label: "Name Z–A", sortBy: "name", sortOrder: "desc" as const },
  { label: "Stock: Low to High", sortBy: "stock", sortOrder: "asc" as const },
  { label: "Stock: High to Low", sortBy: "stock", sortOrder: "desc" as const },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export function InventoryStockPage() {
  const { data: categoriesRes } = useCategories();
  const categories = categoriesRes?.data ?? [];

  const [activeTab, setActiveTab] = useState<StockTab>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortIndex, setSortIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [viewingProduct, setViewingProduct] = useState<InventoryProduct | null>(null);

  const sortBy = SORT_OPTIONS[sortIndex]?.sortBy ?? "name";
  const sortOrder = SORT_OPTIONS[sortIndex]?.sortOrder ?? "asc";
  const stockFilters: Record<string, string> = {
    page: String(page),
    limit: "20",
    search,
    category,
    sortBy,
    sortOrder,
  };

  const { data: allStockRes, isLoading: allLoading } = useCurrentStock(
    activeTab === "all" ? stockFilters : { page: "1", limit: "100", sortBy, sortOrder },
  );
  const { data: lowStockRes, isLoading: lowLoading } = useLowStockProducts();
  const { data: outStockRes, isLoading: outLoading } = useOutOfStockProducts();

  const handleSearch = useCallback(() => {
    setSearch(searchInput);
    setPage(1);
  }, [searchInput]);

  let products: InventoryProduct[] = [];
  let isLoading = false;
  let pagination = allStockRes?.meta?.pagination;

  if (activeTab === "all") {
    products = allStockRes?.data ?? [];
    isLoading = allLoading;
  } else if (activeTab === "low") {
    products = lowStockRes?.data ?? [];
    isLoading = lowLoading;
  } else {
    products = outStockRes?.data ?? [];
    isLoading = outLoading;
  }

  const tabs: Array<{ key: StockTab; label: string; count: number; color: string }> = [
    { key: "all", label: "All Products", count: allStockRes?.meta?.pagination?.total ?? 0, color: "border-primary text-primary" },
    { key: "low", label: "Low Stock", count: lowStockRes?.data?.length ?? 0, color: "border-warning text-warning" },
    { key: "out", label: "Out of Stock", count: outStockRes?.data?.length ?? 0, color: "border-danger text-danger" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Current Stock</h1>
        <p className="mt-1 text-sm text-muted-foreground">Monitor inventory levels across all products</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => { setActiveTab(tab.key); setPage(1); setSearch(""); setSearchInput(""); setCategory(""); }}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? tab.color
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                activeTab === tab.key ? "bg-current/10" : "bg-muted text-muted-foreground"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      {activeTab === "all" && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex min-w-0 flex-1 basis-56 items-center">
            <span className="absolute left-3 text-muted-foreground"><SearchIcon /></span>
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onBlur={handleSearch}
              placeholder="Search by name, SKU, barcode…"
              className="block h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <select
            value={sortIndex}
            onChange={(e) => { setSortIndex(Number(e.target.value)); setPage(1); }}
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            {SORT_OPTIONS.map((o, i) => (
              <option key={i} value={i}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
            <PackageIcon className="h-10 w-10" />
            <p className="text-sm">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  {["Product", "SKU", "Barcode", "Stock", "Reserved", "Available", "Min", "Max", "Status", "Level"].map(
                    (h) => (
                      <th key={h} scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground first:pl-6 last:pr-6">
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
                    onClick={() => setViewingProduct(product)}
                  >
                    <td className="pl-6 py-3 pr-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <PackageIcon className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                          {product.brand && (
                            <p className="truncate text-xs text-muted-foreground">{product.brand}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{product.sku}</td>
                    <td className="px-4 py-3">
                      {product.barcode ? (
                        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <BarcodeIcon className="h-3.5 w-3.5" />
                          {product.barcode}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {product.stock} <span className="text-muted-foreground">{product.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{product.reservedStock}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {product.availableStock}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{product.minimumStock}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{product.maximumStock || "—"}</td>
                    <td className="px-4 py-3">
                      <StockStatusBadge status={product.stockStatus} />
                    </td>
                    <td className="px-4 py-3 pr-6">
                      <div className="w-24">
                        <StockLevelBar
                          current={product.stock}
                          minimum={product.minimumStock}
                          maximum={product.maximumStock}
                        />
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
      {activeTab === "all" && pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit + 1)}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => p - 1)}
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
                  onClick={() => setPage(pageNum)}
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
              onClick={() => setPage((p) => p + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      )}

      {/* Product Detail Drawer */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setViewingProduct(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative ml-auto h-full w-full max-w-md overflow-y-auto bg-surface shadow-xl animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/95 backdrop-blur px-6 py-4">
              <h3 className="text-lg font-semibold text-foreground">Product Details</h3>
              <button onClick={() => setViewingProduct(null)} className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
                  {viewingProduct.imageUrl ? (
                    <img src={viewingProduct.imageUrl} alt={viewingProduct.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <PackageIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{viewingProduct.name}</p>
                  <p className="text-sm text-muted-foreground">SKU: {viewingProduct.sku}</p>
                </div>
              </div>

              <StockStatusBadge status={viewingProduct.stockStatus} />

              <div className="space-y-3">
                <StockLevelBar
                  current={viewingProduct.stock}
                  minimum={viewingProduct.minimumStock}
                  maximum={viewingProduct.maximumStock}
                />
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Current Stock", value: `${viewingProduct.stock} ${viewingProduct.unit}` },
                    { label: "Reserved Stock", value: String(viewingProduct.reservedStock) },
                    { label: "Available Stock", value: String(viewingProduct.availableStock) },
                    { label: "Minimum Stock", value: String(viewingProduct.minimumStock) },
                    { label: "Maximum Stock", value: String(viewingProduct.maximumStock || "—") },
                    { label: "Purchase Price", value: formatINRCompact(viewingProduct.purchasePrice) },
                    { label: "Selling Price", value: formatINRCompact(viewingProduct.sellingPrice) },
                    { label: "MRP", value: formatINRCompact(viewingProduct.mrp) },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg bg-background p-3 ring-1 ring-border">
                      <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
                {viewingProduct.barcode && (
                  <div className="flex items-center gap-2 rounded-lg bg-background p-3 ring-1 ring-border">
                    <BarcodeIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Barcode</p>
                      <p className="text-sm font-mono text-foreground">{viewingProduct.barcode}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
