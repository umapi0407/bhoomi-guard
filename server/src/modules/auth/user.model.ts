import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'CITIZEN' | 'FIELD_OFFICER' | 'DISTRICT_OFFICER' | 'ADMIN';
  regionCode?: string;
  phone?: string;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['CITIZEN', 'FIELD_OFFICER', 'DISTRICT_OFFICER', 'ADMIN'],
      default: 'CITIZEN',
    },
    regionCode: { type: String },
    phone: { type: String },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
