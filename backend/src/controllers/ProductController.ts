import { Request, Response } from 'express';

import type { ProductQueryDTO } from '../schemas/product';
import { ProductCreateSchema, ProductUpdateSchema } from '../schemas/product';
import { ProductService } from '../services/ProductService';

export class ProductController {
  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query as unknown as ProductQueryDTO;
      
      // Validar parámetros requeridos
      if (!query.page || !query.limit) {
        res.status(400).json({ error: 'Los parámetros page y limit son requeridos' });
        return;
      }
      
      const result = await ProductService.getProducts(query);
      res.json({
        success: true,
        data: result.products,
        pagination: {
          page: Number(query.page),
          limit: Number(query.limit),
          total: result.total,
          pages: Math.ceil(result.total / Number(query.limit)),
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      if (!id) {
        res.status(400).json({ error: 'Product id requerido' });
        return;
      }
      const product = await ProductService.getById(id);
      if (!product) {
        res.status(404).json({ error: 'Producto no encontrado' });
        return;
      }
      res.json({ success: true, data: product });
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

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      console.log('📦 [Products] createProduct body:', JSON.stringify(req.body));
      const payload = ProductCreateSchema.parse(req.body);
      console.log('✅ [Products] payload after parse:', JSON.stringify(payload));
      const result = await ProductService.createProduct(payload);
      console.log('🗄️ [Products] created:', result?._id);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      console.error('❌ [Products] create error:', error?.message, error?.stack);
      res.status(400).json({ error: error.message || 'Bad request', details: error?.issues || error });
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const payload = ProductUpdateSchema.parse(req.body);
      const updated = await ProductService.updateProduct(req.params.id, payload);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Bad request' });
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      await ProductService.deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Bad request' });
    }
  }
}


