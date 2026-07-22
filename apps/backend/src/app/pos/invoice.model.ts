import mongoose, { Document, Schema, Types } from "mongoose";

export type PaymentMethod = "cash" | "upi" | "card" | "split";
export type InvoiceStatus = "completed" | "voided" | "refunded";
export type PaymentStatus = "paid" | "partial" | "pending";
export type DiscountType = "percentage" | "flat";

export interface IInvoiceItem {
  product: Types.ObjectId;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: DiscountType;
  gstPercent: number;
  gstAmount: number;
  total: number;
}

export interface IInvoicePayment {
  method: PaymentMethod;
  amount: number;
  reference?: string;
  upiTransactionId?: string;
  cardLast4?: string;
  cardType?: string;
}

export interface IGstBreakdown {
  cgst: number;
  sgst: number;
  igst: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  items: IInvoiceItem[];
  subtotal: number;
  totalItemDiscount: number;
  couponCode?: string;
  couponDiscount: number;
  totalGST: number;
  gstBreakdown: IGstBreakdown;
  grandTotal: number;
  payments: IInvoicePayment[];
  paymentStatus: PaymentStatus;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  cashierName: string;
  createdBy: Types.ObjectId;
  status: InvoiceStatus;
  voidReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceItemSchema = new Schema<IInvoiceItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true, uppercase: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    discountType: { type: String, enum: ["percentage", "flat"], required: true, default: "flat" },
    gstPercent: { type: Number, required: true, min: 0, default: 0 },
    gstAmount: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const invoicePaymentSchema = new Schema<IInvoicePayment>(
  {
    method: { type: String, enum: ["cash", "upi", "card", "split"], required: true },
    amount: { type: Number, required: true, min: 0 },
    reference: { type: String, trim: true },
    upiTransactionId: { type: String, trim: true },
    cardLast4: { type: String, trim: true, maxlength: 4 },
    cardType: { type: String, trim: true },
  },
  { _id: false },
);

const gstBreakdownSchema = new Schema<IGstBreakdown>(
  {
    cgst: { type: Number, required: true, min: 0, default: 0 },
    sgst: { type: Number, required: true, min: 0, default: 0 },
    igst: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false },
);

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [invoiceItemSchema],
      required: true,
      validate: {
        validator: (v: IInvoiceItem[]) => v.length > 0,
        message: "Invoice must have at least one item",
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    totalItemDiscount: { type: Number, required: true, min: 0, default: 0 },
    couponCode: { type: String, trim: true, uppercase: true },
    couponDiscount: { type: Number, required: true, min: 0, default: 0 },
    totalGST: { type: Number, required: true, min: 0, default: 0 },
    gstBreakdown: { type: gstBreakdownSchema, required: true },
    grandTotal: { type: Number, required: true, min: 0 },
    payments: {
      type: [invoicePaymentSchema],
      required: true,
      validate: {
        validator: (v: IInvoicePayment[]) => v.length > 0,
        message: "Invoice must have at least one payment",
      },
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "partial", "pending"],
      required: true,
      default: "pending",
    },
    customerName: { type: String, trim: true },
    customerPhone: { type: String, trim: true },
    customerEmail: { type: String, trim: true, lowercase: true },
    cashierName: { type: String, required: true, trim: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "AppUser",
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "voided", "refunded"],
      required: true,
      default: "completed",
    },
    voidReason: { type: String, trim: true, maxlength: 500 },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true },
);

invoiceSchema.index({ createdAt: -1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ createdBy: 1 });
invoiceSchema.index({ customerPhone: 1 });

export const Invoice = mongoose.model<IInvoice>("Invoice", invoiceSchema);
