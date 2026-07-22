import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addPOSItem, selectPOSItems } from '@/store/slices/pos.slice';
import { formatINR } from '@/shared/lib/format-currency';
import type { POSProduct } from '../api/pos-api';

interface ProductCardProps {
  product: POSProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectPOSItems);
  const inCart = cartItems.find((i) => i.productId === product._id);

  const handleAdd = () => {
    dispatch(
      addPOSItem({
        productId: product._id,
        name: product.name,
        sku: product.sku,
        ...(product.imageUrl !== undefined && { imageUrl: product.imageUrl }),
        unitPrice: product.sellingPrice,
        mrp: product.mrp,
        gstPercent: product.gstPercent,
        stock: product.stock,
        unit: product.unit,
      }),
    );
  };

  const isLowStock = product.stock <= 5;
  const hasDiscount = product.mrp > product.sellingPrice;

  return (
    <button
      onClick={handleAdd}
      className={`group relative flex flex-col rounded-lg border-2 p-2.5 text-left transition ${
        inCart
          ? 'border-teal-500 bg-teal-50 shadow-sm'
          : 'border-gray-200 bg-surface hover:border-teal-300 hover:shadow-sm'
      }`}
    >
      {hasDiscount && (
        <span className="absolute right-1.5 top-1.5 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)}% OFF
        </span>
      )}

      {product.imageUrl && (
        <div className="mb-1.5 flex justify-center">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-10 w-10 rounded object-cover"
          />
        </div>
      )}

      <p className="truncate text-xs font-semibold text-foreground">{product.name}</p>
      <p className="mt-0.5 truncate text-[10px] text-gray-400">{product.sku}</p>

      <div className="mt-auto flex items-baseline justify-between pt-1.5">
        <span className="text-sm font-bold text-teal-700">{formatINR(product.sellingPrice)}</span>
        {hasDiscount && (
          <span className="text-[10px] text-gray-400 line-through">{formatINR(product.mrp)}</span>
        )}
      </div>

      <div className="mt-1 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">
          {product.stock} {product.unit}
        </span>
        {isLowStock && (
          <span className="rounded bg-orange-100 px-1 py-0.5 text-[9px] font-medium text-orange-600">
            Low
          </span>
        )}
      </div>

      {inCart && (
        <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white shadow">
          {inCart.quantity}
        </div>
      )}
    </button>
  );
}
