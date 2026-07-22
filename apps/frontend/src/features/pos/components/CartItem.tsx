import { useAppDispatch } from '@/store/hooks';
import {
  updatePOSQuantity,
  removePOSItem,
  setSelectedCartItemIndex,
  type POSCartItem,
} from '@/store/slices/pos.slice';
import { formatINR } from '@/shared/lib/format-currency';

interface CartItemProps {
  item: POSCartItem;
  isSelected?: boolean;
}

export function CartItem({ item }: CartItemProps) {
  const dispatch = useAppDispatch();

  const lineTotal = item.unitPrice * item.quantity;
  const lineDiscount =
    item.discountType === 'percentage'
      ? Math.round((lineTotal * item.discount) / 100)
      : item.discount * item.quantity;
  const finalTotal = lineTotal - lineDiscount;

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 transition hover:bg-gray-50"
      onClick={() => dispatch(setSelectedCartItemIndex(-1))}
    >
      {/* Product Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-foreground">{item.name}</p>
        <p className="text-[10px] text-gray-400">
          {formatINR(item.unitPrice)} × {item.quantity}
          {item.discount > 0 && (
            <span className="ml-1 text-red-500">
              (-{item.discountType === 'percentage' ? `${item.discount}%` : formatINR(item.discount)})
            </span>
          )}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch(updatePOSQuantity({ productId: item.productId, quantity: item.quantity - 1 }));
          }}
          className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 text-xs font-bold text-gray-600 transition hover:bg-gray-100"
        >
          −
        </button>
        <input
          type="number"
          value={item.quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val)) {
              dispatch(updatePOSQuantity({ productId: item.productId, quantity: val }));
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className="h-6 w-10 rounded border border-gray-300 bg-surface text-center text-xs font-medium text-foreground focus:border-teal-500 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch(updatePOSQuantity({ productId: item.productId, quantity: item.quantity + 1 }));
          }}
          className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 text-xs font-bold text-gray-600 transition hover:bg-gray-100"
        >
          +
        </button>
      </div>

      {/* Line Total + Remove */}
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-xs font-bold text-foreground">{formatINR(finalTotal)}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch(removePOSItem(item.productId));
          }}
          className="text-[10px] text-red-400 hover:text-red-600"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
