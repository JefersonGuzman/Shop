"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_1 = require("../schemas/product");
const ProductService_1 = require("../services/ProductService");
class ProductController {
    async getProducts(req, res) {
        try {
            const query = req.query;
            const result = await ProductService_1.ProductService.getProducts(query);
            res.json({
                success: true,
                data: result.products,
                pagination: {
                    page: Number(query.page || 1),
                    limit: Number(query.limit || 20),
                    total: result.total,
                    pages: Math.ceil(result.total / Number(query.limit || 20)),
                },
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Server error' });
        }
    }
    async searchProducts(req, res) {
        try {
            const { q, ...rest } = req.query;
            if (!q) {
                res.status(400).json({ error: 'Search query required (q)' });
                return;
            }
            const merged = { ...rest, search: String(q) };
            const result = await ProductService_1.ProductService.getProducts(merged);
            res.json({ success: true, data: result.products, total: result.total, query: q });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Server error' });
        }
    }
    async createProduct(req, res) {
        try {
            const payload = product_1.ProductCreateSchema.parse(req.body);
            const result = await ProductService_1.ProductService.createProduct(payload);
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ error: error.message || 'Bad request' });
        }
    }
    async updateProduct(req, res) {
        try {
            const payload = product_1.ProductUpdateSchema.parse(req.body);
            const updated = await ProductService_1.ProductService.updateProduct(req.params.id, payload);
            res.json({ success: true, data: updated });
        }
        catch (error) {
            res.status(400).json({ error: error.message || 'Bad request' });
        }
    }
    async deleteProduct(req, res) {
        try {
            await ProductService_1.ProductService.deleteProduct(req.params.id);
            res.json({ success: true });
        }
        catch (error) {
            res.status(400).json({ error: error.message || 'Bad request' });
        }
    }
}
exports.ProductController = ProductController;
//# sourceMappingURL=ProductController.js.map