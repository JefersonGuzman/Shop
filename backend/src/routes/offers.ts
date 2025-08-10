import { Router } from 'express';
import OfferController from '../controllers/OfferController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { OfferCreateSchema, OfferUpdateSchema } from '../schemas/offer';

const router = Router();
const controller = new OfferController();

router.get('/', controller.list.bind(controller));
router.post('/', authenticateToken, requireAdmin, validateBody(OfferCreateSchema), controller.create.bind(controller));
router.put('/:id', authenticateToken, requireAdmin, validateBody(OfferUpdateSchema), controller.update.bind(controller));
router.delete('/:id', authenticateToken, requireAdmin, controller.remove.bind(controller));

export default router;




