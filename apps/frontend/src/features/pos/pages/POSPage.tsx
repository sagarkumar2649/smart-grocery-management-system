import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectPOSItems,
  selectPOSGrandTotal,
  selectPOSItemCount,
  clearPOSState,
} from '@/store/slices/pos.slice';
import { usePOSProducts } from '../hooks/use-pos';
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
  const grandTotal = useAppSelector(selectPOSGrandTotal);
  const itemCount = useAppSelector(selectPOSItemCount);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [completedInvoiceId, setCompletedInvoiceId] = useState<string | null>(null);

  const { data: productsData } = usePOSProducts(search, categoryFilter);
  const products = productsData?.data ?? [];

  const searchRef = useRef<HTMLInputElement>(null);

  const handleNewTransaction = useCallback(() => {
    dispatch(clearPOSState());
    setCompletedInvoiceId(null);
    setSearch('');
    setTimeout(() => searchRef.current?.focus(), 50);
  }, [dispatch]);

  const handleBackToDashboard = useCallback(() => {
    dispatch(clearPOSState());
    navigate('/dashboard');
  }, [dispatch, navigate]);

  const handlePaymentComplete = useCallback((invoiceId: string) => {
    setShowPayment(false);
    setCompletedInvoiceId(invoiceId);
  }, []);

  const handleAfterPrint = useCallback(() => {
    handleNewTransaction();
  }, [handleNewTransaction]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F10') {
        e.preventDefault();
        if (cartItems.length > 0 && !showPayment && !completedInvoiceId) {
          setShowPayment(true);
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
  }, [cartItems.length, showPayment, completedInvoiceId, handleNewTransaction, handleBackToDashboard]);

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
            onPay={() => {
              if (cartItems.length > 0) setShowPayment(true);
            }}
          />
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          grandTotal={grandTotal}
          onClose={() => setShowPayment(false)}
          onComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}
