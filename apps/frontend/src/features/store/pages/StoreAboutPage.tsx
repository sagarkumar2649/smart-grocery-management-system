import { useStoreSettings } from '@/features/store/hooks/use-store-settings';

export function StoreAboutPage() {
  const { data: settingsRes } = useStoreSettings();
  const settings = settingsRes?.data;
  const storeName = settings?.storeName ?? 'Sagar General Store';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      {/* Hero */}
      <div className="rounded-3xl bg-gray-900 overflow-hidden mb-10">
        <div className="relative h-48 sm:h-64">
          {settings?.storeFront?.url ? (
            <img src={settings.storeFront.url} alt={storeName} className="h-full w-full object-cover opacity-50" />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-gray-900 to-teal-900" />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{storeName}</h1>
              <p className="mt-2 text-sm text-gray-300">Your Trusted Neighbourhood Grocery Store</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <section className="rounded-2xl bg-surface p-6 ring-1 ring-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-4">About Our Store</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {settings?.storeDescription || 'Sagar General Store is your trusted neighbourhood grocery store, serving the community with fresh produce, daily essentials, and a wide range of products at honest prices. We believe in quality, affordability, and personalized service that keeps our customers coming back.'}
            </p>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              From fresh vegetables and fruits to packaged goods, dairy products, and household essentials - we stock everything you need for your daily shopping under one roof.
            </p>
          </section>

          {/* Interior Gallery */}
          {settings?.interiorGallery && settings.interiorGallery.length > 0 && (
            <section className="rounded-2xl bg-surface p-6 ring-1 ring-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-4">Our Store</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {settings.interiorGallery.map((img) => (
                  <div key={img.publicId} className="aspect-video overflow-hidden rounded-xl bg-gray-50">
                    <img src={img.url} alt="Store interior" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar — Contact info */}
        <div className="space-y-6">
          {/* Contact card */}
          <div className="rounded-2xl bg-surface p-6 ring-1 ring-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Contact Information</h3>
            <ul className="space-y-4">
              {settings?.storeAddress && (
                <li className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Address</p>
                    <p className="text-sm text-gray-500 mt-0.5">{settings.storeAddress}</p>
                  </div>
                </li>
              )}
              {settings?.phoneNumber && (
                <li className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Phone</p>
                    <a href={`tel:${settings.phoneNumber}`} className="text-sm text-primary hover:text-teal-800 transition-colors">{settings.phoneNumber}</a>
                  </div>
                </li>
              )}
              {settings?.whatsappNumber && (
                <li className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-gray-500"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">WhatsApp</p>
                    <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:text-teal-800 transition-colors">Chat on WhatsApp</a>
                  </div>
                </li>
              )}
              {settings?.openingHours && (
                <li className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Opening Hours</p>
                    <p className="text-sm text-gray-500 mt-0.5">{settings.openingHours}</p>
                  </div>
                </li>
              )}
            </ul>
          </div>

          {/* Map placeholder */}
          <div className="rounded-2xl bg-surface p-6 ring-1 ring-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Location</h3>
            <div className="flex h-48 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-100">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <p className="text-xs text-gray-400">Map coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
