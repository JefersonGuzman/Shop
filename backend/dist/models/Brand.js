"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandModel = void 0;
const mongoose_1 = require("mongoose");
const brandSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true },
    logo: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
brandSchema.index({ name: 1 });
brandSchema.index({ slug: 1 });
// Generar slug si no viene o cambia el nombre
brandSchema.pre('save', function (next) {
    if (!this.slug || this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});
exports.BrandModel = (0, mongoose_1.model)('Brand', brandSchema);
//# sourceMappingURL=Brand.js.map