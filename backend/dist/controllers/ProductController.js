"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
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
}
exports.ProductController = ProductController;
//# sourceMappingURL=ProductController.js.map