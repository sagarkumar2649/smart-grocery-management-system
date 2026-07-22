import { Link } from 'react-router-dom';
import { useCategories } from '@/features/products/hooks/use-products';

export function StoreCategoriesPage() {
  const { data, isLoading } = useCategories();
  const categories = data?.data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Categories</h1>
        <p className="mt-1 text-sm text-gray-500">Browse products by category</p>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
        </div>
      ) : categories.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-2xl bg-surface ring-1 ring-gray-100">
          <p className="text-sm text-gray-400">No categories available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/store/products?category=${cat._id}`}
              className="group flex flex-col items-center gap-3 rounded-2xl bg-surface p-8 ring-1 ring-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:ring-primary/20 hover:-translate-y-0.5"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-white">
                <span className="text-2xl font-bold text-primary transition-colors group-hover:text-white">
                  {cat.name.charAt(0)}
                </span>
              </div>
              <div className="text-center">
                <span className="block text-sm font-semibold text-foreground">{cat.name}</span>
                {cat.description && (
                  <span className="mt-1 block text-xs text-gray-400 line-clamp-2">{cat.description}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
