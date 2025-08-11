import { Router } from 'express';

import { ProductController } from '../controllers/ProductController';
import { validateBody, validateQuery } from '../middleware/validation';
import { ProductCreateSchema, ProductQuerySchema, ProductUpdateSchema } from '../schemas/product';
import { authenticateToken, requireAdmin, requireStaff } from '../middleware/auth';
import { deleteImage } from '../services/CloudinaryService';

const router = Router();
const controller = new ProductController();

router.get('/', validateQuery(ProductQuerySchema), controller.getProducts.bind(controller));
router.get('/search', controller.searchProducts.bind(controller));
router.post('/', authenticateToken, requireStaff, validateBody(ProductCreateSchema), controller.createProduct.bind(controller));
router.put('/:id', authenticateToken, requireStaff, validateBody(ProductUpdateSchema), controller.updateProduct.bind(controller));
router.delete('/:id', authenticateToken, requireStaff, controller.deleteProduct.bind(controller));

// Endpoint para eliminar imagen por publicId (Cloudinary)
router.delete('/:id/images/:publicId', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { id, publicId } = req.params as { id: string; publicId: string };
    // Eliminar en Cloudinary
    await deleteImage(publicId);
    // Remover de DB
    const doc = await (await import('../models/Product')).ProductModel.findByIdAndUpdate(
      id,
      { $pull: { images: { publicId } } },
      { new: true }
    );
    res.json({ success: true, data: doc });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Bad request' });
  }
});

export default router;


