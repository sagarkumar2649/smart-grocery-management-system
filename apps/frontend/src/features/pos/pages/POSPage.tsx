import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectPOSItems,
  selectPOSItemCount,
  selectPOSBillDiscount,
  clearPOSState,
} from '@/store/slices/pos.slice';
import { usePOSProducts, useCalculateOrder } from '../hooks/use-pos';
import { POSHeader } from '../components/POSHeader';
import { ProductSearch } from '../components/ProductSearch';
import { ProductGrid } from '../components/ProductGrid';
import { POSCart } from '../components/POSCart';
import { PaymentModal } from '../components/PaymentModal';
import { InvoicePreview } from '../components/InvoicePreview';

export function POSPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectPOSItems);
  const itemCount = useAppSelector(selectPOSItemCount);
  const billDiscount = useAppSelector(selectPOSBillDiscount);
  const couponCode = useAppSelector((state) => state.pos.couponCode);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [completedInvoiceId, setCompletedInvoiceId] = useState<string | null>(null);
  const [backendGrandTotal, setBackendGrandTotal] = useState<number | null>(null);
  const [calculateError, setCalculateError] = useState<string | null>(null);

  const { data: productsData } = usePOSProducts(search, categoryFilter);
  const products = productsData?.data ?? [];
  const calculateOrder = useCalculateOrder();

  const searchRef = useRef<HTMLInputElement>(null);

  const handleClearAll = useCallback(() => {
    dispatch(clearPOSState());
    setShowPayment(false);
    setBackendGrandTotal(null);
    setCalculateError(null);
  }, [dispatch]);

  const handleNewTransaction = useCallback(() => {
    dispatch(clearPOSState());
    setCompletedInvoiceId(null);
    setBackendGrandTotal(null);
    setCalculateError(null);
    setSearch('');
    setTimeout(() => searchRef.current?.focus(), 50);
  }, [dispatch]);

  const handleBackToDashboard = useCallback(() => {
    dispatch(clearPOSState());
    navigate('/dashboard');
  }, [dispatch, navigate]);

  const handlePaymentComplete = useCallback((invoiceId: string) => {
    setShowPayment(false);
    setBackendGrandTotal(null);
    setCompletedInvoiceId(invoiceId);
  }, []);

  const handleAfterPrint = useCallback(() => {
    handleNewTransaction();
  }, [handleNewTransaction]);

  const handlePayClick = useCallback(() => {
    if (cartItems.length === 0) return;

    setCalculateError(null);

    calculateOrder.mutate(
      {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          ...(item.discount > 0 && { discount: item.discount, discountType: item.discountType }),
        })),
        ...(billDiscount > 0 && { discount: billDiscount, discountType: 'flat' as const }),
        ...(couponCode != null && { couponCode }),
      },
      {
        onSuccess: (res) => {
          setBackendGrandTotal(res.data.grandTotal);
          setShowPayment(true);
        },
        onError: (err: Error) => {
          setCalculateError(err.message || 'Failed to calculate order');
        },
      },
    );
  }, [cartItems, billDiscount, couponCode, calculateOrder]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F10') {
        e.preventDefault();
        if (cartItems.length > 0 && !showPayment && !completedInvoiceId) {
          handlePayClick();
        }
      }
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        handleNewTransaction();
      }
      if (e.altKey && e.key === 'Escape') {
        e.preventDefault();
        handleBackToDashboard();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cartItems.length, showPayment, completedInvoiceId, handlePayClick, handleNewTransaction, handleBackToDashboard]);

  if (completedInvoiceId) {
    return (
      <InvoicePreview
        invoiceId={completedInvoiceId}
        onNewTransaction={handleNewTransaction}
        onAfterPrint={handleAfterPrint}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-50">
      <POSHeader
        itemCount={itemCount}
        onNewTransaction={handleNewTransaction}
        onBackToDashboard={handleBackToDashboard}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Products Panel */}
        <div className="flex flex-1 flex-col overflow-hidden border-r border-gray-200">
          <div className="border-b border-gray-200 bg-surface p-3">
            <ProductSearch
              ref={searchRef}
              value={search}
              onChange={setSearch}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
            />
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <ProductGrid products={products} />
          </div>
        </div>

        {/* Right: Cart Panel */}
        <div className="flex w-[420px] flex-col bg-surface">
          <POSCart
            onPay={handlePayClick}
            onClearAll={handleClearAll}
          />
        </div>
      </div>

      {/* Calculate error display */}
      {calculateError && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {calculateError}
        </div>
      )}

      {showPayment && backendGrandTotal !== null && (
        <PaymentModal
          grandTotal={backendGrandTotal}
          onClose={() => setShowPayment(false)}
          onComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}
