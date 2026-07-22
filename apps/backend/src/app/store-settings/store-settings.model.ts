import mongoose, { Document, Schema } from "mongoose";

export interface IStoreImage {
  url: string;
  publicId: string;
}

export interface IStoreSettings extends Document {
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
  logo?: IStoreImage;
  heroBanner?: IStoreImage;
  storeFront?: IStoreImage;
  favicon?: IStoreImage;
  interiorGallery: IStoreImage[];
  createdAt: Date;
  updatedAt: Date;
}

const storeImageSchema = new Schema<IStoreImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false },
);

const storeSettingsSchema = new Schema<IStoreSettings>(
  {
    storeName: {
      type: String,
      required: true,
      trim: true,
      default: "Sagar General Store",
    },
    storeDescription: {
      type: String,
      trim: true,
      default: "",
    },
    storeAddress: {
      type: String,
      trim: true,
      default: "",
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: "",
    },
    whatsappNumber: {
      type: String,
      trim: true,
      default: "",
    },
    openingHours: {
      type: String,
      trim: true,
      default: "Mon-Sun: 8:00 AM - 10:00 PM",
    },
    storeEmail: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    pincode: {
      type: String,
      trim: true,
      default: "",
    },
    gstNumber: {
      type: String,
      trim: true,
      default: "",
    },
    panNumber: {
      type: String,
      trim: true,
      default: "",
    },
    currency: {
      type: String,
      trim: true,
      default: "INR",
    },
    timezone: {
      type: String,
      trim: true,
      default: "Asia/Kolkata",
    },
    language: {
      type: String,
      trim: true,
      default: "en",
    },
    tagline: {
      type: String,
      trim: true,
      default: "",
    },
    brandColor: {
      type: String,
      trim: true,
      default: "#0F766E",
    },
    logo: {
      type: storeImageSchema,
      default: undefined,
    },
    heroBanner: {
      type: storeImageSchema,
      default: undefined,
    },
    storeFront: {
      type: storeImageSchema,
      default: undefined,
    },
    favicon: {
      type: storeImageSchema,
      default: undefined,
    },
    interiorGallery: {
      type: [storeImageSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export const StoreSettings = mongoose.model<IStoreSettings>(
  "StoreSettings",
  storeSettingsSchema,
);
