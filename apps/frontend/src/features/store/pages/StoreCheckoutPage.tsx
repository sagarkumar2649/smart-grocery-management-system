import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCartItems, selectCartTotal, clearCart } from '@/store/slices/cart.slice';
import { useCreateOrder } from '@/features/store/hooks/use-orders';
import { useMyProfile } from '@/features/customers/hooks/use-customers';
import type { OrderPaymentMethod } from '@/features/store/api/orders-api';

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const INPUT_CLS =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-foreground placeholder:text-gray-400 focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all';

export function StoreCheckoutPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const items = useAppSelector(selectCartItems);
  const cartTotal = useAppSelector(selectCartTotal);
  const { data: profileRes } = useMyProfile();
  const profile = profileRes?.data;

  const createOrderMutation = useCreateOrder();

  const [form, setForm] = useState({
    customerName: profile?.name ?? '',
    customerPhone: profile?.phone ?? '',
    customerEmail: profile?.email ?? '',
    addressLine1: profile?.addresses?.find((a) => a.isDefault)?.line1 ?? '',
    addressLine2: profile?.addresses?.find((a) => a.isDefault)?.line2 ?? '',
    city: profile?.addresses?.find((a) => a.isDefault)?.city ?? '',
    state: profile?.addresses?.find((a) => a.isDefault)?.state ?? '',
    pincode: profile?.addresses?.find((a) => a.isDefault)?.pincode ?? '',
    paymentMethod: 'cod' as OrderPaymentMethod,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate totals
  const subtotal = cartTotal;
  const totalGST = items.reduce((sum, item) => {
    const gst = item.gstPercent ?? 0;
    return sum + (item.sellingPrice * item.quantity * gst) / 100;
  }, 0);
  const deliveryCharges = subtotal >= 500 ? 0 : 49;
  const grandTotal = subtotal + totalGST + deliveryCharges;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.customerName.trim()) errs.customerName = 'Name is required';
    if (!form.customerPhone.trim()) errs.customerPhone = 'Phone is required';
    else if (!/^[6-9]\d{9}$/.test(form.customerPhone.trim()))
      errs.customerPhone = 'Enter a valid 10-digit phone number';
    if (!form.addressLine1.trim()) errs.addressLine1 = 'Address is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.state.trim()) errs.state = 'State is required';
    if (!form.pincode.trim()) errs.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(form.pincode.trim()))
      errs.pincode = 'Enter a valid 6-digit pincode';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || items.length === 0) return;

    try {
      const order = await createOrderMutation.mutateAsync({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: {
          line1: form.addressLine1.trim(),
          ...(form.addressLine2.trim() ? { line2: form.addressLine2.trim() } : {}),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        ...(form.customerEmail.trim() ? { customerEmail: form.customerEmail.trim() } : {}),
        paymentMethod: form.paymentMethod,
        deliveryCharges,
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      });

      dispatch(clearCart());
      navigate(`/store/orders/${order._id}/success`, { state: { order } });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to place order';
      setErrors({ submit: message });
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          </div>
          <h2 className="text-xl font-bold text-foreground">Your cart is empty</h2>
          <p className="text-sm text-gray-500">Add items to your cart before checking out</p>
          <Link
            to="/store/products"
            className="mt-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-teal-800"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in duration-500">
      <div className="mb-6">
        <Link to="/store/cart" className="text-sm text-primary hover:text-teal-800 transition-colors">
          &larr; Back to Cart
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-foreground">Checkout</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left: Forms */}
          <div className="lg:col-span-3 space-y-6">
            {/* Customer Details */}
            <div className="rounded-2xl bg-surface p-6 ring-1 ring-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-5">Customer Details</h2>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={form.customerName}
                      onChange={handleChange}
                      className={INPUT_CLS}
                      placeholder="Your full name"
                    />
                    {errors.customerName && <p className="mt-1 text-xs text-red-500">{errors.customerName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={form.customerPhone}
                      onChange={handleChange}
                      className={INPUT_CLS}
                      placeholder="10-digit phone number"
                      maxLength={10}
                    />
                    {errors.customerPhone && <p className="mt-1 text-xs text-red-500">{errors.customerPhone}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={form.customerEmail}
                    onChange={handleChange}
                    className={INPUT_CLS}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="rounded-2xl bg-surface p-6 ring-1 ring-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-5">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={form.addressLine1}
                    onChange={handleChange}
                    className={INPUT_CLS}
                    placeholder="House/Flat no, Street, Landmark"
                  />
                  {errors.addressLine1 && <p className="mt-1 text-xs text-red-500">{errors.addressLine1}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Address Line 2 (optional)
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={form.addressLine2}
                    onChange={handleChange}
                    className={INPUT_CLS}
                    placeholder="Area, Colony, Sector"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className={INPUT_CLS}
                      placeholder="City"
                    />
                    {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      className={INPUT_CLS}
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      className={INPUT_CLS}
                      placeholder="6-digit pincode"
                      maxLength={6}
                    />
                    {errors.pincode && <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-2xl bg-surface p-6 ring-1 ring-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4">Payment Method</h2>
              <div className="space-y-3">
                {[
                  {
                    value: 'cod' as const,
                    label: 'Cash on Delivery',
                    desc: 'Pay when your order arrives',
                    available: true,
                  },
                  {
                    value: 'upi' as const,
                    label: 'UPI Payment',
                    desc: 'Google Pay, PhonePe, Paytm, etc.',
                    available: false,
                  },
                  {
                    value: 'razorpay' as const,
                    label: 'Online Payment',
                    desc: 'Credit/Debit Card, Net Banking',
                    available: false,
                  },
                  {
                    value: 'qr' as const,
                    label: 'QR Code',
                    desc: 'Scan and pay via any UPI app',
                    available: false,
                  },
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
                      !method.available
                        ? 'cursor-not-allowed opacity-50 border-gray-200'
                        : form.paymentMethod === method.value
                          ? 'border-primary bg-primary/5 cursor-pointer'
                          : 'border-gray-200 cursor-pointer hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={form.paymentMethod === method.value}
                      onChange={handleChange}
                      disabled={!method.available}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="text-sm font-semibold text-foreground">{method.label}</span>
                      <p className="text-xs text-gray-500">
                        {method.available ? method.desc : 'Coming soon'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Order Notes */}
            <div className="rounded-2xl bg-surface p-6 ring-1 ring-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4">Order Notes (optional)</h2>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-foreground placeholder:text-gray-400 focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Any special instructions for delivery..."
              />
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-surface p-6 ring-1 ring-gray-100 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-foreground mb-4">Order Summary</h2>

              {/* Items */}
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
                        <p className="truncate font-medium text-foreground text-xs">{item.name}</p>
                        <p className="text-[10px] text-gray-400">Qty: {item.quantity} x {formatINR(item.sellingPrice)}</p>
                      </div>
                    </div>
                    <span className="flex-shrink-0 font-semibold text-foreground text-xs">
                      {formatINR(item.sellingPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <dl className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Subtotal</dt>
                  <dd className="font-semibold text-foreground">{formatINR(subtotal)}</dd>
                </div>
                {totalGST > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">GST (included)</dt>
                    <dd className="text-foreground">{formatINR(totalGST)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">Delivery</dt>
                  <dd className={`font-semibold ${deliveryCharges === 0 ? 'text-green-600' : 'text-foreground'}`}>
                    {deliveryCharges === 0 ? 'Free' : formatINR(deliveryCharges)}
                  </dd>
                </div>
                {deliveryCharges > 0 && (
                  <p className="text-[11px] text-gray-400">Free delivery on orders above {formatINR(500)}</p>
                )}
                <div className="border-t border-gray-100 pt-2 flex justify-between">
                  <dt className="text-base font-bold text-foreground">Total</dt>
                  <dd className="text-base font-bold text-foreground">{formatINR(grandTotal)}</dd>
                </div>
              </dl>

              {errors.submit && (
                <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={createOrderMutation.isPending}
                className="mt-6 block w-full rounded-xl bg-primary px-4 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createOrderMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Placing Order...
                  </span>
                ) : (
                  `Place Order - ${formatINR(grandTotal)}`
                )}
              </button>
              <p className="mt-3 text-center text-[11px] text-gray-400">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
