import { Router } from 'express';

import { ProductController } from '../controllers/ProductController';
import { validateBody, validateQuery } from '../middleware/validation';
import { ProductCreateSchema, ProductQuerySchema, ProductUpdateSchema } from '../schemas/product';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const controller = new ProductController();

router.get('/', validateQuery(ProductQuerySchema), controller.getProducts.bind(controller));
router.get('/search', controller.searchProducts.bind(controller));
router.post('/', authenticateToken, requireAdmin, validateBody(ProductCreateSchema), controller.createProduct.bind(controller));
router.put('/:id', authenticateToken, requireAdmin, validateBody(ProductUpdateSchema), controller.updateProduct.bind(controller));
router.delete('/:id', authenticateToken, requireAdmin, controller.deleteProduct.bind(controller));

export default router;


