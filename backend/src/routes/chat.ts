import { Router } from 'express';

import { ChatController } from '../controllers/ChatController';

const router = Router();
const controller = new ChatController();

router.post('/message', controller.processMessage.bind(controller));
router.get('/history', controller.getHistory.bind(controller));
router.get('/sessions', controller.listSessions.bind(controller));
router.delete('/session', controller.deleteSession.bind(controller));

export default router;


