import { useState } from 'react';
import { usePOSInvoice, useEmailInvoice, useWhatsAppLink } from '../hooks/use-pos';
import { getInvoicePDFUrl } from '../api/pos-api';
import { formatINR } from '@/shared/lib/format-currency';

interface InvoicePreviewProps {
  invoiceId: string;
  onNewTransaction: () => void;
  onAfterPrint: () => void;
}

export function InvoicePreview({ invoiceId, onNewTransaction, onAfterPrint }: InvoicePreviewProps) {
  const { data, isLoading } = usePOSInvoice(invoiceId);
  const emailInvoice = useEmailInvoice();
  const whatsappLink = useWhatsAppLink();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  if (isLoading || !data?.data) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  const invoice = data.data;

  const handlePrint = () => {
    window.print();
    setTimeout(() => onAfterPrint(), 500);
  };

  const handleDownloadPDF = () => {
    const url = getInvoicePDFUrl(invoiceId);
    window.open(url, '_blank');
  };

  const handleEmail = () => {
    if (!email) return;
    emailInvoice.mutate(
      { id: invoiceId, email },
      {
        onSuccess: () => {
          setEmailSent(true);
          setTimeout(() => { setShowEmailModal(false); setEmailSent(false); }, 2000);
        },
      },
    );
  };

  const handleWhatsApp = () => {
    whatsappLink.mutate(invoiceId, {
      onSuccess: (res) => {
        window.open(res.data.url, '_blank');
      },
    });
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-gray-50">
      {/* Action Bar (hidden on print) */}
      <div className="no-print flex items-center justify-between border-b border-gray-200 bg-surface px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
            Payment Successful
          </span>
          <span className="text-sm text-gray-500">{invoice.invoiceNumber}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            title="Print (Ctrl+P)"
          >
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            PDF
          </button>
          <button
            onClick={() => setShowEmailModal(true)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Email
          </button>
          <button
            onClick={handleWhatsApp}
            className="rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
          >
            WhatsApp
          </button>
          <button
            onClick={onNewTransaction}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700"
          >
            New Bill (Alt+N)
          </button>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-md rounded-lg bg-surface p-6 shadow-lg print:shadow-none">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">INVOICE</h1>
            <p className="text-sm text-gray-500">{invoice.invoiceNumber}</p>
            <p className="text-xs text-gray-400">
              {new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              {' '}
              {new Date(invoice.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </p>
          </div>

          <hr className="my-4 border-gray-200" />

          {/* Customer Info */}
          <div className="flex justify-between text-xs">
            <div>
              <p className="font-semibold text-gray-700">Bill To:</p>
              <p className="text-gray-500">{invoice.customerName || 'Walk-in Customer'}</p>
              {invoice.customerPhone && <p className="text-gray-400">{invoice.customerPhone}</p>}
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-700">Cashier:</p>
              <p className="text-gray-500">{invoice.cashierName}</p>
            </div>
          </div>

          {/* Items */}
          <table className="mt-4 w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="pb-1 font-medium">#</th>
                <th className="pb-1 font-medium">Item</th>
                <th className="pb-1 text-center font-medium">Qty</th>
                <th className="pb-1 text-right font-medium">Rate</th>
                <th className="pb-1 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-1.5 text-gray-400">{i + 1}</td>
                  <td className="py-1.5 text-foreground">{item.name}</td>
                  <td className="py-1.5 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-1.5 text-right text-gray-600">{formatINR(item.unitPrice)}</td>
                  <td className="py-1.5 text-right font-medium text-foreground">{formatINR(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-4 space-y-1 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{formatINR(invoice.subtotal)}</span>
            </div>
            {invoice.totalItemDiscount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Discount</span>
                <span>-{formatINR(invoice.totalItemDiscount)}</span>
              </div>
            )}
            {invoice.couponDiscount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Coupon ({invoice.couponCode})</span>
                <span>-{formatINR(invoice.couponDiscount)}</span>
              </div>
            )}
            {invoice.totalGST > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>GST</span>
                <span>{formatINR(invoice.totalGST)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-300 pt-2 text-sm font-bold text-foreground">
              <span>Grand Total</span>
              <span className="text-teal-700">{formatINR(invoice.grandTotal)}</span>
            </div>
          </div>

          {/* Payment Info */}
          <hr className="my-3 border-gray-200" />
          <div className="text-xs">
            <p className="mb-1 font-semibold text-gray-700">Payment</p>
            {invoice.payments.map((p, i) => (
              <p key={i} className="text-gray-500">
                {p.method.toUpperCase()}: {formatINR(p.amount)}
              </p>
            ))}
            <p className="mt-1 font-medium text-green-600">Status: {invoice.paymentStatus.toUpperCase()}</p>
          </div>

          <hr className="my-4 border-gray-200" />
          <p className="text-center text-xs text-gray-400">Thank you for your purchase!</p>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-surface p-6 shadow-xl">
            <h3 className="mb-3 text-lg font-bold text-foreground">Email Invoice</h3>
            {emailSent ? (
              <p className="text-sm text-green-600">Email sent successfully!</p>
            ) : (
              <>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEmail}
                    disabled={!email || emailInvoice.isPending}
                    className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50"
                  >
                    {emailInvoice.isPending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
