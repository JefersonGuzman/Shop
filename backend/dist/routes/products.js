"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProductController_1 = require("../controllers/ProductController");
const validation_1 = require("../middleware/validation");
const product_1 = require("../schemas/product");
const auth_1 = require("../middleware/auth");
const CloudinaryService_1 = require("../services/CloudinaryService");
const router = (0, express_1.Router)();
const controller = new ProductController_1.ProductController();
router.get('/', (0, validation_1.validateQuery)(product_1.ProductQuerySchema), controller.getProducts.bind(controller));
router.get('/search', controller.searchProducts.bind(controller));
router.get('/:id', controller.getProductById.bind(controller));
router.post('/', auth_1.authenticateToken, auth_1.requireStaff, (0, validation_1.validateBody)(product_1.ProductCreateSchema), controller.createProduct.bind(controller));
router.put('/:id', auth_1.authenticateToken, auth_1.requireStaff, (0, validation_1.validateBody)(product_1.ProductUpdateSchema), controller.updateProduct.bind(controller));
router.delete('/:id', auth_1.authenticateToken, auth_1.requireStaff, controller.deleteProduct.bind(controller));
// Endpoint para eliminar imagen por publicId (Cloudinary)
router.delete('/:id/images/:publicId', auth_1.authenticateToken, auth_1.requireStaff, async (req, res) => {
    try {
        const { id, publicId } = req.params;
        // Eliminar en Cloudinary
        await (0, CloudinaryService_1.deleteImage)(publicId);
        // Remover de DB
        const doc = await (await Promise.resolve().then(() => __importStar(require('../models/Product')))).ProductModel.findByIdAndUpdate(id, { $pull: { images: { publicId } } }, { new: true });
        res.json({ success: true, data: doc });
    }
    catch (e) {
        res.status(400).json({ error: e.message || 'Bad request' });
    }
});
exports.default = router;
//# sourceMappingURL=products.js.map