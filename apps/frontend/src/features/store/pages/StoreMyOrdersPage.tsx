import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyOrders, useCancelOrder } from '@/features/store/hooks/use-orders';
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

const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
);
const TruckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
);
const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
);
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const ShoppingBagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);

const STATUS_CONFIG: Record<OrderStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  placed: { label: 'Order Placed', cls: 'text-blue-600 bg-blue-50', icon: <ClockIcon /> },
  confirmed: { label: 'Confirmed', cls: 'text-indigo-600 bg-indigo-50', icon: <CheckCircleIcon /> },
  processing: { label: 'Processing', cls: 'text-purple-600 bg-purple-50', icon: <ClockIcon /> },
  shipped: { label: 'Shipped', cls: 'text-amber-600 bg-amber-50', icon: <TruckIcon /> },
  delivered: { label: 'Delivered', cls: 'text-green-600 bg-green-50', icon: <CheckCircleIcon /> },
  cancelled: { label: 'Cancelled', cls: 'text-red-600 bg-red-50', icon: <PackageIcon /> },
};

const FILTER_TABS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Placed', value: 'placed' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

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

export function StoreMyOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const { data: ordersRes, isLoading } = useMyOrders({ page, limit: 10, status: statusFilter });
  const cancelOrderMutation = useCancelOrder();

  const orders = ordersRes?.data ?? [];
  const pagination = ordersRes?.meta?.pagination;

  const handleCancel = async () => {
    if (!cancelId || !cancelReason.trim()) return;
    try {
      await cancelOrderMutation.mutateAsync({ id: cancelId, reason: cancelReason.trim() });
      setCancelId(null);
      setCancelReason('');
    } catch {
      // error handled by mutation
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        <p className="mt-1 text-sm text-gray-500">Track and manage your orders</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={`flex-shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              statusFilter === tab.value
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface text-gray-600 ring-1 ring-gray-100 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl bg-surface ring-1 ring-gray-100">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-200 border-t-teal-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-surface ring-1 ring-gray-100 shadow-sm gap-3">
          <div className="text-gray-200">
            <ShoppingBagIcon />
          </div>
          <p className="text-sm text-gray-400">No orders found</p>
          <p className="text-xs text-gray-300">
            {statusFilter ? 'Try a different filter' : 'Your order history will appear here'}
          </p>
          <Link
            to="/store/products"
            className="mt-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-800"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.orderStatus];
            const isExpanded = expandedId === order._id;
            const isCancelling = cancelId === order._id;

            return (
              <div
                key={order._id}
                className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-gray-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Order #{order.orderId}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.cls}`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                </div>

                {/* Tracking */}
                <div className="mb-3">
                  <TrackingBar order={order} />
                </div>

                {/* Items Preview */}
                <div className="border-t border-gray-100 pt-3">
                  {order.items.slice(0, isExpanded ? undefined : 2).map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <p className="text-sm text-gray-700">
                        {item.name} <span className="text-gray-400">x{item.quantity}</span>
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {formatINR(item.total)}
                      </p>
                    </div>
                  ))}
                  {!isExpanded && order.items.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setExpandedId(order._id)}
                      className="text-xs text-primary hover:text-teal-800 font-medium mt-1"
                    >
                      +{order.items.length - 2} more items
                    </button>
                  )}
                  {isExpanded && order.items.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setExpandedId(null)}
                      className="text-xs text-primary hover:text-teal-800 font-medium mt-1"
                    >
                      Show less
                    </button>
                  )}
                </div>

                <div className="border-t border-gray-100 mt-2 pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">Total</span>
                    <span className="text-sm font-bold text-foreground">{formatINR(order.grandTotal)}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      order.paymentStatus === 'paid' ? 'bg-green-50 text-green-600' :
                      order.paymentStatus === 'pending' ? 'bg-amber-50 text-amber-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {order.paymentStatus === 'cod' ? 'COD' : order.paymentMethod === 'cod' ? 'COD' : order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {['placed', 'confirmed'].includes(order.orderStatus) && (
                      <button
                        type="button"
                        onClick={() => setCancelId(isCancelling ? null : order._id)}
                        className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                      >
                        {isCancelling ? 'Close' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Cancel Form */}
                {isCancelling && (
                  <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
                    <input
                      type="text"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-foreground placeholder:text-gray-400 focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="Reason for cancellation..."
                    />
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={!cancelReason.trim() || cancelOrderMutation.isPending}
                      className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50"
                    >
                      {cancelOrderMutation.isPending ? 'Cancelling...' : 'Confirm Cancel'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-all"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {pagination.pages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
