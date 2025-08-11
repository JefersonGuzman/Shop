import { Router } from 'express';

import { ChatController } from '../controllers/ChatController';

const router = Router();
const controller = new ChatController();

router.post('/message', controller.processMessage.bind(controller));
router.get('/history', controller.getHistory.bind(controller));
router.delete('/session', controller.closeSession.bind(controller));
router.post('/close', controller.closeSession.bind(controller));
router.get('/close', controller.closeSession.bind(controller));
router.all('/close', controller.closeSession.bind(controller));

export default router;


