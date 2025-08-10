import { Router } from 'express';
import { BrandController } from '../controllers/BrandController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { BrandCreateSchema, BrandUpdateSchema } from '../schemas/brand';

const router = Router();
const controller = new BrandController();

router.get('/', controller.list.bind(controller));
router.post('/', authenticateToken, requireAdmin, validateBody(BrandCreateSchema), controller.create.bind(controller));
router.put('/:id', authenticateToken, requireAdmin, validateBody(BrandUpdateSchema), controller.update.bind(controller));
router.delete('/:id', authenticateToken, requireAdmin, controller.remove.bind(controller));
router.post('/bulk-delete', authenticateToken, requireAdmin, controller.bulkDelete.bind(controller));

export default router;




