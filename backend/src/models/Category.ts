import { Schema, model, Document, Types } from 'mongoose';

export interface CategoryDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  color?: string;
  parentCategory?: Types.ObjectId;
  subcategories?: Types.ObjectId[];
  level: number;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  seoKeywords?: string[];
}

const categorySchema = new Schema<CategoryDocument>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true, 
      unique: true 
    },
      slug: { 
    type: String, 
    required: false, 
    trim: true, 
    unique: true,
    lowercase: true 
  },
    description: { 
      type: String, 
      trim: true 
    },
    image: { 
      type: String, 
      trim: true 
    },
    icon: { 
      type: String, 
      trim: true 
    },
    color: { 
      type: String, 
      trim: true,
      default: '#6B7280' 
    },
    parentCategory: { 
      type: Schema.Types.ObjectId, 
      ref: 'Category',
      default: null 
    },
    subcategories: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Category' 
    }],
    level: { 
      type: Number, 
      default: 0,
      min: 0 
    },
    sortOrder: { 
      type: Number, 
      default: 0 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    isFeatured: { 
      type: Boolean, 
      default: false 
    },
    metaTitle: { 
      type: String, 
      trim: true 
    },
    metaDescription: { 
      type: String, 
      trim: true 
    },
    seoKeywords: [{ 
      type: String, 
      trim: true 
    }],
  },
  { timestamps: true }
);

// Índices para optimizar consultas (name y slug ya son unique)
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ isFeatured: 1 });
categorySchema.index({ 'name': 'text', 'description': 'text' });

// Middleware para generar slug automáticamente
categorySchema.pre('save', function(next) {
  // Generar slug si no existe o si el nombre cambió
  if (!this.slug || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Establecer nivel basado en categoría padre
  if (this.parentCategory) {
    this.level = 1;
  } else {
    this.level = 0;
  }
  
  next();
});

// Método estático para obtener categorías con subcategorías
categorySchema.statics.getCategoryTree = async function() {
  const categories = await this.find({ isActive: true })
    .populate('subcategories')
    .sort({ sortOrder: 1, name: 1 });
  
  const rootCategories = categories.filter((cat: any) => !cat.parentCategory);
  
  const buildTree = (cats: any[]): any[] => {
    return cats.map((cat: any) => {
      const subcats = categories.filter((sub: any) => 
        sub.parentCategory && sub.parentCategory.toString() === cat._id.toString()
      );
      return {
        ...cat.toObject(),
        subcategories: buildTree(subcats)
      };
    });
  };
  
  return buildTree(rootCategories);
};

// Método para obtener todas las subcategorías
categorySchema.methods.getAllSubcategories = async function() {
  const subcategories: any[] = [];
  
  const getSubs = async (categoryId: Types.ObjectId) => {
    const subs = await (this.constructor as any).find({ 
      parentCategory: categoryId, 
      isActive: true 
    });
    
    for (const sub of subs) {
      subcategories.push(sub);
      await getSubs(sub._id);
    }
  };
  
  await getSubs(this._id);
  return subcategories;
};

export const CategoryModel = model<CategoryDocument>('Category', categorySchema);




