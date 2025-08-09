import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { validateBody } from '../middleware/validation';
import { AIConfigSchema } from '../schemas/admin';

const router = Router();
const controller = new AdminController();

router.post('/ai-config', validateBody(AIConfigSchema), controller.upsertAIConfig.bind(controller));

export default router;


