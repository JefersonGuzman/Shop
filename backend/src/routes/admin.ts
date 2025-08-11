import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { validateBody } from '../middleware/validation';
import { AIConfigSchema, AdminCreateEmployeeSchema, AdminUpdateUserSchema } from '../schemas/admin';
import { authenticateToken, requireAdmin, requireStaff } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);
// Requiere staff por defecto y especificamos admin donde aplique
router.use((req, res, next) => {
  // Permitir GET /orders y GET /analytics a empleados también
  if (req.method === 'GET' && (req.path.startsWith('/orders') || req.path.startsWith('/analytics'))) {
    return requireStaff(req as any, res, next);
  }
  // Resto del admin panel requiere admin
  return requireAdmin(req as any, res, next);
});
const controller = new AdminController();

router.get('/ai-config', controller.getAIConfig.bind(controller));
router.post('/ai-config', validateBody(AIConfigSchema), controller.upsertAIConfig.bind(controller));

// Users
router.get('/users', controller.listUsers.bind(controller));
router.post('/users', validateBody(AdminCreateEmployeeSchema), controller.createEmployee.bind(controller));
router.patch('/users/:id', validateBody(AdminUpdateUserSchema), controller.updateUser.bind(controller));
router.delete('/users/:id', controller.deleteUser.bind(controller));

// Orders
router.get('/orders', controller.listOrders.bind(controller)); // staff permitido
router.patch('/orders/:id', controller.updateOrder.bind(controller)); // solo admin por el guard superior
router.delete('/orders/:id', controller.deleteOrder.bind(controller)); // solo admin

// Analytics
router.get('/analytics/sales', controller.getSalesAnalytics.bind(controller));

export default router;


