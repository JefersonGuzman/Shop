import { Request, Response } from 'express';
import { BrandModel } from '../models/Brand';
import { BrandCreateSchema, BrandUpdateSchema } from '../schemas/brand';
import { ProductModel } from '../models/Product';

export class BrandController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc', search } = req.query as {
        page?: string;
        limit?: string;
        sortBy?: string;
        sortOrder?: string;
        search?: string;
      };

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const filter: any = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const total = await BrandModel.countDocuments(filter);
      const totalPages = Math.ceil(total / limitNum);

      let brands = await BrandModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean();

      // Fallback desde productos si no hay marcas creadas
      if (!brands.length && pageNum === 1) {
        const distinct = await ProductModel.distinct('brand', {});
        brands = distinct
          .filter((b: unknown) => typeof b === 'string' && b)
          .map((name: string) => ({
            _id: name,
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            isActive: true,
          })) as any;
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
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Server error' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const payload = BrandCreateSchema.parse(req.body);
      const exists = await BrandModel.findOne({ slug: payload.slug });
      if (exists) {
        res.status(400).json({ error: 'Slug duplicado' });
        return;
      }
      const doc = await BrandModel.create(payload);
      res.status(201).json({ success: true, data: doc });
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Bad request' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const payload = BrandUpdateSchema.parse(req.body);
      const doc = await BrandModel.findByIdAndUpdate(req.params.id, payload, { new: true });
      res.json({ success: true, data: doc });
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Bad request' });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      await BrandModel.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Bad request' });
    }
  }

  async bulkDelete(req: Request, res: Response): Promise<void> {
    try {
      const { ids } = req.body as { ids: string[] };
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ error: 'IDs requeridos' });
        return;
      }
      
      await BrandModel.deleteMany({ _id: { $in: ids } });
      res.json({ success: true, message: `${ids.length} marcas eliminadas` });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Server error' });
    }
  }
}


