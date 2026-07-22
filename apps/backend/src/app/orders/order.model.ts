import mongoose, { Document, Schema, Types } from "mongoose";

export type OrderPaymentMethod = "cod" | "upi" | "razorpay" | "qr";
export type OrderPaymentStatus = "pending" | "pending_verification" | "paid" | "failed" | "refunded";
export type OrderStatus =
  | "placed"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  sku: string;
  imageUrl?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  mrp: number;
  gstPercent: number;
  gstAmount: number;
  total: number;
}

export interface IOrderAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IOrder extends Document {
  orderId: string;
  customer?: Types.ObjectId;
  clerkId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: IOrderAddress;
  items: IOrderItem[];
  subtotal: number;
  totalGST: number;
  deliveryCharges: number;
  discount: number;
  grandTotal: number;
  paymentMethod: OrderPaymentMethod;
  paymentStatus: OrderPaymentStatus;
  orderStatus: OrderStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  notes?: string;
  cancelReason?: string;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true, uppercase: true },
    imageUrl: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, required: true, default: "Piece" },
    unitPrice: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    gstPercent: { type: Number, required: true, min: 0, default: 0 },
    gstAmount: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderAddressSchema = new Schema<IOrderAddress>(
  {
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "AppUser",
    },
    clerkId: {
      type: String,
      required: true,
      index: true,
    },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true, lowercase: true },
    shippingAddress: { type: orderAddressSchema, required: true },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v: IOrderItem[]) => v.length > 0,
        message: "Order must have at least one item",
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    totalGST: { type: Number, required: true, min: 0, default: 0 },
    deliveryCharges: { type: Number, required: true, min: 0, default: 0 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["cod", "upi", "razorpay", "qr"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "pending_verification", "paid", "failed", "refunded"],
      required: true,
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      required: true,
      default: "placed",
    },
    razorpayOrderId: { type: String, trim: true },
    razorpayPaymentId: { type: String, trim: true },
    notes: { type: String, trim: true, maxlength: 1000 },
    cancelReason: { type: String, trim: true, maxlength: 500 },
    deliveredAt: { type: Date },
  },
  { timestamps: true },
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ clerkId: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>("Order", orderSchema);
