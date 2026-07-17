import { Link } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { CustomerNavbar } from '@/shared/components/layout/CustomerNavbar';
import { useStoreSettings } from '@/features/store/hooks/use-store-settings';

export function StoreLayout() {
  const { data: settingsRes } = useStoreSettings();
  const settings = settingsRes?.data;
  const storeName = settings?.storeName ?? 'Sagar General Store';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <CustomerNavbar />
      <main className="min-h-[60vh]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Main footer */}
          <div className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                {settings?.logo?.url ? (
                  <img src={settings.logo.url} alt={storeName} className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-sm font-bold text-white">SS</span>
                  </div>
                )}
                <div>
                  <span className="block text-base font-bold text-white leading-tight">{storeName}</span>
                  <span className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider">Grocery & Essentials</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                {settings?.storeDescription || 'Your trusted neighbourhood grocery store for fresh produce and daily essentials.'}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h3>
              <ul className="space-y-2.5">
                <li><Link to="/store" className="text-sm text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/store/products" className="text-sm text-gray-400 hover:text-white transition-colors">Products</Link></li>
                <li><Link to="/store/categories" className="text-sm text-gray-400 hover:text-white transition-colors">Categories</Link></li>
                <li><Link to="/store/orders" className="text-sm text-gray-400 hover:text-white transition-colors">My Orders</Link></li>
                <li><Link to="/store/about" className="text-sm text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact Us</h3>
              <ul className="space-y-3">
                {settings?.storeAddress && (
                  <li className="flex items-start gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0 text-gray-500"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span className="text-sm text-gray-400">{settings.storeAddress}</span>
                  </li>
                )}
                {settings?.phoneNumber && (
                  <li className="flex items-center gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-gray-500"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>
                    <a href={`tel:${settings.phoneNumber}`} className="text-sm text-gray-400 hover:text-white transition-colors">{settings.phoneNumber}</a>
                  </li>
                )}
                {settings?.whatsappNumber && (
                  <li className="flex items-center gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 text-gray-500"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">WhatsApp</a>
                  </li>
                )}
                {settings?.openingHours && (
                  <li className="flex items-center gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-gray-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span className="text-sm text-gray-400">{settings.openingHours}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h3>
              <ul className="space-y-2.5">
                <li><span className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
                <li><span className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Return Policy</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 py-6">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-xs text-gray-500">
                &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
              </p>
              <p className="text-xs text-gray-600">
                Fresh Grocery &bull; Daily Essentials &bull; Fast Service
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
