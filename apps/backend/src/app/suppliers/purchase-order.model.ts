import mongoose, { Document, Schema, Types } from "mongoose";

export type POStatus = "draft" | "pending" | "confirmed" | "received" | "cancelled";

export const PO_STATUSES: readonly POStatus[] = [
  "draft",
  "pending",
  "confirmed",
  "received",
  "cancelled",
];

export type PaymentMethod = "cash" | "upi" | "bank_transfer" | "cheque" | "card" | "other";

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  "cash",
  "upi",
  "bank_transfer",
  "cheque",
  "card",
  "other",
];

export interface IPOItem {
  product: Types.ObjectId;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface IPayment {
  amount: number;
  date: Date;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  createdBy: Types.ObjectId;
}

export interface IPurchaseOrder extends Document {
  orderNumber: string;
  supplier: Types.ObjectId;
  items: IPOItem[];
  orderDate: Date;
  expectedDeliveryDate?: Date;
  status: POStatus;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  payments: IPayment[];
  invoiceNumber?: string;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const poItemSchema = new Schema<IPOItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitCost: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const paymentSchema = new Schema<IPayment>(
  {
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    method: {
      type: String,
      enum: PAYMENT_METHODS as unknown as [string, ...string[]],
      required: true,
    },
    reference: { type: String, trim: true },
    notes: { type: String, trim: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "AppUser",
      required: true,
    },
  },
  { _id: true },
);

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
      index: true,
    },
    items: {
      type: [poItemSchema],
      required: true,
      validate: {
        validator: (v: IPOItem[]) => v.length > 0,
        message: "At least one item is required",
      },
    },
    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expectedDeliveryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: PO_STATUSES as unknown as [string, ...string[]],
      default: "draft",
      index: true,
    },
    subtotal: { type: Number, required: true, min: 0 },
    gstAmount: { type: Number, required: true, min: 0, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, required: true, min: 0, default: 0 },
    remainingBalance: { type: Number, required: true, min: 0, default: 0 },
    payments: {
      type: [paymentSchema],
      default: [],
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "AppUser",
      required: true,
    },
  },
  { timestamps: true },
);

purchaseOrderSchema.index({ supplier: 1, createdAt: -1 });
purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ createdAt: -1 });

export const PurchaseOrder = mongoose.model<IPurchaseOrder>(
  "PurchaseOrder",
  purchaseOrderSchema,
);
