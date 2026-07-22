export interface ShippingZone {
  id: string;
  name: string;
  rate: number;
  estimatedDays: number;
  active: boolean;
}

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
  upiQrUrl: string;
  upiQrPublicId: string;
  defaultPaymentMethod: string;
}

export interface ShippingSettings {
  shippingEnabled: boolean;
  freeShippingThreshold: number;
  defaultShippingRate: number;
  shippingZones: ShippingZone[];
  maxWeightKg: number;
  codEnabled: boolean;
  maxCodAmount: number;
  estimatedDeliveryDays: number;
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
  invoiceTemplate: string;
}

export interface ThemeSettings {
  darkMode: string;
  primaryColor: string;
  accentColor: string;
  sidebarStyle: string;
  fontSize: string;
  compactMode: boolean;
  borderRadius: string;
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
  autoBackupFrequency: string;
  backupIncludeImages: boolean;
}

export interface PrinterSettings {
  printerEnabled: boolean;
  printerType: string;
  paperSize: string;
  autoPrint: boolean;
  printCopies: number;
  showLogoOnReceipt: boolean;
  receiptFontSize: string;
}

export interface CloudinarySettings {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadFolder: string;
  uploadPreset: string;
}

export interface AdminSettingsData {
  _id: string;
  payment: PaymentSettings;
  shipping: ShippingSettings;
  invoice: InvoiceSettings;
  theme: ThemeSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  backup: BackupSettings;
  printer: PrinterSettings;
  cloudinary: CloudinarySettings;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSettingsResponse {
  success: true;
  data: AdminSettingsData;
}

export interface StoreImage {
  url: string;
  publicId: string;
}

export interface StoreSettingsData {
  _id: string;
  storeName: string;
  storeDescription: string;
  storeAddress: string;
  phoneNumber: string;
  whatsappNumber: string;
  openingHours: string;
  storeEmail: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber: string;
  panNumber: string;
  currency: string;
  timezone: string;
  language: string;
  tagline: string;
  brandColor: string;
  logo?: StoreImage | null;
  heroBanner?: StoreImage | null;
  storeFront?: StoreImage | null;
  favicon?: StoreImage | null;
  interiorGallery: StoreImage[];
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettingsResponse {
  success: true;
  data: StoreSettingsData;
}
