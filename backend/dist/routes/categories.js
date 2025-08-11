"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CategoryController_1 = require("../controllers/CategoryController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const category_1 = require("../schemas/category");
const router = (0, express_1.Router)();
const controller = new CategoryController_1.CategoryController();
router.get('/', controller.list.bind(controller));
router.post('/', auth_1.authenticateToken, auth_1.requireStaff, (0, validation_1.validateBody)(category_1.CategoryCreateSchema), controller.create.bind(controller));
router.put('/:id', auth_1.authenticateToken, auth_1.requireStaff, (0, validation_1.validateBody)(category_1.CategoryUpdateSchema), controller.update.bind(controller));
router.delete('/:id', auth_1.authenticateToken, auth_1.requireStaff, controller.remove.bind(controller));
exports.default = router;
//# sourceMappingURL=categories.js.map