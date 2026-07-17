import mongoose, { Document, Schema } from 'mongoose';

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
  logo?: IStoreImage;
  heroBanner?: IStoreImage;
  storeFront?: IStoreImage;
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
      default: 'Sagar General Store',
    },
    storeDescription: {
      type: String,
      trim: true,
      default: '',
    },
    storeAddress: {
      type: String,
      trim: true,
      default: '',
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },
    whatsappNumber: {
      type: String,
      trim: true,
      default: '',
    },
    openingHours: {
      type: String,
      trim: true,
      default: 'Mon-Sun: 8:00 AM - 10:00 PM',
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
    interiorGallery: {
      type: [storeImageSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export const StoreSettings = mongoose.model<IStoreSettings>(
  'StoreSettings',
  storeSettingsSchema,
);
