import { Router, RequestHandler } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const controller = new AuthController();

router.post('/login', controller.login.bind(controller));
router.get('/me', authenticateToken as unknown as RequestHandler, controller.me.bind(controller));

export default router;


