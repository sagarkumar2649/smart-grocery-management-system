import mongoose, { Document, Schema } from "mongoose";

export type SupplierStatus = "active" | "inactive" | "blacklisted";

export const SUPPLIER_STATUSES: SupplierStatus[] = [
  "active",
  "inactive",
  "blacklisted",
];

export type PaymentTerm =
  | "COD"
  | "Net 15"
  | "Net 30"
  | "Net 45"
  | "Net 60"
  | "Net 90"
  | "Advance"
  | "Custom";

export const PAYMENT_TERMS: PaymentTerm[] = [
  "COD",
  "Net 15",
  "Net 30",
  "Net 45",
  "Net 60",
  "Net 90",
  "Advance",
  "Custom",
];

export interface ISupplierAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface ISupplier extends Document {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstNumber?: string;
  address: ISupplierAddress;
  paymentTerms: PaymentTerm;
  customPaymentDays?: number;
  notes?: string;
  status: SupplierStatus;
  totalOrders: number;
  totalPurchases: number;
  pendingPayments: number;
  paidAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const supplierAddressSchema = new Schema<ISupplierAddress>(
  {
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const supplierSchema = new Schema<ISupplier>(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 20,
    },
    address: {
      type: supplierAddressSchema,
      required: true,
    },
    paymentTerms: {
      type: String,
      enum: PAYMENT_TERMS as unknown as [string, ...string[]],
      default: "Net 30",
    },
    customPaymentDays: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: SUPPLIER_STATUSES as unknown as [string, ...string[]],
      default: "active",
    },
    totalOrders: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalPurchases: {
      type: Number,
      min: 0,
      default: 0,
    },
    pendingPayments: {
      type: Number,
      min: 0,
      default: 0,
    },
    paidAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true },
);

supplierSchema.index({ companyName: "text", contactPerson: "text", email: "text", phone: "text" });
supplierSchema.index({ status: 1 });
supplierSchema.index({ createdAt: -1 });
supplierSchema.index({ totalPurchases: -1 });

export const Supplier = mongoose.model<ISupplier>(
  "Supplier",
  supplierSchema,
);
