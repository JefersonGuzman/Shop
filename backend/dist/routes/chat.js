"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ChatController_1 = require("../controllers/ChatController");
const router = (0, express_1.Router)();
const controller = new ChatController_1.ChatController();
router.post('/message', controller.processMessage.bind(controller));
router.get('/history', controller.getHistory.bind(controller));
router.delete('/session', controller.closeSession.bind(controller));
router.post('/close', controller.closeSession.bind(controller));
router.get('/close', controller.closeSession.bind(controller));
router.all('/close', controller.closeSession.bind(controller));
exports.default = router;
//# sourceMappingURL=chat.js.map