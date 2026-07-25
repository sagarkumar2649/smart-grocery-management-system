import { useParams, Link } from 'react-router-dom';
import { useMyOrder } from '@/features/store/hooks/use-orders';
import type { Order, OrderStatus } from '@/features/store/api/orders-api';

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; cls: string }> = {
  placed: { label: 'Order Placed', cls: 'text-blue-600 bg-blue-50' },
  confirmed: { label: 'Confirmed', cls: 'text-indigo-600 bg-indigo-50' },
  processing: { label: 'Processing', cls: 'text-purple-600 bg-purple-50' },
  shipped: { label: 'Shipped', cls: 'text-amber-600 bg-amber-50' },
  delivered: { label: 'Delivered', cls: 'text-green-600 bg-green-50' },
  cancelled: { label: 'Cancelled', cls: 'text-red-600 bg-red-50' },
};

function TrackingBar({ order }: { order: Order }) {
  const steps = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentIdx = steps.indexOf(order.orderStatus);

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div
            className={`h-2 w-8 rounded-full transition-colors ${
              i <= currentIdx && order.orderStatus !== 'cancelled'
                ? 'bg-teal-500'
                : 'bg-gray-200'
            }`}
          />
        </div>
      ))}
    </div>
  );
}

export function StoreOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useMyOrder(id ?? '');

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex h-48 items-center justify-center rounded-2xl bg-surface ring-1 ring-gray-100">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-200 border-t-teal-600" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center rounded-2xl bg-surface p-8 ring-1 ring-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Order not found or you don&apos;t have access.</p>
          <Link
            to="/store/orders"
            className="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-teal-800"
          >
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.orderStatus];

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in duration-500">
      {/* Back Link */}
      <div className="mb-4">
        <Link to="/store/orders" className="text-sm text-primary hover:text-teal-800 transition-colors">
          &larr; Back to My Orders
        </Link>
      </div>

      {/* Order Header */}
      <div className="rounded-2xl bg-surface p-6 ring-1 ring-gray-100 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Order ID</p>
            <p className="text-lg font-bold text-foreground">{order.orderId}</p>
            <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusConfig.cls}`}>
            {statusConfig.label}
          </span>
        </div>

        {/* Tracking */}
        <div className="mb-4">
          <TrackingBar order={order} />
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

      {/* Items */}
      <div className="rounded-2xl bg-surface p-6 ring-1 ring-gray-100 shadow-sm mb-6">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Items Ordered</h2>
        <div className="space-y-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300 text-xs">N/A</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">SKU: {item.sku}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
                  <span>Qty: {item.quantity} {item.unit}</span>
                  <span>Unit Price: {formatINR(item.unitPrice)}</span>
                  {item.gstPercent > 0 && <span>GST ({item.gstPercent}%): {formatINR(item.gstAmount)}</span>}
                </div>
              </div>
              <span className="flex-shrink-0 font-semibold text-foreground text-sm">
                {formatINR(item.total)}
              </span>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
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
          {order.discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Discount</dt>
              <dd className="text-green-600 font-semibold">-{formatINR(order.discount)}</dd>
            </div>
          )}
          <div className="border-t border-gray-100 pt-2 flex justify-between">
            <dt className="text-base font-bold text-foreground">Total</dt>
            <dd className="text-base font-bold text-foreground">{formatINR(order.grandTotal)}</dd>
          </div>
        </dl>
      </div>

      {/* Shipping Address */}
      <div className="rounded-2xl bg-surface p-6 ring-1 ring-gray-100 shadow-sm mb-6">
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

      {/* Notes */}
      {order.notes && (
        <div className="rounded-2xl bg-surface p-6 ring-1 ring-gray-100 shadow-sm mb-6">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">Order Notes</h2>
          <p className="text-sm text-gray-600">{order.notes}</p>
        </div>
      )}

      {order.cancelReason && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6 mb-6">
          <h2 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-2">Cancel Reason</h2>
          <p className="text-sm text-red-600">{order.cancelReason}</p>
        </div>
      )}

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
