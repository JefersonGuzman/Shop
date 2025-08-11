"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandController = void 0;
const Brand_1 = require("../models/Brand");
const brand_1 = require("../schemas/brand");
const Product_1 = require("../models/Product");
class BrandController {
    async list(req, res) {
        try {
            const { page, limit, sortBy, sortOrder, search } = req.query;
            // Validar parámetros requeridos
            if (!page || !limit) {
                res.status(400).json({ error: 'Los parámetros page y limit son requeridos' });
                return;
            }
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const skip = (pageNum - 1) * limitNum;
            const filter = {};
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ];
            }
            const sort = {};
            const sortByField = sortBy || 'name';
            const sortOrderField = sortOrder || 'asc';
            sort[sortByField] = sortOrderField === 'asc' ? 1 : -1;
            const total = await Brand_1.BrandModel.countDocuments(filter);
            const totalPages = Math.ceil(total / limitNum);
            let brands = await Brand_1.BrandModel.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean();
            // Fallback desde productos si no hay marcas creadas
            if (!brands.length && pageNum === 1) {
                const distinct = await Product_1.ProductModel.distinct('brand', {});
                brands = distinct
                    .filter((b) => typeof b === 'string' && b)
                    .map((name) => ({
                    _id: name,
                    name,
                    slug: name.toLowerCase().replace(/\s+/g, '-'),
                    isActive: true,
                }));
            }
            res.json({
                success: true,
                data: brands,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages,
                },
            });
        }
        catch (e) {
            res.status(500).json({ error: e.message || 'Server error' });
        }
    }
    async create(req, res) {
        try {
            const payload = brand_1.BrandCreateSchema.parse(req.body);
            // Generar slug si no viene
            const slug = (payload.slug ?? payload.name)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            const exists = await Brand_1.BrandModel.findOne({ slug });
            if (exists) {
                res.status(400).json({ error: 'Slug duplicado' });
                return;
            }
            const doc = await Brand_1.BrandModel.create({ ...payload, slug });
            res.status(201).json({ success: true, data: doc });
        }
        catch (e) {
            res.status(400).json({ error: e.message || 'Bad request' });
        }
    }
    async update(req, res) {
        try {
            const payload = brand_1.BrandUpdateSchema.parse(req.body);
            let update = { ...payload };
            if (payload.name && !payload.slug) {
                update.slug = payload.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }
            const doc = await Brand_1.BrandModel.findByIdAndUpdate(req.params.id, update, { new: true });
            res.json({ success: true, data: doc });
        }
        catch (e) {
            res.status(400).json({ error: e.message || 'Bad request' });
        }
    }
    async remove(req, res) {
        try {
            await Brand_1.BrandModel.findByIdAndDelete(req.params.id);
            res.json({ success: true });
        }
        catch (e) {
            res.status(400).json({ error: e.message || 'Bad request' });
        }
    }
    async bulkDelete(req, res) {
        try {
            const { ids } = req.body;
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                res.status(400).json({ error: 'IDs requeridos' });
                return;
            }
            await Brand_1.BrandModel.deleteMany({ _id: { $in: ids } });
            res.json({ success: true, message: `${ids.length} marcas eliminadas` });
        }
        catch (e) {
            res.status(500).json({ error: e.message || 'Server error' });
        }
    }
}
exports.BrandController = BrandController;
//# sourceMappingURL=BrandController.js.map