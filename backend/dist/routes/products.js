"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProductController_1 = require("../controllers/ProductController");
const validation_1 = require("../middleware/validation");
const product_1 = require("../schemas/product");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const controller = new ProductController_1.ProductController();
router.get('/', (0, validation_1.validateQuery)(product_1.ProductQuerySchema), controller.getProducts.bind(controller));
router.get('/search', controller.searchProducts.bind(controller));
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, (0, validation_1.validateBody)(product_1.ProductCreateSchema), controller.createProduct.bind(controller));
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, (0, validation_1.validateBody)(product_1.ProductUpdateSchema), controller.updateProduct.bind(controller));
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, controller.deleteProduct.bind(controller));
exports.default = router;
//# sourceMappingURL=products.js.map