import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { CategoryCreateSchema, CategoryUpdateSchema } from '../schemas/category';

const router = Router();
const controller = new CategoryController();

router.get('/', controller.list.bind(controller));
router.post('/', authenticateToken, requireAdmin, validateBody(CategoryCreateSchema), controller.create.bind(controller));
router.put('/:id', authenticateToken, requireAdmin, validateBody(CategoryUpdateSchema), controller.update.bind(controller));
router.delete('/:id', authenticateToken, requireAdmin, controller.remove.bind(controller));

export default router;




