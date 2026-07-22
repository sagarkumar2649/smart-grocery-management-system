import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProduct } from '@/features/products/hooks/use-products';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart, addBuyNowItem } from '@/store/slices/cart.slice';
import { selectCartItems } from '@/store/slices/cart.slice';

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function StoreProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useProduct(id ?? '');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cartItems = useAppSelector(selectCartItems);

  const product = data?.data;
  const cartItem = product ? cartItems.find((i) => i.productId === product._id) : undefined;

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      dispatch(
        addToCart({
          productId: product._id,
          name: product.name,
          ...(product.imageUrl ? { imageUrl: product.imageUrl } : {}),
          sellingPrice: product.sellingPrice,
          mrp: product.mrp,
          unit: product.unit,
          stock: product.stock,
        }),
      );
    }
  };

  const handleBuyNow = () => {
    if (product && product.stock > 0) {
      dispatch(
        addBuyNowItem({
          productId: product._id,
          name: product.name,
          ...(product.imageUrl ? { imageUrl: product.imageUrl } : {}),
          sellingPrice: product.sellingPrice,
          mrp: product.mrp,
          unit: product.unit,
          stock: product.stock,
        }),
      );
      navigate('/store/checkout');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-sm text-gray-400">Product not found.</p>
        <Link to="/store/products" className="text-sm font-semibold text-primary hover:text-teal-800">
          Back to Products
        </Link>
      </div>
    );
  }

  const discount =
    product.mrp > product.sellingPrice
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in duration-500">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-400">
        <Link to="/store" className="hover:text-gray-700 transition-colors">Home</Link>
        <span className="mx-2 text-gray-300">/</span>
        <Link to="/store/products" className="hover:text-gray-700 transition-colors">Products</Link>
        <span className="mx-2 text-gray-300">/</span>
        <span className="text-gray-700 font-medium">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-surface ring-1 ring-gray-100 shadow-sm">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            </div>
          )}
          {discount > 0 && (
            <span className="absolute left-4 top-4 rounded-xl bg-primary px-3 py-1.5 text-sm font-bold text-white shadow-lg">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-6">
          <div>
            {typeof product.category === 'object' && (
              <Link to={`/store/products?category=${product.category._id}`} className="text-xs font-semibold uppercase tracking-wider text-primary hover:text-teal-800 transition-colors">
                {product.category.name}
              </Link>
            )}
            <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl leading-tight">{product.name}</h1>
            {product.brand && (
              <p className="mt-1 text-sm text-gray-500">Brand: <span className="font-medium text-gray-700">{product.brand}</span></p>
            )}
          </div>

          {/* Price block */}
          <div className="rounded-2xl bg-gray-50 p-5 ring-1 ring-gray-100">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-foreground">
                {formatINR(product.sellingPrice)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatINR(product.mrp)}
                  </span>
                  <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-sm font-bold text-primary">
                    Save {formatINR(product.mrp - product.sellingPrice)}
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">Inclusive of all taxes</p>
          </div>

          {/* Stock */}
          <div>
            {product.stock > 0 ? (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-semibold text-green-700">
                  In Stock
                </span>
                <span className="text-sm text-gray-400">
                  ({product.stock} {product.unit} available)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-sm font-semibold text-red-600">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Quantity in cart */}
          {cartItem && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
              <p className="text-sm font-medium text-primary">
                {cartItem.quantity} {cartItem.unit} in your cart
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="flex-1 rounded-xl border-2 border-primary bg-surface px-6 py-3.5 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="flex-1 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Buy Now
            </button>
          </div>

          {/* Product Details */}
          <div className="rounded-2xl bg-surface p-5 ring-1 ring-gray-100 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-foreground uppercase tracking-wider">Product Details</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {product.sku && (
                <>
                  <dt className="text-gray-400">SKU</dt>
                  <dd className="font-medium text-foreground">{product.sku}</dd>
                </>
              )}
              <dt className="text-gray-400">Unit</dt>
              <dd className="font-medium text-foreground">{product.unit}</dd>
              <dt className="text-gray-400">GST Rate</dt>
              <dd className="font-medium text-foreground">{product.gstPercent}%</dd>
              {product.hsnCode && (
                <>
                  <dt className="text-gray-400">HSN Code</dt>
                  <dd className="font-medium text-foreground">{product.hsnCode}</dd>
                </>
              )}
              <dt className="text-gray-400">MRP</dt>
              <dd className="font-medium text-foreground">{formatINR(product.mrp)}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
