import { Router } from 'express';
import { BrandController } from '../controllers/BrandController';
import { authenticateToken, requireAdmin, requireStaff } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { BrandCreateSchema, BrandUpdateSchema } from '../schemas/brand';

const router = Router();
const controller = new BrandController();

router.get('/', controller.list.bind(controller));
router.post('/', authenticateToken, requireStaff, validateBody(BrandCreateSchema), controller.create.bind(controller));
router.put('/:id', authenticateToken, requireStaff, validateBody(BrandUpdateSchema), controller.update.bind(controller));
router.delete('/:id', authenticateToken, requireStaff, controller.remove.bind(controller));
router.post('/bulk-delete', authenticateToken, requireStaff, controller.bulkDelete.bind(controller));

export default router;




