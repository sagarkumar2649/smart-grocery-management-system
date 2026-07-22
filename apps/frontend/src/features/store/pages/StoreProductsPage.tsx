import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts, useCategories } from '@/features/products/hooks/use-products';
import { ProductCard } from '@/features/store/components/ProductCard';

export function StoreProductsPage() {
  const [searchParams] = useSearchParams();

  const { data: categoriesRes } = useCategories();
  const categories = categoriesRes?.data ?? [];

  const [filters, setFilters] = useState({
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
    search: searchParams.get('search') ?? '',
    category: searchParams.get('category') ?? '',
    sortBy: searchParams.get('sortBy') ?? 'createdAt',
    sortOrder: (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc',
    status: 'active' as const,
  });

  const [searchInput, setSearchInput] = useState(filters.search);

  const { data, isLoading } = useProducts(filters);
  const products = data?.data ?? [];
  const pagination = data?.meta?.pagination;

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setFilters((f) => ({ ...f, search: searchInput, page: 1 }));
    },
    [searchInput],
  );

  const handleCategory = (catId: string) => {
    setFilters((f) => ({ ...f, category: catId, page: 1 }));
  };

  const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters((f) => ({ ...f, sortBy, sortOrder, page: 1 }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">All Products</h1>
        <p className="mt-1 text-sm text-gray-500">
          {pagination ? `${pagination.total.toLocaleString('en-IN')} products available` : 'Browse our collection'}
        </p>
      </div>

      {/* Category pills */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => handleCategory('')}
          className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
            filters.category === ''
              ? 'bg-gray-900 text-white shadow-sm'
              : 'bg-surface text-gray-600 ring-1 ring-gray-200 hover:ring-gray-300'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            type="button"
            onClick={() => handleCategory(cat._id)}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
              filters.category === cat._id
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-surface text-gray-600 ring-1 ring-gray-200 hover:ring-gray-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sort & search bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-surface pl-9 pr-4 text-sm text-foreground placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </form>

        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const parts = e.target.value.split('-');
            const sortBy = parts[0] ?? 'createdAt';
            const sortOrder = (parts[1] ?? 'desc') as 'asc' | 'desc';
            handleSort(sortBy, sortOrder);
          }}
          className="h-10 rounded-xl border border-gray-200 bg-surface px-3 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="sellingPrice-asc">Price: Low to High</option>
          <option value="sellingPrice-desc">Price: High to Low</option>
        </select>
      </div>

      {/* Products grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-surface ring-1 ring-gray-100 gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <p className="text-sm text-gray-400">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-1.5">
          {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => setFilters((f) => ({ ...f, page: pageNum }))}
                className={`h-10 min-w-10 rounded-xl px-3 text-sm font-semibold transition-all duration-200 ${
                  pageNum === pagination.page
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-surface text-gray-600 ring-1 ring-gray-200 hover:ring-gray-300'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
