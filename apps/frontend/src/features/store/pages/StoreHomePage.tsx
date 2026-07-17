import { Link } from 'react-router-dom';
import { useProducts, useCategories } from '@/features/products/hooks/use-products';
import { useStoreSettings } from '@/features/store/hooks/use-store-settings';
import { ProductCard } from '@/features/store/components/ProductCard';

const reviews = [
  { name: 'Priya S.', text: 'Always fresh products and quick delivery. My go-to store for daily groceries!', rating: 5 },
  { name: 'Rahul M.', text: 'Great prices on fresh vegetables. The quality is consistently excellent.', rating: 5 },
  { name: 'Anita K.', text: 'Love shopping here! The store is well-organized and staff is very helpful.', rating: 4 },
  { name: 'Vikram D.', text: 'Best general store in the area. They have everything I need under one roof.', rating: 5 },
];

const features = [
  { title: 'Fresh Products', desc: 'Handpicked daily for maximum freshness', icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25' },
  { title: 'Fast Delivery', desc: 'Get your orders delivered to your doorstep', icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h3.75L12 6.75l4.875 7.5h3.75' },
  { title: 'Best Prices', desc: 'Competitive prices on all daily essentials', icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { title: 'Quality Assured', desc: 'Every product checked for quality before stocking', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={i < rating ? '#D97706' : 'none'} stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      ))}
    </div>
  );
}

export function StoreHomePage() {
  const { data: productsRes, isLoading: productsLoading } = useProducts({ page: 1, limit: 8, sortBy: 'createdAt', sortOrder: 'desc', status: 'active' });
  const { data: categoriesRes } = useCategories();
  const { data: settingsRes } = useStoreSettings();

  const products = productsRes?.data ?? [];
  const categories = categoriesRes?.data ?? [];
  const settings = settingsRes?.data;
  const storeName = settings?.storeName ?? 'Sagar General Store';

  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0">
          {settings?.heroBanner?.url ? (
            <img src={settings.heroBanner.url} alt="" className="h-full w-full object-cover opacity-40" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 opacity-80" />
          )}
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Open Now &bull; {settings?.openingHours || 'Mon-Sun: 8AM - 10PM'}
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
              {storeName}
            </h1>
            <p className="mt-4 text-lg text-gray-300 sm:text-xl max-w-lg leading-relaxed">
              Fresh Grocery &bull; Daily Essentials &bull; Fast Service
            </p>
            <p className="mt-3 text-sm text-gray-400 max-w-md">
              {settings?.storeDescription || 'Your trusted neighbourhood grocery store. Quality products at honest prices, delivered with a smile.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/store/products"
                className="inline-flex items-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-teal-800 hover:shadow-xl hover:shadow-primary/30"
              >
                Shop Now
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
              <Link
                to="/store/categories"
                className="inline-flex items-center rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/10"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Features */}
        <section className="py-12 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path strokeLinecap="round" strokeLinejoin="round" d={f.icon} /></svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{f.title}</h3>
                  <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <section className="py-10">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
                <p className="mt-1 text-sm text-gray-500">Browse our wide range of categories</p>
              </div>
              <Link to="/store/categories" className="text-sm font-semibold text-primary hover:text-teal-800 transition-colors hidden sm:block">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat._id}
                  to={`/store/products?category=${cat._id}`}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-white p-5 ring-1 ring-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:ring-primary/20 hover:-translate-y-0.5"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <span className="text-lg font-bold text-primary">{cat.name.charAt(0)}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-900 text-center">{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* New Arrivals / Latest Products */}
        <section className="py-10">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
              <p className="mt-1 text-sm text-gray-500">Recently added to our store</p>
            </div>
            <Link to="/store/products" className="text-sm font-semibold text-primary hover:text-teal-800 transition-colors hidden sm:block">
              View All
            </Link>
          </div>
          {productsLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-2xl bg-white ring-1 ring-gray-100">
              <p className="text-sm text-gray-400">Products coming soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Offers Banner */}
        <section className="py-6">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-teal-900 p-8 sm:p-12">
            <div className="flex flex-col items-center text-center gap-4 sm:flex-row sm:text-left">
              <div className="flex-1">
                <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 mb-3">Limited Time</span>
                <h3 className="text-2xl font-bold text-white sm:text-3xl">Great Deals Everyday</h3>
                <p className="mt-2 text-sm text-gray-300 max-w-md">
                  Shop our curated selection of daily essentials at the best prices. Quality guaranteed.
                </p>
              </div>
              <Link
                to="/store/products"
                className="inline-flex items-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-lg transition-all duration-200 hover:bg-gray-100"
              >
                Shop Deals
              </Link>
            </div>
          </div>
        </section>

        {/* Customer Reviews */}
        <section className="py-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">What Our Customers Say</h2>
            <p className="mt-1 text-sm text-gray-500">Trusted by hundreds of happy families</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {reviews.map((review, i) => (
              <div key={i} className="rounded-2xl bg-white p-5 ring-1 ring-gray-100 shadow-sm">
                <StarRating rating={review.rating} />
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{review.text}</p>
                <p className="mt-3 text-xs font-semibold text-gray-900">{review.name}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
