import { useSearchParams, Link } from 'react-router-dom';
import { useProducts } from '@/features/products/hooks/use-products';
import { ProductCard } from '@/features/store/components/ProductCard';

export function StoreSearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data, isLoading } = useProducts({
    search: query,
    page: 1,
    limit: 20,
    status: 'active',
  });

  const products = data?.data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Search Results{query ? ` for "${query}"` : ''}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {products.length > 0 ? `${products.length} products found` : 'Search for products'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-surface ring-1 ring-gray-100 gap-3">
          <p className="text-sm text-gray-400">No products found.</p>
          <Link to="/store/products" className="text-sm font-semibold text-primary hover:text-teal-800">
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
