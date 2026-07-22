# Settings Module — Implementation Plan

## Overview

Premium all-in-one admin Settings page at `/settings` with 10 tabbed sections.

**Two data backends:**
- **Store Information + Store Branding** → Existing backend `store-settings` API (Cloudinary + MongoDB)
- **All other 8 sections** → localStorage (no backend APIs)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SettingsPage                            │
│                                                              │
│  ┌─────────────┐  ┌───────────────────────────────────────┐  │
│  │  Tab Nav     │  │  Section Content                      │  │
│  │              │  │                                       │  │
│  │  Store Info  │──│→ StoreInformationSection               │  │
│  │  Branding    │──│→ StoreBrandingSection                  │  │
│  │  Payment     │──│→ PaymentSettingsSection               │  │
│  │  Shipping    │──│→ ShippingSettingsSection               │  │
│  │  Invoice     │──│→ InvoiceSettingsSection               │  │
│  │  Theme       │──│→ ThemeSection                         │  │
│  │  Security    │──│→ SecuritySection                      │  │
│  │  Notifs      │──│→ NotificationSettingsSection           │  │
│  │  Backup      │──│→ BackupSection                        │  │
│  │  About       │──│→ AboutSection                         │  │
│  └─────────────┘  └───────────────────────────────────────┘  │
│                                                              │
│  Data Sources:                                               │
│  ├─ useStoreSettings() → GET/PUT /api/v1/store-settings      │
│  │   (Cloudinary images + MongoDB text fields)               │
│  └─ useSettings() → localStorage                             │
│      (tax, invoice, shipping, theme, security, etc.)         │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend Changes (extend existing `store-settings` module)

### 1. Model — `store-settings.model.ts`

Add new fields to `IStoreSettings` interface and schema:

```ts
// Store Information extensions
storeEmail: string;          // default ''
city: string;                // default ''
state: string;               // default ''
pincode: string;             // default ''
gstNumber: string;           // default ''
panNumber: string;           // default ''
currency: string;            // default 'INR'
timezone: string;            // default 'Asia/Kolkata'
language: string;            // default 'en'

// Store Branding extensions
tagline: string;             // default ''
brandColor: string;          // default '#0F766E'
favicon?: IStoreImage;       // new image field
```

All new fields use `trim: true` and sensible defaults. `favicon` uses the existing `storeImageSchema`.

### 2. Controller — `store-settings.controller.ts`

Extend `updateStoreSettings` to:
- Read new text fields from `req.body` and apply them to settings
- Handle `files?.favicon?.[0]` upload (delete old if exists, set new `{url, publicId}`)
- Keep all existing logic unchanged

### 3. Routes — `store-settings.routes.ts`

Add `favicon` to the multer `.fields()` array:
```ts
{ name: 'favicon', maxCount: 1 },
```

No other route changes needed. Existing GET/PUT endpoints are reused.

---

## Frontend File Structure

```
apps/frontend/src/
├── features/settings/
│   ├── types/settings.types.ts              # Local settings interfaces (non-store sections)
│   ├── api/settings-storage.ts              # localStorage CRUD helpers
│   ├── hooks/use-settings.ts                # React Query hooks for localStorage settings
│   ├── store/settings.slice.ts              # Redux slice for active tab
│   ├── components/
│   │   ├── SettingsHeader.tsx               # Page header + Save/Reset + success toast
│   │   ├── SettingsTabNav.tsx               # Horizontal tab bar with icons
│   │   ├── SettingsSection.tsx              # Reusable section card wrapper
│   │   ├── FieldGroup.tsx                   # Reusable label + input + hint
│   │   ├── Toggle.tsx                       # Reusable toggle switch
│   │   ├── ImageUpload.tsx                  # Reusable image upload with preview (Cloudinary-backed)
│   │   ├── ColorPicker.tsx                  # Reusable color picker with swatches
│   │   ├── StoreInformationSection.tsx      # Text fields → store-settings API
│   │   ├── StoreBrandingSection.tsx         # Image uploads → store-settings API (FormData)
│   │   ├── PaymentSettingsSection.tsx       # GST + payment → localStorage
│   │   ├── ShippingSettingsSection.tsx      # Zones + rates → localStorage
│   │   ├── InvoiceSettingsSection.tsx       # Invoice config → localStorage
│   │   ├── ThemeSection.tsx                 # Dark mode + colors → localStorage + Redux
│   │   ├── SecuritySection.tsx              # 2FA + password → localStorage
│   │   ├── NotificationSettingsSection.tsx  # Toggles → localStorage
│   │   ├── BackupSection.tsx                # Export/Import → localStorage
│   │   └── AboutSection.tsx                 # Static info display
│   └── pages/
│       └── SettingsPage.tsx                 # Main page: tab nav + section renderer
```

