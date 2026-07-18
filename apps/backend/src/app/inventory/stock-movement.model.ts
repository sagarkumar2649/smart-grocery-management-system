import mongoose, { Document, Schema, Types } from "mongoose";

export type MovementType =
  | "purchase"
  | "sale"
  | "return"
  | "adjustment"
  | "damaged"
  | "expired"
  | "transfer"
  | "opening";

export const MOVEMENT_TYPES: MovementType[] = [
  "purchase",
  "sale",
  "return",
  "adjustment",
  "damaged",
  "expired",
  "transfer",
  "opening",
];

export interface IStockMovement extends Document {
  product: Types.ObjectId;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reference?: string;
  batchNumber?: string;
  expiryDate?: Date;
  notes?: string;
  unitCost?: number;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const stockMovementSchema = new Schema<IStockMovement>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: MOVEMENT_TYPES,
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
      min: 0,
    },
    newStock: {
      type: Number,
      required: true,
      min: 0,
    },
    reference: {
      type: String,
      trim: true,
    },
    batchNumber: {
      type: String,
      trim: true,
      index: true,
    },
    expiryDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    unitCost: {
      type: Number,
      min: 0,
    },
    createdBy: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

stockMovementSchema.index({ createdAt: -1 });
stockMovementSchema.index({ product: 1, createdAt: -1 });
stockMovementSchema.index({ type: 1, createdAt: -1 });

export const StockMovement = mongoose.model<IStockMovement>(
  "StockMovement",
  stockMovementSchema,
);
