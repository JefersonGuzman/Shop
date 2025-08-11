"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ChatController_1 = require("../controllers/ChatController");
const router = (0, express_1.Router)();
const controller = new ChatController_1.ChatController();
router.post('/message', controller.processMessage.bind(controller));
router.get('/history', controller.getHistory.bind(controller));
router.get('/sessions', controller.listSessions.bind(controller));
router.delete('/session', controller.deleteSession.bind(controller));
exports.default = router;
//# sourceMappingURL=chat.js.map