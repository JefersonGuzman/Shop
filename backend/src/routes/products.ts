import { Router } from 'express';

import { ProductController } from '../controllers/ProductController';
import { validateQuery } from '../middleware/validation';
import { ProductQuerySchema } from '../schemas/product';

const router = Router();
const controller = new ProductController();

router.get('/', validateQuery(ProductQuerySchema), controller.getProducts.bind(controller));
router.get('/search', controller.searchProducts.bind(controller));

export default router;


