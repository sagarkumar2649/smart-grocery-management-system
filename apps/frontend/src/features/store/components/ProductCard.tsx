import { Link } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { addToCart } from '@/store/slices/cart.slice';
import type { Product } from '@/features/products/api/products-api';

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
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

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
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
      window.location.href = '/store/cart';
    }
  };

  const discount =
    product.mrp > product.sellingPrice
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0;

  const isOutOfStock = product.stock <= 0;

  return (
    <Link
      to={`/store/products/${product._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:ring-gray-200 hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          </div>
        )}

        {discount > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-lg bg-primary px-2 py-1 text-[11px] font-bold text-white shadow-sm">
            {discount}% OFF
          </span>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[1px]">
            <span className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex-1">
          {typeof product.category === 'object' && (
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              {product.category.name}
            </p>
          )}
          <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>
          {product.brand && (
            <p className="mt-0.5 text-xs text-gray-400">{product.brand}</p>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-gray-900">
                {formatINR(product.sellingPrice)}
              </span>
            </div>
            {discount > 0 && (
              <p className="text-xs text-gray-400 line-through">
                {formatINR(product.mrp)}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {!isOutOfStock && (
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 rounded-xl border-2 border-primary bg-white px-3 py-2 text-xs font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Buy Now
            </button>
          </div>
        )}
      </div>
    </Link>
  );
}
