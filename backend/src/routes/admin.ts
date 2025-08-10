import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { validateBody } from '../middleware/validation';
import { AIConfigSchema, AdminCreateEmployeeSchema, AdminUpdateUserSchema } from '../schemas/admin';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);
router.use(requireAdmin);
const controller = new AdminController();

router.get('/ai-config', controller.getAIConfig.bind(controller));
router.post('/ai-config', validateBody(AIConfigSchema), controller.upsertAIConfig.bind(controller));

// Users
router.get('/users', controller.listUsers.bind(controller));
router.post('/users', validateBody(AdminCreateEmployeeSchema), controller.createEmployee.bind(controller));
router.patch('/users/:id', validateBody(AdminUpdateUserSchema), controller.updateUser.bind(controller));
router.delete('/users/:id', controller.deleteUser.bind(controller));

// Orders
router.get('/orders', controller.listOrders.bind(controller));
router.patch('/orders/:id', controller.updateOrder.bind(controller));
router.delete('/orders/:id', controller.deleteOrder.bind(controller));

export default router;


