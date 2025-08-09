"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminController_1 = require("../controllers/AdminController");
const validation_1 = require("../middleware/validation");
const admin_1 = require("../schemas/admin");
const router = (0, express_1.Router)();
const controller = new AdminController_1.AdminController();
router.get('/ai-config', controller.getAIConfig.bind(controller));
router.post('/ai-config', (0, validation_1.validateBody)(admin_1.AIConfigSchema), controller.upsertAIConfig.bind(controller));
exports.default = router;
//# sourceMappingURL=admin.js.map