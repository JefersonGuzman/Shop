import { Request, Response } from 'express';
import { CategoryModel } from '../models/Category';
import { ProductModel } from '../models/Product';
import { CategoryCreateSchema, CategoryUpdateSchema } from '../schemas/category';

export class CategoryController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      // Parse query parameters
      const { page, limit, sortBy, sortOrder, search } = req.query as {
        page?: string;
        limit?: string;
        sortBy?: string;
        sortOrder?: string;
        search?: string;
      };

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
      let filter: any = {};
      if (searchTerm) {
        filter.name = new RegExp(searchTerm, 'i');
      }

      // Build sort object
      const sort: any = {};
      sort[sortByField] = sortOrderField === 'asc' ? 1 : -1;

      // Calculate skip for pagination
      const skip = (pageNum - 1) * limitNum;

      // Get total count for pagination
      const total = await CategoryModel.countDocuments(filter);

      // Get categories with pagination and sorting
      let docs = await CategoryModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean();

      // Fallback: si no hay categorías persistidas, obtenerlas desde productos
      if (!docs.length && total === 0) {
        const distinct = await ProductModel.distinct('category', {});
        docs = distinct
          .filter((c: unknown) => typeof c === 'string' && c)
          .map((name: string) => ({
            _id: name,
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            isActive: true,
          })) as any;
        
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
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Server error' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const payload = CategoryCreateSchema.parse(req.body);
      const exists = await CategoryModel.findOne({ slug: payload.slug });
      if (exists) {
        res.status(400).json({ error: 'Slug duplicado' });
        return;
      }
      const doc = await CategoryModel.create(payload);
      res.status(201).json({ success: true, data: doc });
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Bad request' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const payload = CategoryUpdateSchema.parse(req.body);
      const doc = await CategoryModel.findByIdAndUpdate(req.params.id, payload, { new: true });
      res.json({ success: true, data: doc });
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Bad request' });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      await CategoryModel.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Bad request' });
    }
  }
}


