import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectPOSItemCount } from '@/store/slices/pos.slice';

interface POSHeaderProps {
  itemCount: number;
  onNewTransaction: () => void;
  onBackToDashboard: () => void;
}

export function POSHeader({ onNewTransaction, onBackToDashboard }: POSHeaderProps) {
  const itemCount = useAppSelector(selectPOSItemCount);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-teal-700 px-4 py-2 text-white shadow-md">
      <div className="flex items-center gap-4">
        <button
          onClick={onBackToDashboard}
          className="rounded-lg bg-teal-800/50 px-3 py-1.5 text-sm font-medium transition hover:bg-teal-800/80"
          title="Back to Dashboard (Alt+Esc)"
        >
          ← Dashboard
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">POS</span>
          <span className="rounded-full bg-teal-800/60 px-2 py-0.5 text-xs font-medium">
            Billing
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div className="text-teal-100">
          <span className="text-xs uppercase tracking-wider text-teal-300">Items</span>{' '}
          <span className="font-semibold">{itemCount}</span>
        </div>
        <div className="text-teal-100">
          <span className="text-xs uppercase tracking-wider text-teal-300">Time</span>{' '}
          <span className="font-medium tabular-nums">
            {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </span>
        </div>
        <button
          onClick={onNewTransaction}
          className="rounded-lg bg-surface/10 px-3 py-1.5 text-sm font-medium transition hover:bg-surface/20"
          title="New Transaction (Alt+N)"
        >
          New Bill
        </button>
      </div>
    </header>
  );
}
