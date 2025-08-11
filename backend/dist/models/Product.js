"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModel = void 0;
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    specifications: { type: mongoose_1.Schema.Types.Mixed, required: false, default: {} },
    images: [
        new mongoose_1.Schema({
            url: { type: String, required: true },
            publicId: { type: String, required: true },
        }, { _id: false })
    ],
    description: { type: String, required: false, default: '' },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviews: { type: Number, default: 0 },
    tags: [{ type: String }],
    sku: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ isActive: 1 });
exports.ProductModel = (0, mongoose_1.model)('Product', productSchema);
//# sourceMappingURL=Product.js.map