import { useState } from 'react';
import { useAllOrders, useOrderDetail, useUpdateOrderStatus, useVerifyPayment, useOrderStats, useUpdateAdminInfo } from '@/features/store/hooks/use-orders';
import { formatINR, formatINRCompact } from '@/shared/lib/format-currency';
import type { OrderStatus, Order } from '@/features/store/api/orders-api';

const STATUS_COLORS: Record<OrderStatus, string> = {
  placed: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-indigo-100 text-indigo-700',
  processing: 'bg-purple-100 text-purple-700',
  packed: 'bg-cyan-100 text-cyan-700',
  shipped: 'bg-amber-100 text-amber-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  pending_verification: 'bg-orange-100 text-orange-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['packed', 'cancelled'],
  packed: ['shipped', 'out_for_delivery', 'cancelled'],
  shipped: ['out_for_delivery', 'delivered'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
};

const TIMELINE_STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'placed', label: 'Order Placed' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'processing', label: 'Processing' },
  { status: 'packed', label: 'Packed' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'out_for_delivery', label: 'Out for Delivery' },
  { status: 'delivered', label: 'Delivered' },
];

function StatusTimeline({ order }: { order: Order }) {
  const cancelledIdx = order.orderStatus === 'cancelled'
    ? (order.statusHistory ?? []).findIndex((h) => h.status === 'cancelled')
    : -1;
  const currentIdx = TIMELINE_STEPS.findIndex((s) => s.status === order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <div className="space-y-0">
      {TIMELINE_STEPS.map((step, i) => {
        const isCompleted = !isCancelled && currentIdx >= i;
        const isCurrent = !isCancelled && currentIdx === i;
        const historyEntry = order.statusHistory.find((h) => h.status === step.status);

        return (
          <div key={step.status} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-teal-500 text-white ring-2 ring-teal-200'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? '✓' : i + 1}
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div className={`w-0.5 h-6 ${isCompleted && !isCurrent ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
            <div className="pb-4">
              <p className={`text-sm font-medium ${isCompleted ? 'text-foreground' : 'text-gray-400'}`}>
                {step.label}
              </p>
              {historyEntry && (
                <p className="text-xs text-gray-400">
                  {new Date(historyEntry.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {historyEntry.note && <span className="ml-1 text-gray-500">— {historyEntry.note}</span>}
                </p>
              )}
            </div>
          </div>
        );
      })}
      {isCancelled && (
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">✕</div>
          </div>
          <div>
            <p className="text-sm font-medium text-red-600">Cancelled</p>
            {cancelledIdx >= 0 && order.statusHistory && (
              <p className="text-xs text-gray-400">
                {new Date(order.statusHistory[cancelledIdx]!.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
            {order.cancelReason && (
              <p className="text-xs text-red-500 mt-0.5">Reason: {order.cancelReason}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [statusNote, setStatusNote] = useState('');
  const [adminTab, setAdminTab] = useState<'status' | 'tracking' | 'notes'>('status');

  const [trackingDraft, setTrackingDraft] = useState('');
  const [deliveryPartnerDraft, setDeliveryPartnerDraft] = useState('');
  const [estimatedDateDraft, setEstimatedDateDraft] = useState('');
  const [internalNotesDraft, setInternalNotesDraft] = useState('');
  const [adminInfoDirty, setAdminInfoDirty] = useState(false);

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
  const verifyPayment = useVerifyPayment();
  const updateAdminInfo = useUpdateAdminInfo();

  const orders = data?.data ?? [];
  const pagination = data?.meta?.pagination;
  const stats = statsRes;

  const handleStatusUpdate = () => {
    if (!selectedId || !statusDraft) return;

    const base = { id: selectedId, orderStatus: statusDraft as OrderStatus };
    const notePart = statusNote.trim() ? { note: statusNote } : {};

    if (statusDraft === 'cancelled') {
      updateStatus.mutate(
        { ...base, cancelReason: cancelReason || 'No reason provided', ...notePart },
        { onSuccess: () => { setStatusDraft(''); setCancelReason(''); setStatusNote(''); } },
      );
    } else {
      updateStatus.mutate(
        { ...base, ...notePart },
        { onSuccess: () => { setStatusDraft(''); setStatusNote(''); } },
      );
    }
  };

  const handleAdminInfoSave = () => {
    if (!selectedId || !adminInfoDirty) return;
    const data: Record<string, string> = {};
    if (trackingDraft.trim()) data.trackingNumber = trackingDraft;
    if (deliveryPartnerDraft.trim()) data.deliveryPartner = deliveryPartnerDraft;
    if (estimatedDateDraft) data.estimatedDeliveryDate = estimatedDateDraft;
    if (internalNotesDraft.trim()) data.internalNotes = internalNotesDraft;
    updateAdminInfo.mutate(
      { id: selectedId, data },
      { onSuccess: () => setAdminInfoDirty(false) },
    );
  };

  const populateAdminFields = (order: Order) => {
    setTrackingDraft(order.trackingNumber ?? '');
    setDeliveryPartnerDraft(order.deliveryPartner ?? '');
    setEstimatedDateDraft(order.estimatedDeliveryDate ? order.estimatedDeliveryDate.split('T')[0] ?? '' : '');
    setInternalNotesDraft(order.internalNotes ?? '');
    setAdminInfoDirty(false);
    setAdminTab('status');
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
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Payments</option>
          <option value="pending">Pending</option>
          <option value="pending_verification">Pending Verification</option>
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
                    if (selectedId === order._id) {
                      setSelectedId(null);
                    } else {
                      setSelectedId(order._id);
                      setStatusDraft('');
                      setCancelReason('');
                      setStatusNote('');
                      populateAdminFields(order);
                    }
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
                      {STATUS_LABELS[order.orderStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_COLORS[order.paymentStatus]}`}>
                      {order.paymentStatus === 'pending_verification' ? 'Pending Verification' :
                       order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
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
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Order #{selectedOrder.orderId}</h3>
              <p className="text-sm text-gray-500">
                Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[selectedOrder.orderStatus]}`}>
                {STATUS_LABELS[selectedOrder.orderStatus]}
              </span>
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${PAYMENT_COLORS[selectedOrder.paymentStatus]}`}>
                {selectedOrder.paymentStatus === 'pending_verification' ? 'Pending Verification' :
                 selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
              </span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column: Customer, Shipping, Payment */}
            <div className="space-y-5">
              {/* Customer Info */}
              <div className="rounded-lg border border-gray-100 p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium text-foreground">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium text-foreground">{selectedOrder.customerPhone}</span>
                  </div>
                  {selectedOrder.customerEmail && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email</span>
                      <span className="font-medium text-foreground">{selectedOrder.customerEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="rounded-lg border border-gray-100 p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Shipping Address</h4>
                <p className="text-sm text-foreground">{selectedOrder.shippingAddress.line1}</p>
                {selectedOrder.shippingAddress.line2 && (
                  <p className="text-sm text-foreground">{selectedOrder.shippingAddress.line2}</p>
                )}
                <p className="text-sm text-foreground">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                </p>
              </div>

              {/* Payment */}
              <div className="rounded-lg border border-gray-100 p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Method</span>
                    <span className="font-medium text-foreground uppercase">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-medium ${
                      selectedOrder.paymentStatus === 'paid' ? 'text-green-600' :
                      selectedOrder.paymentStatus === 'pending' ? 'text-amber-600' :
                      selectedOrder.paymentStatus === 'pending_verification' ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {selectedOrder.paymentStatus === 'pending_verification' ? 'Pending Verification' :
                       selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
                {selectedOrder.paymentStatus === 'pending_verification' && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => verifyPayment.mutate({ id: selectedOrder._id, action: 'approve' })}
                      disabled={verifyPayment.isPending}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-green-700 disabled:opacity-50"
                    >
                      {verifyPayment.isPending ? '...' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      onClick={() => verifyPayment.mutate({ id: selectedOrder._id, action: 'reject' })}
                      disabled={verifyPayment.isPending}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50"
                    >
                      {verifyPayment.isPending ? '...' : 'Reject'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Middle Column: Items & Totals */}
            <div className="space-y-5">
              {/* Items */}
              <div className="rounded-lg border border-gray-100 p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Items Ordered</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-300 text-[10px]">N/A</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                        <div className="flex gap-3 mt-0.5 text-xs text-gray-500">
                          <span>Qty: {item.quantity}</span>
                          <span>@ {formatINR(item.unitPrice)}</span>
                        </div>
                      </div>
                      <span className="flex-shrink-0 text-sm font-semibold text-foreground">
                        {formatINR(item.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="rounded-lg border border-gray-100 p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-foreground">{formatINR(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.totalGST > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">GST</span>
                      <span className="text-foreground">{formatINR(selectedOrder.totalGST)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery</span>
                    <span className={selectedOrder.deliveryCharges === 0 ? 'text-green-600 font-medium' : 'text-foreground'}>
                      {selectedOrder.deliveryCharges === 0 ? 'Free' : formatINR(selectedOrder.deliveryCharges)}
                    </span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Discount</span>
                      <span className="text-green-600 font-medium">-{formatINR(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-100 pt-2">
                    <span className="font-bold text-foreground">Grand Total</span>
                    <span className="font-bold text-foreground">{formatINR(selectedOrder.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="rounded-lg border border-gray-100 p-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Customer Notes</h4>
                  <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                </div>
              )}
              {selectedOrder.cancelReason && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Cancel Reason</h4>
                  <p className="text-sm text-red-600">{selectedOrder.cancelReason}</p>
                </div>
              )}
            </div>

            {/* Right Column: Timeline & Admin Actions */}
            <div className="space-y-5">
              {/* Status Timeline */}
              <div className="rounded-lg border border-gray-100 p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Timeline</h4>
                <StatusTimeline order={selectedOrder} />
              </div>

              {/* Admin Action Tabs */}
              <div className="rounded-lg border border-gray-100 p-4">
                <div className="flex gap-1 mb-4 border-b border-gray-100">
                  {([
                    { key: 'status' as const, label: 'Status' },
                    { key: 'tracking' as const, label: 'Tracking' },
                    { key: 'notes' as const, label: 'Notes' },
                  ]).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setAdminTab(tab.key)}
                      className={`px-3 py-2 text-xs font-semibold transition-colors ${
                        adminTab === tab.key
                          ? 'text-primary border-b-2 border-primary -mb-px'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Status Tab */}
                {adminTab === 'status' && (
                  <div className="space-y-3">
                    {VALID_TRANSITIONS[selectedOrder.orderStatus].length > 0 ? (
                      <>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Update Status</label>
                          <select
                            value={statusDraft}
                            onChange={(e) => setStatusDraft(e.target.value as OrderStatus)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                          >
                            <option value="">Select new status</option>
                            {VALID_TRANSITIONS[selectedOrder.orderStatus].map((s) => (
                              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                            ))}
                          </select>
                        </div>
                        {statusDraft === 'cancelled' && (
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Cancel Reason *</label>
                            <input
                              type="text"
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                              placeholder="Reason for cancellation..."
                            />
                          </div>
                        )}
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Note (optional)</label>
                          <input
                            type="text"
                            value={statusNote}
                            onChange={(e) => setStatusNote(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            placeholder="Add a note about this status change..."
                          />
                        </div>
                        {statusDraft && (
                          <button
                            type="button"
                            onClick={handleStatusUpdate}
                            disabled={updateStatus.isPending || (statusDraft === 'cancelled' && !cancelReason.trim())}
                            className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all ${
                              statusDraft === 'cancelled' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-teal-800'
                            } disabled:opacity-50`}
                          >
                            {updateStatus.isPending ? 'Updating...' : `Update to ${STATUS_LABELS[statusDraft]}`}
                          </button>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-2">This order has reached its final status.</p>
                    )}
                  </div>
                )}

                {/* Tracking Tab */}
                {adminTab === 'tracking' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Tracking Number</label>
                      <input
                        type="text"
                        value={trackingDraft}
                        onChange={(e) => { setTrackingDraft(e.target.value); setAdminInfoDirty(true); }}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        placeholder="e.g. DTDC123456789"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Delivery Partner</label>
                      <input
                        type="text"
                        value={deliveryPartnerDraft}
                        onChange={(e) => { setDeliveryPartnerDraft(e.target.value); setAdminInfoDirty(true); }}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        placeholder="e.g. Delhivery, BlueDart"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Estimated Delivery Date</label>
                      <input
                        type="date"
                        value={estimatedDateDraft}
                        onChange={(e) => { setEstimatedDateDraft(e.target.value); setAdminInfoDirty(true); }}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>
                    {adminInfoDirty && (
                      <button
                        type="button"
                        onClick={handleAdminInfoSave}
                        disabled={updateAdminInfo.isPending}
                        className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-teal-800 disabled:opacity-50"
                      >
                        {updateAdminInfo.isPending ? 'Saving...' : 'Save Tracking Info'}
                      </button>
                    )}
                    {selectedOrder.trackingNumber && (
                      <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500 space-y-1">
                        {selectedOrder.trackingNumber && <p><span className="font-medium text-gray-600">Tracking:</span> {selectedOrder.trackingNumber}</p>}
                        {selectedOrder.deliveryPartner && <p><span className="font-medium text-gray-600">Partner:</span> {selectedOrder.deliveryPartner}</p>}
                        {selectedOrder.estimatedDeliveryDate && <p><span className="font-medium text-gray-600">Est. Delivery:</span> {new Date(selectedOrder.estimatedDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                      </div>
                    )}
                  </div>
                )}

                {/* Notes Tab */}
                {adminTab === 'notes' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Internal Notes</label>
                      <textarea
                        value={internalNotesDraft}
                        onChange={(e) => { setInternalNotesDraft(e.target.value); setAdminInfoDirty(true); }}
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none"
                        placeholder="Add internal notes about this order (not visible to customer)..."
                      />
                    </div>
                    {adminInfoDirty && (
                      <button
                        type="button"
                        onClick={handleAdminInfoSave}
                        disabled={updateAdminInfo.isPending}
                        className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-teal-800 disabled:opacity-50"
                      >
                        {updateAdminInfo.isPending ? 'Saving...' : 'Save Notes'}
                      </button>
                    )}
                    {selectedOrder.internalNotes && !adminInfoDirty && (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                        <p className="text-xs font-semibold text-amber-700 mb-1">Saved Notes</p>
                        <p className="text-sm text-amber-800 whitespace-pre-wrap">{selectedOrder.internalNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
