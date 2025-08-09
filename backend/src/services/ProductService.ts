import { ProductModel } from '../models/Product';
import type { ProductDocument } from '../models/Product';
import type { ProductQueryDTO } from '../schemas/product';

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
}


