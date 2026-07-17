import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectCartItems,
  selectCartTotal,
  removeFromCart,
  updateQuantity,
  clearCart,
} from '@/store/slices/cart.slice';

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function StoreCartPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="text-sm text-gray-500">Start adding items to your cart</p>
          <Link
            to="/store/products"
            className="mt-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-teal-800"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <button
          type="button"
          onClick={() => dispatch(clearCart())}
          className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-gray-100 shadow-sm"
            >
              {/* Image */}
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col justify-between min-w-0">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h3>
                  <p className="text-sm font-bold text-primary mt-0.5">{formatINR(item.sellingPrice)}</p>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center rounded-xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}
                      className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors rounded-l-xl"
                    >
                      -
                    </button>
                    <span className="h-8 w-8 flex items-center justify-center text-sm font-semibold text-gray-900 border-x border-gray-200">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                      className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors rounded-r-xl"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch(removeFromCart(item.productId))}
                    className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Subtotal */}
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-bold text-gray-900">
                  {formatINR(item.sellingPrice * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-100 shadow-sm h-fit sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Subtotal ({items.length} items)</dt>
              <dd className="font-semibold text-gray-900">{formatINR(total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Delivery</dt>
              <dd className="font-semibold text-green-600">Free</dd>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <dt className="text-base font-bold text-gray-900">Total</dt>
              <dd className="text-base font-bold text-gray-900">{formatINR(total)}</dd>
            </div>
          </dl>
          <Link
            to="/store/checkout"
            className="mt-6 block w-full rounded-xl bg-primary px-4 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-teal-800"
          >
            Proceed to Checkout
          </Link>
          <Link
            to="/store/products"
            className="mt-3 block w-full text-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors py-2"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
