import { Link } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectCartItems, selectCartTotal } from '@/store/slices/cart.slice';

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function StoreCheckoutPage() {
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
          <p className="text-sm text-gray-500">Your cart is empty</p>
          <Link
            to="/store/products"
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-teal-800"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Shipping form */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Delivery Details</h2>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Phone</label>
                  <input
                    type="tel"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="10-digit phone number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Delivery Address</label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="House/Flat no, Street, Landmark"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Pincode</label>
                  <input
                    type="text"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="6-digit pincode"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 rounded-xl border border-primary bg-primary/5 p-4 cursor-pointer">
                <input type="radio" name="payment" defaultChecked className="h-4 w-4 text-primary focus:ring-primary" />
                <div>
                  <span className="text-sm font-semibold text-gray-900">Cash on Delivery</span>
                  <p className="text-xs text-gray-500">Pay when your order arrives</p>
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 cursor-not-allowed opacity-50">
                <input type="radio" name="payment" disabled className="h-4 w-4" />
                <div>
                  <span className="text-sm font-semibold text-gray-900">Online Payment</span>
                  <p className="text-xs text-gray-500">Coming soon</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-100 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300 text-xs">N/A</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900 text-xs">{item.name}</p>
                      <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="flex-shrink-0 font-semibold text-gray-900 text-xs">
                    {formatINR(item.sellingPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <dl className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Subtotal</dt>
                <dd className="font-semibold text-gray-900">{formatINR(total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Delivery</dt>
                <dd className="font-semibold text-green-600">Free</dd>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between">
                <dt className="text-base font-bold text-gray-900">Total</dt>
                <dd className="text-base font-bold text-gray-900">{formatINR(total)}</dd>
              </div>
            </dl>
            <button
              type="button"
              className="mt-6 block w-full rounded-xl bg-primary px-4 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-teal-800"
            >
              Place Order
            </button>
            <p className="mt-3 text-center text-[11px] text-gray-400">
              By placing this order, you agree to our terms and conditions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
