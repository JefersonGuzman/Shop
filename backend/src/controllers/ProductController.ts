import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import type { ProductQueryDTO } from '../schemas/product';

export class ProductController {
  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query as unknown as ProductQueryDTO;
      const result = await ProductService.getProducts(query);
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
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const { q, ...rest } = req.query as any;
      if (!q) {
        res.status(400).json({ error: 'Search query required (q)' });
        return;
      }
      const merged = { ...(rest as any), search: String(q) } as ProductQueryDTO;
      const result = await ProductService.getProducts(merged);
      res.json({ success: true, data: result.products, total: result.total, query: q });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }
}


