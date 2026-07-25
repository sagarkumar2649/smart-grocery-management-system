import { useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import type { Order } from '@/features/store/api/orders-api';
import { useUpiInfo } from '@/features/store/hooks/use-orders';
import { useStoreSettings } from '@/features/store/hooks/use-store-settings';

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

const CheckCircleIcon = ({ className = 'h-16 w-16' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
);

const TruckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

export function StoreOrderSuccessPage() {
  const location = useLocation();
  const order = (location.state as { order?: Order } | null)?.order;
  const { data: upiInfo } = useUpiInfo();
  const { data: storeSettingsRes } = useStoreSettings();
  const storeSettings = storeSettingsRes?.data;

  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  if (!order) {
    return <Navigate to="/store/orders" replace />;
  }

  const isPendingPayment = order.paymentStatus === 'pending_verification';
  const isUpiOrQr = order.paymentMethod === 'upi' || order.paymentMethod === 'qr';

  if (paymentSubmitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-green-500 mb-4">
            <CheckCircleIcon />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Payment Submitted Successfully</h1>
          <p className="mt-2 text-sm text-gray-500">
            Your payment has been received and is pending verification by our team.
          </p>
        </div>

        <div className="rounded-2xl bg-surface p-6 ring-1 ring-gray-100 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <ClockIcon />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Payment Pending Verification</p>
              <p className="text-xs text-gray-500">We&apos;ll confirm your payment shortly</p>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order ID</span>
              <span className="font-bold text-foreground">{order.orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount</span>
              <span className="font-bold text-foreground">{formatINR(order.grandTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-medium text-foreground capitalize">{order.paymentMethod.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {storeSettings?.phoneNumber && (
          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 mb-6 text-center">
            <p className="text-sm text-blue-700">
              If you have any questions, contact us at <span className="font-semibold">{storeSettings.phoneNumber}</span>
            </p>
            {storeSettings.whatsappNumber && (
              <a
                href={`https://wa.me/${storeSettings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-semibold text-blue-600 underline"
              >
                Chat on WhatsApp
              </a>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Link
            to="/store/orders"
            className="flex-1 rounded-xl bg-primary px-4 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-teal-800"
          >
            View My Orders
          </Link>
          <Link
            to="/store/products"
            className="flex-1 rounded-xl border-2 border-primary bg-surface px-4 py-3.5 text-center text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-green-500 mb-4">
          <CheckCircleIcon />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Order Placed Successfully!</h1>
        <p className="mt-2 text-sm text-gray-500">
          Thank you for your order. We&apos;ll send you a confirmation shortly.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="rounded-2xl bg-surface p-6 ring-1 ring-gray-100 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Order ID</p>
            <p className="text-lg font-bold text-foreground">{order.orderId}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
            <TruckIcon />
            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm border-t border-gray-100 pt-4">
          <div>
            <p className="text-gray-500">Payment Method</p>
            <p className="font-medium text-foreground capitalize">
              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Payment Status</p>
            <p className={`font-medium capitalize ${
              order.paymentStatus === 'paid' ? 'text-green-600' :
              order.paymentStatus === 'pending_verification' ? 'text-amber-600' :
              order.paymentStatus === 'pending' ? 'text-amber-600' : 'text-red-600'
            }`}>
              {order.paymentStatus === 'pending_verification' ? 'Pending Verification' :
               order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
            </p>
          </div>
        </div>
      </div>

      {/* UPI / QR Payment Section */}
      {isPendingPayment && isUpiOrQr && upiInfo && (
        <div className="rounded-2xl bg-surface p-6 ring-1 ring-gray-100 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            {order.paymentMethod === 'qr' ? 'Scan QR Code to Pay' : 'UPI Payment Details'}
          </h2>

          {upiInfo.upiQrUrl && (
            <div className="flex justify-center mb-4">
              <div className="rounded-xl border border-gray-200 bg-white p-3">
                <img
                  src={upiInfo.upiQrUrl}
                  alt="UPI QR Code"
                  className="h-56 w-56 object-contain"
                />
              </div>
            </div>
          )}

          {upiInfo.upiId && (
            <div className="text-center mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">UPI ID</p>
              <p className="text-lg font-bold text-foreground font-mono">{upiInfo.upiId}</p>
              <p className="text-xs text-gray-400 mt-1">Copy this UPI ID and pay using any UPI app</p>
            </div>
          )}

          <div className="rounded-xl bg-gray-50 p-4 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount to Pay</span>
              <span className="text-lg font-bold text-foreground">{formatINR(order.grandTotal)}</span>
            </div>
          </div>

          <button
            onClick={() => setPaymentSubmitted(true)}
            className="w-full rounded-xl bg-green-600 px-4 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-green-600/25 transition-all duration-200 hover:bg-green-700"
          >
            I Have Paid
          </button>
        </div>
      )}

      {/* Items */}
      <div className="rounded-2xl bg-surface p-6 ring-1 ring-gray-100 shadow-sm mb-6">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Items Ordered</h2>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
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
                  <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                </div>
              </div>
              <span className="flex-shrink-0 font-semibold text-foreground text-xs">
                {formatINR(item.total)}
              </span>
            </div>
          ))}
        </div>

        <dl className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Subtotal</dt>
            <dd className="font-semibold text-foreground">{formatINR(order.subtotal)}</dd>
          </div>
          {order.totalGST > 0 && (
            <div className="flex justify-between">
              <dt className="text-gray-500">GST</dt>
              <dd className="text-foreground">{formatINR(order.totalGST)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-gray-500">Delivery</dt>
            <dd className={`font-semibold ${order.deliveryCharges === 0 ? 'text-green-600' : 'text-foreground'}`}>
              {order.deliveryCharges === 0 ? 'Free' : formatINR(order.deliveryCharges)}
            </dd>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between">
            <dt className="text-base font-bold text-foreground">Total</dt>
            <dd className="text-base font-bold text-foreground">{formatINR(order.grandTotal)}</dd>
          </div>
        </dl>
      </div>

      {/* Shipping Address */}
      <div className="rounded-2xl bg-surface p-6 ring-1 ring-gray-100 shadow-sm mb-8">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Shipping Address</h2>
        <p className="text-sm text-foreground font-medium">{order.customerName}</p>
        <p className="text-sm text-gray-600">{order.shippingAddress.line1}</p>
        {order.shippingAddress.line2 && (
          <p className="text-sm text-gray-600">{order.shippingAddress.line2}</p>
        )}
        <p className="text-sm text-gray-600">
          {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
        </p>
        <p className="text-sm text-gray-500 mt-1">Phone: {order.customerPhone}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          to="/store/orders"
          className="flex-1 rounded-xl bg-primary px-4 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-teal-800"
        >
          View My Orders
        </Link>
        <Link
          to="/store/products"
          className="flex-1 rounded-xl border-2 border-primary bg-surface px-4 py-3.5 text-center text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-white"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
