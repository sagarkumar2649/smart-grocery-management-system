import { SettingsSection } from "./SettingsSection";
import type { StoreSettingsData } from "../types/settings.types";

interface StoreInformationSectionProps {
  settings: StoreSettingsData;
  onChange: (updates: Partial<StoreSettingsData>) => void;
}

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all";

const selectClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
];

const TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Asia/Singapore",
  "Asia/Tokyo",
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

export function StoreInformationSection({
  settings,
  onChange,
}: StoreInformationSectionProps) {
  const set = (field: keyof StoreSettingsData, value: string) =>
    onChange({ [field]: value } as Partial<StoreSettingsData>);

  return (
    <SettingsSection
      title="Store Information"
      description="Basic details about your store"
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
              <option key={s} value={s}>
                {s}
              </option>
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
              <option key={tz} value={tz}>
                {tz}
              </option>
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
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </SettingsSection>
  );
}
