import mongoose, { Document, Schema } from 'mongoose';

export type AppUserRole = 'ADMIN' | 'CUSTOMER';

export const ADMIN_EMAIL = 'ss5375492@gmail.com';

export interface IAppUser extends Document {
  clerkId: string;
  name: string;
  email: string;
  role: AppUserRole;
  createdAt: Date;
  updatedAt: Date;
}

const appUserSchema = new Schema<IAppUser>(
  {
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
      unique: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'CUSTOMER'] satisfies AppUserRole[],
      required: true,
    },
  },
  { timestamps: true },
);

export const AppUser = mongoose.model<IAppUser>('AppUser', appUserSchema);
