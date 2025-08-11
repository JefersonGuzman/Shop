import { Router } from 'express';
import OfferController from '../controllers/OfferController';
import { authenticateToken, requireAdmin, requireStaff } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { OfferCreateSchema, OfferUpdateSchema } from '../schemas/offer';

const router = Router();
const controller = new OfferController();

router.get('/', controller.list.bind(controller));
router.get('/active', controller.active.bind(controller));
router.post('/', authenticateToken, requireStaff, validateBody(OfferCreateSchema), controller.create.bind(controller));
router.put('/:id', authenticateToken, requireStaff, validateBody(OfferUpdateSchema), controller.update.bind(controller));
router.delete('/:id', authenticateToken, requireStaff, controller.remove.bind(controller));

export default router;