**Modified files:**
```
apps/frontend/src/app/router.tsx              # Replace PlaceholderPage → SettingsPage
apps/frontend/src/store/index.ts              # Add settingsReducer
```

---

## TypeScript Types

### `settings.types.ts` — Local settings (localStorage-backed)

```ts
export interface PaymentSettings {
  gstEnabled: boolean;
  gstRate: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  taxInclusive: boolean;
  taxLabel: string;
  acceptedPayments: string[];
  upiId: string;
  defaultPaymentMethod: string;
}

export interface ShippingSettings {
  shippingEnabled: boolean;
  freeShippingThreshold: number;    // paise
  defaultShippingRate: number;      // paise
  shippingZones: ShippingZone[];
  maxWeightKg: number;
  codEnabled: boolean;
  maxCodAmount: number;             // paise
  estimatedDeliveryDays: number;
}

export interface ShippingZone {
  id: string;
  name: string;
  rate: number;
  estimatedDays: number;
  active: boolean;
}

export interface InvoiceSettings {
  invoicePrefix: string;
  invoiceStartNumber: number;
  showTaxBreakdown: boolean;
  showBankDetails: boolean;
  showQrCode: boolean;
  showSignature: boolean;
  bankName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankBranch: string;
  termsAndConditions: string;
  footerNote: string;
  invoiceTemplate: "standard" | "compact" | "detailed";
}

export interface ThemeSettings {
  darkMode: "light" | "dark" | "system";
  primaryColor: string;
  accentColor: string;
  sidebarStyle: "compact" | "comfortable" | "spacious";
  fontSize: "small" | "default" | "large";
  compactMode: boolean;
  borderRadius: "none" | "small" | "default" | "large";
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeoutMinutes: number;
  loginAlerts: boolean;
  passwordMinLength: number;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  lowStockAlert: boolean;
  newOrderAlert: boolean;
  dailyReport: boolean;
  weeklyReport: boolean;
  customerSignup: boolean;
  couponUsage: boolean;
  paymentReceived: boolean;
  stockThreshold: number;
  reportEmail: string;
}

export interface BackupSettings {
  lastBackupAt: string | null;
  autoBackupEnabled: boolean;
  autoBackupFrequency: "daily" | "weekly" | "monthly";
  backupIncludeImages: boolean;
}

// Root settings object stored in localStorage
export interface AppSettings {
  payment: PaymentSettings;
  shipping: ShippingSettings;
  invoice: InvoiceSettings;
  theme: ThemeSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  backup: BackupSettings;
}
```

### Store settings types — extend `store-settings-api.ts`

Add to existing `StoreSettings` interface in `store-settings-api.ts`:
```ts
// New text fields
storeEmail: string;
city: string;
state: string;
pincode: string;
gstNumber: string;
panNumber: string;
currency: string;
timezone: string;
language: string;

// New branding fields
tagline: string;
brandColor: string;
favicon?: StoreImage;
```

---

## localStorage Storage Layer (`settings-storage.ts`)

```ts
const STORAGE_KEY = "smart_inVENTORY_settings";

export const DEFAULT_SETTINGS: AppSettings = { ... };

export function getSettings(): AppSettings;
export function saveSettings(settings: AppSettings): void;
export function resetSettings(): void;
export function exportSettings(): Blob;           // JSON Blob for download
export function importSettings(json: string): AppSettings;  // parse + validate + save
```

---

## React Query Hooks

### `use-settings.ts` — localStorage settings

```ts
useSettings()         // query: reads from localStorage
useSaveSettings()     // mutation: writes to localStorage + invalidates
useResetSettings()    // mutation: resets to defaults
useExportSettings()   // returns () => void download function
useImportSettings()   // mutation: accepts JSON string
```

### Existing `use-store-settings.ts` — backend API (no changes needed)

```ts
useStoreSettings()          // query: GET /store-settings
useUpdateStoreSettings()    // mutation: PUT /store-settings (FormData)
```

---

## Redux Slice (`settings.slice.ts`)

```ts
type SettingsTab =
  | "store-info" | "branding" | "payment" | "shipping"
  | "invoice" | "theme" | "security" | "notifications"
  | "backup" | "about";

// State: { activeTab: SettingsTab }
// Actions: setActiveTab(tab)
```

---

## Component Design

### SettingsPage

**Two-phase data loading:**
1. `useStoreSettings()` → store info + branding (backend)
2. `useSettings()` → all other settings (localStorage)

