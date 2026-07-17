import { Link } from 'react-router-dom';

export function StoreMyOrdersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-1 text-sm text-gray-500">Track and manage your orders</p>
      </div>
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
        <p className="text-sm text-gray-400">No orders yet</p>
        <Link to="/store/products" className="mt-1 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-800">
          Start Shopping
        </Link>
      </div>
    </div>
  );
}
