import { ProductModel } from '../models/Product';
import type { ProductDocument } from '../models/Product';
import type { ProductQueryDTO, ProductCreateDTO, ProductUpdateDTO } from '../schemas/product';

export class ProductService {
  static async getProducts(query: ProductQueryDTO): Promise<{
    products: ProductDocument[];
    total: number;
  }> {
    const {
      brand,
      category,
      minPrice,
      maxPrice,
      inStock,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc',
      search,
    } = query;

    const filter: Record<string, unknown> = { isActive: true };
    if (brand) filter.brand = brand;
    if (category) filter.category = category;
    if (typeof inStock === 'boolean') filter.stock = inStock ? { $gt: 0 } : { $gte: 0 };
    if (minPrice || maxPrice) filter.price = { ...(minPrice ? { $gte: minPrice } : {}), ...(maxPrice ? { $lte: maxPrice } : {}) };
    if (search) filter.$text = { $search: search } as never;

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [products, total] = await Promise.all([
      ProductModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      ProductModel.countDocuments(filter),
    ]);

    return { products: products as unknown as ProductDocument[], total };
  }

  static async createProduct(data: ProductCreateDTO): Promise<ProductDocument> {
    console.log('🔎 [Products] checking SKU:', data.sku);
    const exists = await ProductModel.findOne({ sku: data.sku });
    if (exists) throw new Error('SKU duplicado');
    console.log('📝 [Products] data to save:', JSON.stringify(data));
    const doc = await ProductModel.create({
      ...data,
      specifications: (data as any).specifications ?? {},
      images: (data as any).images ?? [],
      description: (data as any).description ?? '',
    });
    console.log('✅ [Products] saved id:', doc._id);
    return doc as unknown as ProductDocument;
  }

  static async updateProduct(id: string, data: ProductUpdateDTO): Promise<ProductDocument | null> {
    const updated = await ProductModel.findByIdAndUpdate(id, data, { new: true });
    return updated as unknown as ProductDocument | null;
  }

  static async deleteProduct(id: string): Promise<boolean> {
    await ProductModel.findByIdAndDelete(id);
    return true;
  }
}


