import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { OrderCreateSchema } from '../schemas/order';
import OrderController from '../controllers/OrderController';

const router = Router();
const controller = new OrderController();

router.post('/', authenticateToken, validateBody(OrderCreateSchema), controller.create.bind(controller));
router.get('/my', authenticateToken, controller.myOrders.bind(controller));

export default router;


