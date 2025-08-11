import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { authenticateToken, requireAdmin, requireStaff } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { CategoryCreateSchema, CategoryUpdateSchema } from '../schemas/category';

const router = Router();
const controller = new CategoryController();

router.get('/', controller.list.bind(controller));
router.post('/', authenticateToken, requireStaff, validateBody(CategoryCreateSchema), controller.create.bind(controller));
router.put('/:id', authenticateToken, requireStaff, validateBody(CategoryUpdateSchema), controller.update.bind(controller));
router.delete('/:id', authenticateToken, requireStaff, controller.remove.bind(controller));

export default router;