**State management:**
- `editingStore` — cloned from store settings query (for dirty tracking)
- `editingSettings` — cloned from localStorage settings query
- `isDirty` — computed via JSON.stringify comparison
- `successMessage` — string, auto-clears after 3s

**Save behavior:**
- "Save" button triggers TWO saves if needed:
  1. `useUpdateStoreSettings().mutate(fd)` for store info/branding changes
  2. `useSaveSettings().mutate(settings)` for localStorage settings changes
- Shows success toast on completion

**Reset behavior:**
- Re-reads from both data sources, clears local edits

### SettingsTabNav

- 10 tabs with inline SVG icons
- Active: `bg-primary text-primary-foreground shadow-sm`
- Inactive: `text-muted-foreground hover:bg-muted hover:text-foreground`
- `overflow-x-auto` for mobile scroll

### Reusable Components

**SettingsSection**
```
Props: title, description, children, action?: ReactNode
Class: rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border
```

**FieldGroup**
```
Props: label, hint?, error?, required?, children
Wraps: <label> + input + optional hint text
```

**Toggle**
```
Props: checked, onChange, label, description?, disabled?
Renders: custom div-based toggle switch
```

**ImageUpload**
```
Props: value (url string), onChange (File), onRemove, label, hint?
Renders: dashed upload zone → preview image when set → remove button
Uses: hidden <input type="file" accept="image/jpeg,image/png,image/webp">
Preview: URL.createObjectURL(), cleaned up on unmount
Does NOT auto-upload — caller builds FormData on save
```

**ColorPicker**
```
Props: value (hex), onChange, label, swatches?: string[]
Renders: hex text input + color dot preview + grid of preset swatches
Default swatches: teal, blue, indigo, purple, rose, orange, emerald, slate
```

---

## Section Details

### StoreInformationSection
- Data source: `useStoreSettings()` (backend)
- Two-column grid of form fields:
  - Store Name (text, required)
  - Email (email)
  - Phone (tel)
  - Address (textarea)
  - City (text)
  - State (dropdown — Indian states)
  - Pincode (text)
  - GST Number (text, uppercase)
  - PAN Number (text, uppercase)
  - Currency (dropdown: INR ₹, USD $, EUR €, GBP £, AED د.إ)
  - Timezone (dropdown: Asia/Kolkata, America/New_York, etc.)
  - Language (dropdown: English, Hindi, etc.)
- All fields update `editingStore` state in parent

### StoreBrandingSection
- Data source: `useStoreSettings()` (backend)
- Store Logo: `ImageUpload` (1:1 aspect, 200x200 preview)
- Hero Banner: `ImageUpload` (16:9 aspect, 400x225 preview)
- Store Photos: `ImageUpload` with `multiple` (gallery grid, 150x150 previews)
  - Existing photos shown with delete button
  - New photos shown with "New" badge
- Favicon: `ImageUpload` (1:1, 64x64 preview)
- Tagline: text input
- Brand Color: `ColorPicker`
- On save: builds FormData with text fields + File objects, calls `useUpdateStoreSettings`

### PaymentSettingsSection
- Data source: `useSettings()` (localStorage)
- GST Enabled toggle
- When enabled: GST Rate input, auto-calculated CGST/SGST/IGST (editable)
- Tax Inclusive toggle
- Tax Label input (GST/VAT/Tax)
- Accepted Payment Methods: checkboxes (Cash, UPI, Card, Net Banking, Cheque)
- UPI ID text input
- Default Payment Method dropdown

### ShippingSettingsSection
- Data source: `useSettings()` (localStorage)
- Shipping Enabled toggle
- Free Shipping Threshold (₹ input)
- Default Flat Rate (₹ input)
- Shipping Zones table:
  - Columns: Name, Rate (₹), Est. Days, Active, Actions (Edit/Delete)
  - Add Zone button → inline form row
- Max Weight (kg) input
- COD Enabled toggle
- Max COD Amount (₹) input, shown when COD enabled
- Estimated Delivery Days input

### InvoiceSettingsSection
- Data source: `useSettings()` (localStorage)
- Invoice Prefix input (e.g. "INV-")
- Invoice Start Number input
- Invoice Template: radio (Standard / Compact / Detailed)
- Display toggles: Tax Breakdown, Bank Details, QR Code, Signature
- Bank Details section (shown when "Show Bank Details" on):
  - Bank Name, Account Number, IFSC, Branch
- Terms & Conditions textarea
- Footer Note textarea

