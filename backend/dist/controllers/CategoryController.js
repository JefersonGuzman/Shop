"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const Category_1 = require("../models/Category");
const Product_1 = require("../models/Product");
const category_1 = require("../schemas/category");
class CategoryController {
    async list(req, res) {
        try {
            // Parse query parameters
            const { page, limit, sortBy, sortOrder, search } = req.query;
            // Validar parámetros requeridos
            if (!page || !limit) {
                res.status(400).json({ error: 'Los parámetros page y limit son requeridos' });
                return;
            }
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const sortByField = sortBy || 'name';
            const sortOrderField = sortOrder || 'asc';
            const searchTerm = search || '';
            // Build filter
            let filter = {};
            if (searchTerm) {
                filter.name = new RegExp(searchTerm, 'i');
            }
            // Build sort object
            const sort = {};
            sort[sortByField] = sortOrderField === 'asc' ? 1 : -1;
            // Calculate skip for pagination
            const skip = (pageNum - 1) * limitNum;
            // Get total count for pagination
            const total = await Category_1.CategoryModel.countDocuments(filter);
            // Get categories with pagination and sorting
            let docs = await Category_1.CategoryModel.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean();
            // Fallback: si no hay categorías persistidas, obtenerlas desde productos
            if (!docs.length && total === 0) {
                const distinct = await Product_1.ProductModel.distinct('category', {});
                docs = distinct
                    .filter((c) => typeof c === 'string' && c)
                    .map((name) => ({
                    _id: name,
                    name,
                    slug: name.toLowerCase().replace(/\s+/g, '-'),
                    isActive: true,
                }));
                // Update total count for fallback data
                const fallbackTotal = docs.length;
                const totalPages = Math.ceil(fallbackTotal / limitNum);
                const startIndex = skip;
                const endIndex = Math.min(startIndex + limitNum, fallbackTotal);
                // Apply pagination to fallback data
                docs = docs.slice(startIndex, endIndex);
                res.json({
                    success: true,
                    data: docs,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                        total: fallbackTotal,
                        totalPages,
                        hasNext: pageNum < totalPages,
                        hasPrev: pageNum > 1
                    }
                });
                return;
            }
            // Calculate pagination info
            const totalPages = Math.ceil(total / limitNum);
            res.json({
                success: true,
                data: docs,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages,
                    hasNext: pageNum < totalPages,
                    hasPrev: pageNum > 1
                }
            });
        }
        catch (e) {
            res.status(500).json({ error: e.message || 'Server error' });
        }
    }
    async create(req, res) {
        try {
            const payload = category_1.CategoryCreateSchema.parse(req.body);
            const exists = await Category_1.CategoryModel.findOne({ slug: payload.slug });
            if (exists) {
                res.status(400).json({ error: 'Slug duplicado' });
                return;
            }
            const doc = await Category_1.CategoryModel.create(payload);
            res.status(201).json({ success: true, data: doc });
        }
        catch (e) {
            res.status(400).json({ error: e.message || 'Bad request' });
        }
    }
    async update(req, res) {
        try {
            const payload = category_1.CategoryUpdateSchema.parse(req.body);
            const doc = await Category_1.CategoryModel.findByIdAndUpdate(req.params.id, payload, { new: true });
            res.json({ success: true, data: doc });
        }
        catch (e) {
            res.status(400).json({ error: e.message || 'Bad request' });
        }
    }
    async remove(req, res) {
        try {
            await Category_1.CategoryModel.findByIdAndDelete(req.params.id);
            res.json({ success: true });
        }
        catch (e) {
            res.status(400).json({ error: e.message || 'Bad request' });
        }
    }
}
exports.CategoryController = CategoryController;
//# sourceMappingURL=CategoryController.js.map