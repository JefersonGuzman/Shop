import { Schema, model, Document } from 'mongoose';

export interface BrandDocument extends Document {
  name: string;
  slug: string;
  logo?: string; // URL o data URI
  isActive: boolean;
}

const brandSchema = new Schema<BrandDocument>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true },
    logo: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

brandSchema.index({ name: 1 });
brandSchema.index({ slug: 1 });

// Generar slug si no viene o cambia el nombre
brandSchema.pre('save', function (next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

export const BrandModel = model<BrandDocument>('Brand', brandSchema);




