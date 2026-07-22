import { useState, useRef } from 'react';
import { useStoreSettings, useUpdateStoreSettings } from '@/features/store/hooks/use-store-settings';

export function StoreSettingsPage() {
  const { data: settingsRes, isLoading } = useStoreSettings();
  const updateMutation = useUpdateStoreSettings();
  const settings = settingsRes?.data;

  const [form, setForm] = useState({
    storeName: '',
    storeDescription: '',
    storeAddress: '',
    phoneNumber: '',
    whatsappNumber: '',
    openingHours: '',
  });
  const [initialized, setInitialized] = useState(false);
  const [heroBannerFile, setHeroBannerFile] = useState<File | null>(null);
  const [storeFrontFile, setStoreFrontFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [interiorFiles, setInteriorFiles] = useState<File[]>([]);
  const [removeInterior, setRemoveInterior] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  const heroInputRef = useRef<HTMLInputElement>(null);
  const storeFrontInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const interiorInputRef = useRef<HTMLInputElement>(null);

  if (settings && !initialized) {
    setForm({
      storeName: settings.storeName,
      storeDescription: settings.storeDescription,
      storeAddress: settings.storeAddress,
      phoneNumber: settings.phoneNumber,
      whatsappNumber: settings.whatsappNumber,
      openingHours: settings.openingHours,
    });
    setInitialized(true);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('storeName', form.storeName);
    fd.append('storeDescription', form.storeDescription);
    fd.append('storeAddress', form.storeAddress);
    fd.append('phoneNumber', form.phoneNumber);
    fd.append('whatsappNumber', form.whatsappNumber);
    fd.append('openingHours', form.openingHours);

    if (heroBannerFile) fd.append('heroBanner', heroBannerFile);
    if (storeFrontFile) fd.append('storeFront', storeFrontFile);
    if (logoFile) fd.append('logo', logoFile);
    interiorFiles.forEach((f) => fd.append('interiorGallery', f));
    if (removeInterior.length > 0) {
      fd.append('removeInterior', removeInterior.join(','));
    }

    updateMutation.mutate(fd, {
      onSuccess: () => {
        setSuccessMsg('Store settings updated successfully');
        setHeroBannerFile(null);
        setStoreFrontFile(null);
        setLogoFile(null);
        setInteriorFiles([]);
        setRemoveInterior([]);
        setTimeout(() => setSuccessMsg(''), 3000);
      },
    });
  };

  const handleRemoveInterior = (publicId: string) => {
    setRemoveInterior((prev) => [...prev, publicId]);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Store Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Configure your store details, photos, and branding.</p>
      </div>

      {successMsg && (
        <div className="rounded-lg bg-teal-50 border border-teal-200 px-4 py-3 text-sm font-medium text-teal-800">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
            <input
              type="text"
              value={form.storeName}
              onChange={(e) => setForm((f) => ({ ...f, storeName: e.target.value }))}
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-foreground placeholder:text-gray-400 focus:border-primary focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
            <textarea
              rows={3}
              value={form.storeDescription}
              onChange={(e) => setForm((f) => ({ ...f, storeDescription: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-foreground placeholder:text-gray-400 focus:border-primary focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-foreground placeholder:text-gray-400 focus:border-primary focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
              <input
                type="tel"
                value={form.whatsappNumber}
                onChange={(e) => setForm((f) => ({ ...f, whatsappNumber: e.target.value }))}
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-foreground placeholder:text-gray-400 focus:border-primary focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
            <textarea
              rows={2}
              value={form.storeAddress}
              onChange={(e) => setForm((f) => ({ ...f, storeAddress: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-foreground placeholder:text-gray-400 focus:border-primary focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label>
            <input
              type="text"
              value={form.openingHours}
              onChange={(e) => setForm((f) => ({ ...f, openingHours: e.target.value }))}
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-foreground placeholder:text-gray-400 focus:border-primary focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              placeholder="e.g. Mon-Sun: 8:00 AM - 10:00 PM"
            />
          </div>
        </section>

        {/* Images */}
        <section className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-gray-200 space-y-6">
          <h2 className="text-lg font-semibold text-foreground">Photos & Branding</h2>

          {/* Hero Banner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hero Banner</label>
            <input ref={heroInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setHeroBannerFile(e.target.files?.[0] ?? null)} />
            <div className="flex items-start gap-4">
              <div className="h-32 w-64 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
                {heroBannerFile ? (
                  <img src={URL.createObjectURL(heroBannerFile)} alt="Preview" className="h-full w-full object-cover" />
                ) : settings?.heroBanner?.url ? (
                  <img src={settings.heroBanner.url} alt="Hero" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">No banner</div>
                )}
              </div>
              <button type="button" onClick={() => heroInputRef.current?.click()} className="rounded-lg border border-gray-200 bg-surface px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                {settings?.heroBanner?.url ? 'Change' : 'Upload'}
              </button>
            </div>
          </div>

          {/* Store Front */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Store Front Photo</label>
            <input ref={storeFrontInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setStoreFrontFile(e.target.files?.[0] ?? null)} />
            <div className="flex items-start gap-4">
              <div className="h-32 w-48 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
                {storeFrontFile ? (
                  <img src={URL.createObjectURL(storeFrontFile)} alt="Preview" className="h-full w-full object-cover" />
                ) : settings?.storeFront?.url ? (
                  <img src={settings.storeFront.url} alt="Store front" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">No photo</div>
                )}
              </div>
              <button type="button" onClick={() => storeFrontInputRef.current?.click()} className="rounded-lg border border-gray-200 bg-surface px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                {settings?.storeFront?.url ? 'Change' : 'Upload'}
              </button>
            </div>
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo</label>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
                {logoFile ? (
                  <img src={URL.createObjectURL(logoFile)} alt="Preview" className="h-full w-full object-cover" />
                ) : settings?.logo?.url ? (
                  <img src={settings.logo.url} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">No logo</div>
                )}
              </div>
              <button type="button" onClick={() => logoInputRef.current?.click()} className="rounded-lg border border-gray-200 bg-surface px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                {settings?.logo?.url ? 'Change' : 'Upload'}
              </button>
            </div>
          </div>

          {/* Interior Gallery */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interior Gallery</label>
            <input ref={interiorInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => setInteriorFiles(Array.from(e.target.files ?? []))} />
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 mb-3">
              {settings?.interiorGallery
                ?.filter((img) => !removeInterior.includes(img.publicId))
                .map((img) => (
                  <div key={img.publicId} className="relative group">
                    <img src={img.url} alt="Interior" className="h-24 w-full rounded-lg object-cover ring-1 ring-gray-200" />
                    <button
                      type="button"
                      onClick={() => handleRemoveInterior(img.publicId)}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-gray-900/70 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      x
                    </button>
                  </div>
                ))}
              {interiorFiles.map((f, i) => (
                <div key={i} className="relative">
                  <img src={URL.createObjectURL(f)} alt="New" className="h-24 w-full rounded-lg object-cover ring-1 ring-primary" />
                  <span className="absolute bottom-1 left-1 rounded bg-primary px-1 py-0.5 text-[10px] font-medium text-white">New</span>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => interiorInputRef.current?.click()} className="rounded-lg border border-gray-200 bg-surface px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Add Photos
            </button>
          </div>
        </section>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
