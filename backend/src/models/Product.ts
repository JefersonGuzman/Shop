import { Schema, model, Document } from 'mongoose';

export interface ProductDocument extends Document {
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  specifications: Record<string, unknown>;
  images: string[];
  description: string;
  rating: number;
  reviews: number;
  tags: string[];
  sku: string;
  isActive: boolean;
}

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    specifications: { type: Schema.Types.Mixed, required: true },
    images: [{ type: String }],
    description: { type: String, required: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviews: { type: Number, default: 0 },
    tags: [{ type: String }],
    sku: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ isActive: 1 });

export const ProductModel = model<ProductDocument>('Product', productSchema);


