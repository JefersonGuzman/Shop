"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const Product_1 = require("../models/Product");
class ProductService {
    static async getProducts(query) {
        const { brand, category, minPrice, maxPrice, inStock, page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc', search, } = query;
        const filter = { isActive: true };
        if (brand)
            filter.brand = brand;
        if (category)
            filter.category = category;
        if (typeof inStock === 'boolean')
            filter.stock = inStock ? { $gt: 0 } : { $gte: 0 };
        if (minPrice || maxPrice)
            filter.price = { ...(minPrice ? { $gte: minPrice } : {}), ...(maxPrice ? { $lte: maxPrice } : {}) };
        if (search)
            filter.$text = { $search: search };
        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        const [products, total] = await Promise.all([
            Product_1.ProductModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
            Product_1.ProductModel.countDocuments(filter),
        ]);
        return { products: products, total };
    }
}
exports.ProductService = ProductService;
//# sourceMappingURL=ProductService.js.map