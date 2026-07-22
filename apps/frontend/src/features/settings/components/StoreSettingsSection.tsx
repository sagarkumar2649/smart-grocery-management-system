import { useRef, useState } from "react";
import { SettingsSection } from "./SettingsSection";
import { ImageUpload } from "./ImageUpload";
import { ColorPicker } from "./ColorPicker";
import type { StoreSettingsData } from "../types/settings.types";

interface StoreSettingsSectionProps {
  settings: StoreSettingsData;
  onTextChange: (updates: Partial<StoreSettingsData>) => void;
  onImageChange: (field: string, file: File) => void;
  onImageRemove: (field: string) => void;
  onGalleryRemove: (publicId: string) => void;
  onGalleryAdd: (files: FileList) => void;
}

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all";

const selectClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand",
  "Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya",
  "Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu",
  "Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
];

const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
];

const TIMEZONES = [
  "Asia/Kolkata","Asia/Dubai","America/New_York",
  "America/Los_Angeles","Europe/London","Asia/Singapore","Asia/Tokyo",
];

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "bn", name: "Bengali" },
  { code: "mr", name: "Marathi" },
  { code: "gu", name: "Gujarati" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
];

export function StoreSettingsSection({
  settings,
  onTextChange,
  onImageChange,
  onImageRemove,
  onGalleryRemove,
  onGalleryAdd,
}: StoreSettingsSectionProps) {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setPendingFiles((prev) => [...prev, ...Array.from(files)]);
      onGalleryAdd(files);
    }
  };

  const set = (field: keyof StoreSettingsData, value: string) =>
    onTextChange({ [field]: value } as Partial<StoreSettingsData>);

  return (
    <div className="space-y-6">
      {/* ── Store Details ─────────────────────────────────────────── */}
      <SettingsSection
        title="Store Details"
        description="Basic information about your store"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Store Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => set("storeName", e.target.value)}
              className={inputClass}
              placeholder="Enter store name"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              type="email"
              value={settings.storeEmail}
              onChange={(e) => set("storeEmail", e.target.value)}
              className={inputClass}
              placeholder="store@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Phone
            </label>
            <input
              type="tel"
              value={settings.phoneNumber}
              onChange={(e) => set("phoneNumber", e.target.value)}
              className={inputClass}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Address
            </label>
            <textarea
              rows={2}
              value={settings.storeAddress}
              onChange={(e) => set("storeAddress", e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              placeholder="Street address"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              City
            </label>
            <input
              type="text"
              value={settings.city}
              onChange={(e) => set("city", e.target.value)}
              className={inputClass}
              placeholder="City"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              State
            </label>
            <select
              value={settings.state}
              onChange={(e) => set("state", e.target.value)}
              className={selectClass}
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Pincode
            </label>
            <input
              type="text"
              value={settings.pincode}
              onChange={(e) => set("pincode", e.target.value)}
              className={inputClass}
              placeholder="400001"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Currency
            </label>
            <select
              value={settings.currency}
              onChange={(e) => set("currency", e.target.value)}
              className={selectClass}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              GST Number
            </label>
            <input
              type="text"
              value={settings.gstNumber}
              onChange={(e) => set("gstNumber", e.target.value.toUpperCase())}
              className={inputClass}
              placeholder="22AAAAA0000A1Z5"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              PAN Number
            </label>
            <input
              type="text"
              value={settings.panNumber}
              onChange={(e) => set("panNumber", e.target.value.toUpperCase())}
              className={inputClass}
              placeholder="AAAAA0000A"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => set("timezone", e.target.value)}
              className={selectClass}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => set("language", e.target.value)}
              className={selectClass}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Tagline
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              className={inputClass}
              placeholder="Your store's tagline"
            />
          </div>
        </div>
      </SettingsSection>

      {/* ── Branding ──────────────────────────────────────────────── */}
      <SettingsSection
        title="Branding"
        description="Logo, banner, photos, and brand identity"
      >
        <div className="space-y-8">
          <div className="flex items-start gap-8 flex-wrap">
            <ImageUpload
              value={settings.logo?.url}
              onChange={(f) => onImageChange("logo", f)}
              onRemove={() => onImageRemove("logo")}
              label="Store Logo"
              hint="Square image, at least 200x200px"
              previewClassName="h-24 w-24"
            />

            <ImageUpload
              value={settings.heroBanner?.url}
              onChange={(f) => onImageChange("heroBanner", f)}
              onRemove={() => onImageRemove("heroBanner")}
              label="Hero Banner"
              hint="Wide image, 1600x900px recommended"
              previewClassName="h-32 w-64"
            />

            <ImageUpload
              value={settings.favicon?.url}
              onChange={(f) => onImageChange("favicon", f)}
              onRemove={() => onImageRemove("favicon")}
              label="Favicon"
              hint="Square image, 64x64px"
              previewClassName="h-12 w-12"
            />
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-foreground">
              Store Photos
            </p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 mb-3">
              {settings.interiorGallery.map((img) => (
                <div key={img.publicId} className="relative group">
                  <img
                    src={img.url}
                    alt="Store"
                    className="h-24 w-full rounded-lg object-cover ring-1 ring-border"
                  />
                  <button
                    type="button"
                    onClick={() => onGalleryRemove(img.publicId)}
                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900/70 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {pendingFiles.map((f, i) => (
                <div key={`pending-${i}`} className="relative">
                  <img
                    src={URL.createObjectURL(f)}
                    alt="New"
                    className="h-24 w-full rounded-lg object-cover ring-1 ring-primary"
                  />
                  <span className="absolute bottom-1 left-1 rounded bg-primary px-1 py-0.5 text-[10px] font-medium text-white">
                    New
                  </span>
                </div>
              ))}
            </div>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleGallerySelect}
            />
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Add Photos
            </button>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload up to 10 photos. JPEG, PNG, or WebP.
            </p>
          </div>

          <ColorPicker
            value={settings.brandColor}
            onChange={(color) => onTextChange({ brandColor: color })}
            label="Brand Color"
          />
        </div>
      </SettingsSection>
    </div>
  );
}
