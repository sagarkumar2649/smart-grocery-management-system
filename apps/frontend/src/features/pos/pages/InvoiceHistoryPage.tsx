import { useState } from 'react';
import { usePOSInvoices, useVoidInvoice } from '../hooks/use-pos';
import { getInvoicePDFUrl } from '../api/pos-api';
import { formatINR } from '@/shared/lib/format-currency';

export function InvoiceHistoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [voidId, setVoidId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState('');

  const { data, isLoading } = usePOSInvoices({
    page,
    limit: 20,
    status: statusFilter,
    search,
    startDate,
    endDate,
  });

  const voidInvoice = useVoidInvoice();

  const invoices = data?.data ?? [];
  const pagination = data?.meta?.pagination;

  const handleVoid = () => {
    if (!voidId || !voidReason) return;
    voidInvoice.mutate(
      { id: voidId, reason: voidReason },
      {
        onSuccess: () => {
          setVoidId(null);
          setVoidReason('');
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Invoice History</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-surface p-4">
        <input
          type="text"
          placeholder="Search invoice #, name, phone..."
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
          <option value="completed">Completed</option>
          <option value="voided">Voided</option>
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

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3">Invoice #</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  No invoices found
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-teal-700">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(inv.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{inv.customerName || 'Walk-in'}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.items.length}</td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">{formatINR(inv.grandTotal)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500 capitalize">
                      {inv.payments.map((p) => p.method).join(' + ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        inv.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <a
                        href={getInvoicePDFUrl(inv._id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                      >
                        PDF
                      </a>
                      <button
                        onClick={() => setExpandedId(expandedId === inv._id ? null : inv._id)}
                        className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                      >
                        {expandedId === inv._id ? 'Hide' : 'View'}
                      </button>
                      {inv.status === 'completed' && (
                        <button
                          onClick={() => setVoidId(inv._id)}
                          className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          Void
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Expanded detail */}
        {expandedId && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            {(() => {
              const inv = invoices.find((i) => i._id === expandedId);
              if (!inv) return null;
              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="font-medium text-gray-500">Cashier</p>
                      <p className="text-gray-700">{inv.cashierName}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Subtotal</p>
                      <p className="text-gray-700">{formatINR(inv.subtotal)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">GST</p>
                      <p className="text-gray-700">{formatINR(inv.totalGST)}</p>
                    </div>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="pb-1">#</th>
                        <th className="pb-1">Item</th>
                        <th className="pb-1 text-center">Qty</th>
                        <th className="pb-1 text-right">Rate</th>
                        <th className="pb-1 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inv.items.map((item, i) => (
                        <tr key={i} className="border-t border-gray-200">
                          <td className="py-1 text-gray-400">{i + 1}</td>
                          <td className="py-1 text-gray-700">{item.name}</td>
                          <td className="py-1 text-center text-gray-600">{item.quantity}</td>
                          <td className="py-1 text-right text-gray-600">{formatINR(item.unitPrice)}</td>
                          <td className="py-1 text-right font-medium text-foreground">{formatINR(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {inv.voidReason && (
                    <p className="text-xs text-red-500">Void reason: {inv.voidReason}</p>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page >= pagination.pages}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Void Modal */}
      {voidId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-surface p-6 shadow-xl">
            <h3 className="mb-3 text-lg font-bold text-foreground">Void Invoice</h3>
            <p className="mb-3 text-sm text-gray-500">This will restore all stock. Enter a reason:</p>
            <textarea
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder="Reason for voiding..."
              className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setVoidId(null); setVoidReason(''); }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVoid}
                disabled={!voidReason || voidInvoice.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {voidInvoice.isPending ? 'Voiding...' : 'Void Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
