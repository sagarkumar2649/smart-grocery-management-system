import mongoose, { Document, Schema } from "mongoose";

export interface IAdminSettings extends Document {
  payment: {
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
  };
  shipping: {
    shippingEnabled: boolean;
    freeShippingThreshold: number;
    defaultShippingRate: number;
    shippingZones: {
      id: string;
      name: string;
      rate: number;
      estimatedDays: number;
      active: boolean;
    }[];
    maxWeightKg: number;
    codEnabled: boolean;
    maxCodAmount: number;
    estimatedDeliveryDays: number;
  };
  invoice: {
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
  };
  theme: {
    darkMode: string;
    primaryColor: string;
    accentColor: string;
    sidebarStyle: string;
    fontSize: string;
    compactMode: boolean;
    borderRadius: string;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeoutMinutes: number;
    loginAlerts: boolean;
    passwordMinLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxLoginAttempts: number;
    lockoutDurationMinutes: number;
  };
  notifications: {
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
  };
  backup: {
    lastBackupAt: Date | null;
    autoBackupEnabled: boolean;
    autoBackupFrequency: string;
    backupIncludeImages: boolean;
  };
  printer: {
    printerEnabled: boolean;
    printerType: string;
    paperSize: string;
    autoPrint: boolean;
    printCopies: number;
    showLogoOnReceipt: boolean;
    receiptFontSize: string;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    uploadFolder: string;
    uploadPreset: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const shippingZoneSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    rate: { type: Number, required: true, default: 0 },
    estimatedDays: { type: Number, required: true, default: 3 },
    active: { type: Boolean, default: true },
  },
  { _id: false },
);

const adminSettingsSchema = new Schema<IAdminSettings>(
  {
    payment: {
      gstEnabled: { type: Boolean, default: true },
      gstRate: { type: Number, default: 18 },
      cgstRate: { type: Number, default: 9 },
      sgstRate: { type: Number, default: 9 },
      igstRate: { type: Number, default: 18 },
      taxInclusive: { type: Boolean, default: false },
      taxLabel: { type: String, default: "GST", trim: true },
      acceptedPayments: {
        type: [String],
        default: ["cash", "upi"],
      },
      upiId: { type: String, default: "", trim: true },
      upiQrUrl: { type: String, default: "", trim: true },
      upiQrPublicId: { type: String, default: "", trim: true },
      defaultPaymentMethod: { type: String, default: "cash", trim: true },
    },
    shipping: {
      shippingEnabled: { type: Boolean, default: true },
      freeShippingThreshold: { type: Number, default: 50000 },
      defaultShippingRate: { type: Number, default: 5000 },
      shippingZones: { type: [shippingZoneSchema], default: [] },
      maxWeightKg: { type: Number, default: 30 },
      codEnabled: { type: Boolean, default: true },
      maxCodAmount: { type: Number, default: 100000 },
      estimatedDeliveryDays: { type: Number, default: 3 },
    },
    invoice: {
      invoicePrefix: { type: String, default: "INV-", trim: true },
      invoiceStartNumber: { type: Number, default: 1001 },
      showTaxBreakdown: { type: Boolean, default: true },
      showBankDetails: { type: Boolean, default: true },
      showQrCode: { type: Boolean, default: false },
      showSignature: { type: Boolean, default: false },
      bankName: { type: String, default: "", trim: true },
      bankAccountNumber: { type: String, default: "", trim: true },
      bankIfsc: { type: String, default: "", trim: true },
      bankBranch: { type: String, default: "", trim: true },
      termsAndConditions: { type: String, default: "", trim: true },
      footerNote: { type: String, default: "Thank you for shopping with us!", trim: true },
      invoiceTemplate: { type: String, default: "standard", trim: true },
    },
    theme: {
      darkMode: { type: String, default: "light", trim: true },
      primaryColor: { type: String, default: "#0F766E", trim: true },
      accentColor: { type: String, default: "#0D9488", trim: true },
      sidebarStyle: { type: String, default: "comfortable", trim: true },
      fontSize: { type: String, default: "default", trim: true },
      compactMode: { type: Boolean, default: false },
      borderRadius: { type: String, default: "default", trim: true },
    },
    security: {
      twoFactorEnabled: { type: Boolean, default: false },
      sessionTimeoutMinutes: { type: Number, default: 60 },
      loginAlerts: { type: Boolean, default: true },
      passwordMinLength: { type: Number, default: 8 },
      requireUppercase: { type: Boolean, default: true },
      requireNumbers: { type: Boolean, default: true },
      requireSpecialChars: { type: Boolean, default: false },
      maxLoginAttempts: { type: Number, default: 5 },
      lockoutDurationMinutes: { type: Number, default: 15 },
    },
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      lowStockAlert: { type: Boolean, default: true },
      newOrderAlert: { type: Boolean, default: true },
      dailyReport: { type: Boolean, default: false },
      weeklyReport: { type: Boolean, default: true },
      customerSignup: { type: Boolean, default: false },
      couponUsage: { type: Boolean, default: false },
      paymentReceived: { type: Boolean, default: true },
      stockThreshold: { type: Number, default: 10 },
      reportEmail: { type: String, default: "", trim: true },
    },
    backup: {
      lastBackupAt: { type: Date, default: null },
      autoBackupEnabled: { type: Boolean, default: false },
      autoBackupFrequency: { type: String, default: "weekly", trim: true },
      backupIncludeImages: { type: Boolean, default: false },
    },
    printer: {
      printerEnabled: { type: Boolean, default: false },
      printerType: { type: String, default: "thermal", trim: true },
      paperSize: { type: String, default: "80mm", trim: true },
      autoPrint: { type: Boolean, default: false },
      printCopies: { type: Number, default: 1 },
      showLogoOnReceipt: { type: Boolean, default: true },
      receiptFontSize: { type: String, default: "normal", trim: true },
    },
    cloudinary: {
      cloudName: { type: String, default: "", trim: true },
      apiKey: { type: String, default: "", trim: true },
      apiSecret: { type: String, default: "", trim: true },
      uploadFolder: { type: String, default: "uploads", trim: true },
      uploadPreset: { type: String, default: "", trim: true },
    },
  },
  { timestamps: true },
);

export const AdminSettings = mongoose.model<IAdminSettings>(
  "AdminSettings",
  adminSettingsSchema,
);
