import { Schema, model, Document } from 'mongoose';

export interface BrandDocument extends Document {
  name: string;
  slug: string;
  isActive: boolean;
}

const brandSchema = new Schema<BrandDocument>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

brandSchema.index({ name: 1 });
brandSchema.index({ slug: 1 });

export const BrandModel = model<BrandDocument>('Brand', brandSchema);




