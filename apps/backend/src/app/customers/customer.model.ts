import mongoose, { Document, Schema, Types } from "mongoose";

export type CustomerStatus = "active" | "blocked" | "inactive";

export const CUSTOMER_STATUSES: CustomerStatus[] = ["active", "blocked", "inactive"];

export interface IAddress {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface ICustomerProfile extends Document {
  user: Types.ObjectId;
  clerkId: string;
  name: string;
  email: string;
  phone?: string;
  status: CustomerStatus;
  loyaltyPoints: number;
  totalOrders: number;
  totalSpending: number;
  addresses: IAddress[];
  notes?: string;
  wishlist: Types.ObjectId[];
  lastActiveAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    label: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const customerProfileSchema = new Schema<ICustomerProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "AppUser",
      required: true,
      unique: true,
      index: true,
    },
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: CUSTOMER_STATUSES,
      default: "active",
      index: true,
    },
    loyaltyPoints: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalOrders: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalSpending: {
      type: Number,
      min: 0,
      default: 0,
    },
    addresses: {
      type: [addressSchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    lastActiveAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

customerProfileSchema.index({ name: "text", email: "text", phone: "text" });
customerProfileSchema.index({ status: 1 });
customerProfileSchema.index({ createdAt: -1 });
customerProfileSchema.index({ totalSpending: -1 });

export const CustomerProfile = mongoose.model<ICustomerProfile>(
  "CustomerProfile",
  customerProfileSchema,
);
