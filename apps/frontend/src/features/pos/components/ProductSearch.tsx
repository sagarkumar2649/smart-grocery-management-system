import { forwardRef, useState, useCallback, useRef, useEffect } from 'react';
import { useCategories } from '@/features/products/hooks/use-products';
import { useAppDispatch } from '@/store/hooks';
import { addPOSItem } from '@/store/slices/pos.slice';
import { useBarcodeLookup } from '../hooks/use-pos';

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
}

export const ProductSearch = forwardRef<HTMLInputElement, ProductSearchProps>(
  function ProductSearch({ value, onChange, categoryFilter, onCategoryChange }, ref) {
    const dispatch = useAppDispatch();
    const { data: categoriesData } = useCategories();
    const categories = categoriesData?.data ?? [];
    const [barcodeInput, setBarcodeInput] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const barcodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const barcodeAccumulatorRef = useRef('');

    // Barcode scanner: accumulate rapid keystrokes (scanner sends characters fast)
    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        // Don't interfere if user is typing in a focused input (unless it's the barcode scanner)
        const active = document.activeElement;
        const isInput = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement;

        if (!isInput && e.key.length === 1 && !e.altKey && !e.ctrlKey && !e.metaKey) {
          barcodeAccumulatorRef.current += e.key;
          if (barcodeTimerRef.current) clearTimeout(barcodeTimerRef.current);
          barcodeTimerRef.current = setTimeout(() => {
            const code = barcodeAccumulatorRef.current;
            barcodeAccumulatorRef.current = '';
            if (code.length >= 6) {
              handleBarcodeScan(code);
            }
          }, 150);
        }
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }, []);

    const { data: barcodeResult, refetch: refetchBarcode } = useBarcodeLookup(
      barcodeInput,
    );

    const handleBarcodeScan = useCallback(
      (code: string) => {
        setBarcodeInput(code);
      },
      [],
    );

    // When barcode input changes, trigger lookup
    useEffect(() => {
      if (barcodeInput.length >= 4) {
        void refetchBarcode();
      }
    }, [barcodeInput, refetchBarcode]);

    // When barcode result arrives, add to cart
    useEffect(() => {
      if (barcodeResult?.data) {
        const p = barcodeResult.data;
        dispatch(
          addPOSItem({
            productId: p._id,
            name: p.name,
            sku: p.sku,
            ...(p.imageUrl !== undefined && { imageUrl: p.imageUrl }),
            unitPrice: p.sellingPrice,
            mrp: p.mrp,
            gstPercent: p.gstPercent,
            stock: p.stock,
            unit: p.unit,
          }),
        );
        setBarcodeInput('');
      }
    }, [barcodeResult, dispatch]);

    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={ref}
              type="text"
              placeholder="Search products (Alt+S)..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-9 pr-3 text-sm text-foreground placeholder-gray-400 transition focus:border-teal-500 focus:bg-surface focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Barcode scanner button */}
          <button
            onClick={() => setShowScanner(!showScanner)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              showScanner
                ? 'border-teal-500 bg-teal-50 text-teal-700'
                : 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
            title="Toggle barcode scanner"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Scan
          </button>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onCategoryChange('')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              !categoryFilter
                ? 'bg-teal-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onCategoryChange(categoryFilter === cat._id ? '' : cat._id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                categoryFilter === cat._id
                  ? 'bg-teal-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    );
  },
);