### ThemeSection
- Data source: `useSettings()` (localStorage) + Redux `appUi.theme`
- Dark Mode: 3-segment control (Light / Dark / System)
  - Dispatches `setTheme()` to Redux + saves to localStorage
- Primary Color: `ColorPicker` with swatches
- Accent Color: `ColorPicker` with swatches
- Sidebar Style: radio (Compact / Comfortable / Spacious)
- Font Size: radio (Small / Default / Large)
- Compact Mode: toggle
- Border Radius: radio (None / Small / Default / Large)

### SecuritySection
- Data source: `useSettings()` (localStorage)
- Two-Factor Authentication: toggle with description
- Session Timeout: number input (5–480 minutes)
- Login Alerts: toggle
- Password Policy card:
  - Minimum Length: number input (6–32)
  - Require Uppercase: toggle
  - Require Numbers: toggle
  - Require Special Characters: toggle
- Max Login Attempts: number input
- Lockout Duration: number input (minutes)

### NotificationSettingsSection
- Data source: `useSettings()` (localStorage)
- Master toggle: Email Notifications
- Alert section (shown when master on):
  - Low Stock Alert toggle + stock threshold number input
  - New Order Alert toggle
  - Payment Received toggle
  - Customer Signup toggle
  - Coupon Usage toggle
- Reports section:
  - Daily Report toggle
  - Weekly Report toggle
- Report Email input

### BackupSection
- Data source: `useSettings()` (localStorage)
- Export Settings: button → downloads `smart-inventory-settings.json`
- Import Settings: file input → upload JSON → validates → saves → shows success
- Reset to Defaults: button → confirmation modal → resets
- Auto-Backup: toggle + frequency (Daily / Weekly / Monthly)
- Include Images in Backup: toggle
- Last Backup: timestamp display

### AboutSection
- Static content (no data source)
- App logo + name + version badge
- Environment badge (development/production)
- License: MIT
- Developer credit
- Tech stack: React 19, Vite 7, Express 5, MongoDB, Cloudinary
- System info: browser, screen, current URL

---

## Router Change

```diff
- { path: 'settings', element: <PlaceholderPage title="Settings" /> }
+ { path: 'settings', element: <SettingsPage /> }
```

## Store Change

```diff
+ import { settingsReducer } from '@/features/settings/store/settings.slice';
  reducer: {
    appUi: appUiReducer,
    cart: cartReducer,
    inventory: inventoryReducer,
    pos: posReducer,
+   settings: settingsReducer,
  }
```

---

## Implementation Order

### Phase 1: Backend extensions
1. Extend `store-settings.model.ts` — add new fields
2. Extend `store-settings.controller.ts` — handle new fields + favicon upload
3. Extend `store-settings.routes.ts` — add `favicon` to multer fields

### Phase 2: Frontend infrastructure
4. `settings.types.ts` — TypeScript interfaces for localStorage settings
5. Extend `store-settings-api.ts` — add new fields to `StoreSettings` interface
6. `settings-storage.ts` — localStorage CRUD + defaults
7. `use-settings.ts` — React Query hooks for localStorage
8. `settings.slice.ts` — Redux slice for active tab

### Phase 3: Reusable components
9. `SettingsSection.tsx`
10. `FieldGroup.tsx`
11. `Toggle.tsx`
12. `ImageUpload.tsx`
13. `ColorPicker.tsx`
14. `SettingsTabNav.tsx`
15. `SettingsHeader.tsx`

### Phase 4: Section components
16. `StoreInformationSection.tsx`
17. `StoreBrandingSection.tsx`
18. `PaymentSettingsSection.tsx`
19. `ShippingSettingsSection.tsx`
20. `InvoiceSettingsSection.tsx`
21. `ThemeSection.tsx`
22. `SecuritySection.tsx`
23. `NotificationSettingsSection.tsx`
24. `BackupSection.tsx`
25. `AboutSection.tsx`

### Phase 5: Assembly + verification
26. `SettingsPage.tsx` — assembles everything
27. Router + Redux store updates
28. TypeScript check
29. Backend starts without errors
30. Frontend dev server starts without errors

---

## Conventions Followed

- Tailwind v4 semantic tokens (`text-foreground`, `bg-surface`, `ring-border`, `text-muted-foreground`)
- `cn()` utility for conditional classes
- Animation: `animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out`
- Inline SVG icons (no icon library)
- Section cards: `rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border`
- Inputs: `h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all`
- Buttons: `rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800`
- Raw `fetch()` for multipart FormData (not the JSON-serializing HTTP client)
- Cloudinary: delete old image before replacing, non-fatal `.catch(() => {})`
- React Query for server data, Redux for UI state only
- File naming: kebab-case
