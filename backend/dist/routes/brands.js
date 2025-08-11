"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BrandController_1 = require("../controllers/BrandController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const brand_1 = require("../schemas/brand");
const router = (0, express_1.Router)();
const controller = new BrandController_1.BrandController();
router.get('/', controller.list.bind(controller));
router.post('/', auth_1.authenticateToken, auth_1.requireStaff, (0, validation_1.validateBody)(brand_1.BrandCreateSchema), controller.create.bind(controller));
router.put('/:id', auth_1.authenticateToken, auth_1.requireStaff, (0, validation_1.validateBody)(brand_1.BrandUpdateSchema), controller.update.bind(controller));
router.delete('/:id', auth_1.authenticateToken, auth_1.requireStaff, controller.remove.bind(controller));
router.post('/bulk-delete', auth_1.authenticateToken, auth_1.requireStaff, controller.bulkDelete.bind(controller));
exports.default = router;
//# sourceMappingURL=brands.js.map