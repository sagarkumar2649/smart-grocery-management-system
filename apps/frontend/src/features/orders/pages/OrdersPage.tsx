import { useState } from 'react';
import { useAllOrders, useOrderDetail, useUpdateOrderStatus, useOrderStats } from '@/features/store/hooks/use-orders';
import { formatINRCompact } from '@/shared/lib/format-currency';
import type { OrderStatus } from '@/features/store/api/orders-api';

const STATUS_COLORS: Record<OrderStatus, string> = {
  placed: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-indigo-100 text-indigo-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-amber-100 text-amber-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
};

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState<OrderStatus | ''>('');
  const [cancelReason, setCancelReason] = useState('');

  const { data: statsRes } = useOrderStats();
  const { data, isLoading } = useAllOrders({
    page,
    limit: 20,
    status: statusFilter,
    paymentStatus: paymentFilter,
    search,
    startDate,
    endDate,
  });

  const { data: selectedOrder } = useOrderDetail(selectedId ?? '');
  const updateStatus = useUpdateOrderStatus();

  const orders = data?.data ?? [];
  const pagination = data?.meta?.pagination;
  const stats = statsRes?.data;

  const handleStatusUpdate = () => {
    if (!selectedId || !statusDraft) return;

    if (statusDraft === 'cancelled') {
      updateStatus.mutate(
        { id: selectedId, orderStatus: 'cancelled', cancelReason: cancelReason || 'No reason provided' },
        { onSuccess: () => { setStatusDraft(''); setCancelReason(''); } },
      );
    } else {
      updateStatus.mutate(
        { id: selectedId, orderStatus: statusDraft },
        { onSuccess: () => setStatusDraft('') },
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-sm text-gray-500">Manage customer orders and fulfillment</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: 'Total Orders', value: stats.totalOrders, color: 'text-foreground' },
            { label: 'Revenue', value: formatINRCompact(stats.totalRevenue), color: 'text-teal-700' },
            { label: 'Pending', value: stats.pendingOrders, color: 'text-amber-600' },
            { label: 'Delivered', value: stats.deliveredOrders, color: 'text-green-600' },
            { label: 'Cancelled', value: stats.cancelledOrders, color: 'text-red-600' },
            { label: 'Pending Payment', value: formatINRCompact(stats.pendingPayments), color: 'text-orange-600' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-surface p-4 ring-1 ring-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <p className={`mt-1 text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-surface p-4">
        <input
          type="text"
          placeholder="Search order #, name, phone..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="placed">Placed</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Payments</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-surface shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-gray-200 border-t-teal-600" />
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedId === order._id ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => {
                    setSelectedId(selectedId === order._id ? null : order._id);
                    setStatusDraft('');
                    setCancelReason('');
                  }}
                >
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{order.orderId}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-foreground">
                    {formatINRCompact(order.grandTotal)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[order.orderStatus]}`}>
                      {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_COLORS[order.paymentStatus]}`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs text-primary font-medium">
                      {selectedId === order._id ? 'Close' : 'View'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Expanded Order Detail */}
      {selectedId && selectedOrder && (
        <div className="rounded-xl border border-gray-200 bg-surface p-6 shadow-sm space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Order #{selectedOrder.orderId}</h3>
              <p className="text-sm text-gray-500">
                Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Status Update */}
              {VALID_TRANSITIONS[selectedOrder.orderStatus].length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    value={statusDraft}
                    onChange={(e) => setStatusDraft(e.target.value as OrderStatus)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="">Update Status</option>
                    {VALID_TRANSITIONS[selectedOrder.orderStatus].map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                  {statusDraft === 'cancelled' && (
                    <input
                      type="text"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Cancel reason..."
                    />
                  )}
                  {statusDraft && (
                    <button
                      type="button"
                      onClick={handleStatusUpdate}
                      disabled={updateStatus.isPending}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all ${
                        statusDraft === 'cancelled' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-teal-800'
                      } disabled:opacity-50`}
                    >
                      {updateStatus.isPending ? 'Saving...' : 'Update'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Customer & Shipping */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer</h4>
                <p className="text-sm font-medium text-foreground">{selectedOrder.customerName}</p>
                <p className="text-sm text-gray-600">{selectedOrder.customerPhone}</p>
                {selectedOrder.customerEmail && (
                  <p className="text-sm text-gray-600">{selectedOrder.customerEmail}</p>
                )}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Shipping Address</h4>
                <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.line1}</p>
                {selectedOrder.shippingAddress.line2 && (
                  <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.line2}</p>
                )}
                <p className="text-sm text-gray-600">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment</h4>
                <p className="text-sm text-gray-600">
                  Method: <span className="font-medium text-foreground uppercase">{selectedOrder.paymentMethod}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Status: <span className={`font-medium ${PAYMENT_COLORS[selectedOrder.paymentStatus]?.replace('bg-', 'text-').replace('100', '700') ?? ''}`}>
                    {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                  </span>
                </p>
              </div>
            </div>

            {/* Items & Totals */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-gray-400">{item.quantity}x</span>
                        <span className="truncate text-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium text-foreground">{formatINRCompact(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-foreground">{formatINRCompact(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.totalGST > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">GST</span>
                    <span className="text-foreground">{formatINRCompact(selectedOrder.totalGST)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery</span>
                  <span className={selectedOrder.deliveryCharges === 0 ? 'text-green-600 font-medium' : 'text-foreground'}>
                    {selectedOrder.deliveryCharges === 0 ? 'Free' : formatINRCompact(selectedOrder.deliveryCharges)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2">
                  <span className="font-bold text-foreground">Grand Total</span>
                  <span className="font-bold text-foreground">{formatINRCompact(selectedOrder.grandTotal)}</span>
                </div>
              </div>
              {selectedOrder.notes && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Notes</h4>
                  <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                </div>
              )}
              {selectedOrder.cancelReason && (
                <div>
                  <h4 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">Cancel Reason</h4>
                  <p className="text-sm text-red-600">{selectedOrder.cancelReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
