import mongoose, { Document, Schema, Types } from "mongoose";

export type ProductUnit =
  | "Piece"
  | "Kg"
  | "Gram"
  | "Litre"
  | "ml"
  | "Packet"
  | "Box"
  | "Bottle";

export const PRODUCT_UNITS: ProductUnit[] = [
  "Piece",
  "Kg",
  "Gram",
  "Litre",
  "ml",
  "Packet",
  "Box",
  "Bottle",
];

export const GST_RATES = [0, 5, 12, 18, 28] as const;
export type GstRate = (typeof GST_RATES)[number];

export interface IProduct extends Document {
  name: string;
  sku: string;
  barcode?: string;
  category: Types.ObjectId;
  brand?: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  gstPercent: GstRate;
  hsnCode?: string;
  stock: number;
  reservedStock: number;
  minimumStock: number;
  maximumStock: number;
  unit: ProductUnit;
  imageUrl?: string;
  imagePublicId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    barcode: {
      type: String,
      trim: true,
      sparse: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    // All prices stored in paise (integer) to avoid floating-point issues.
    // API layer converts to/from rupees.
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },
    gstPercent: {
      type: Number,
      enum: GST_RATES,
      default: 0,
    },
    hsnCode: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reservedStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minimumStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    maximumStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    unit: {
      type: String,
      enum: PRODUCT_UNITS,
      required: true,
      default: "Piece",
    },
    imageUrl: {
      type: String,
    },
    imagePublicId: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Text index for search across name, sku, brand, barcode
productSchema.index({ name: "text", sku: "text", brand: "text", barcode: "text" });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ stock: 1 });

export const Product = mongoose.model<IProduct>("Product", productSchema);
