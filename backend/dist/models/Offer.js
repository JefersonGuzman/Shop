"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferModel = void 0;
const mongoose_1 = require("mongoose");
const offerSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    image: { type: String, trim: true },
    discountPercent: {
        type: Number,
        min: 0,
        max: 100
    },
    priceOff: {
        type: Number,
        min: 0
    },
    productIds: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Product'
        }],
    startsAt: {
        type: Date
    },
    endsAt: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    slug: {
        type: String,
        required: false,
        unique: true,
        trim: true,
        lowercase: true
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed', 'bogo'],
        default: 'percentage'
    },
    maxUses: {
        type: Number,
        min: 1
    },
    currentUses: {
        type: Number,
        default: 0,
        min: 0
    },
    minOrderValue: {
        type: Number,
        min: 0
    },
    applicableCategories: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Category'
        }],
    isFeatured: {
        type: Boolean,
        default: false
    },
    priority: {
        type: Number,
        default: 0
    },
    conditions: {
        type: String,
        trim: true
    },
    terms: {
        type: String,
        trim: true
    },
}, { timestamps: true });
// Índices para optimizar consultas
offerSchema.index({ title: 1 });
offerSchema.index({ slug: 1 });
offerSchema.index({ isActive: 1 });
offerSchema.index({ isFeatured: 1 });
offerSchema.index({ startsAt: 1 });
offerSchema.index({ endsAt: 1 });
offerSchema.index({ type: 1 });
offerSchema.index({ priority: 1 });
offerSchema.index({ 'productIds': 1 });
offerSchema.index({ 'applicableCategories': 1 });
offerSchema.index({ 'title': 'text', 'description': 'text' });
// Middleware para generar slug automáticamente
offerSchema.pre('save', function (next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    // Validar que al menos uno de los dos tipos de descuento esté presente
    if (!this.discountPercent && !this.priceOff) {
        return next(new Error('Debe especificar un descuento porcentual o un precio fijo'));
    }
    // Establecer el tipo basado en los campos presentes
    if (this.discountPercent && !this.priceOff) {
        this.type = 'percentage';
    }
    else if (this.priceOff && !this.discountPercent) {
        this.type = 'fixed';
    }
    next();
});
// Método estático para obtener ofertas activas
offerSchema.statics.getActiveOffers = function () {
    const now = new Date();
    return this.find({
        isActive: true,
        $and: [
            {
                $or: [
                    { startsAt: { $exists: false } },
                    { startsAt: { $lte: now } }
                ]
            },
            {
                $or: [
                    { endsAt: { $exists: false } },
                    { endsAt: { $gt: now } }
                ]
            }
        ]
    }).populate('productIds').populate('applicableCategories');
};
// Método estático para obtener ofertas por producto
offerSchema.statics.getOffersByProduct = function (productId) {
    const now = new Date();
    return this.find({
        isActive: true,
        productIds: productId,
        $and: [
            {
                $or: [
                    { startsAt: { $exists: false } },
                    { startsAt: { $lte: now } }
                ]
            },
            {
                $or: [
                    { endsAt: { $exists: false } },
                    { endsAt: { $gt: now } }
                ]
            }
        ]
    }).sort({ priority: -1, createdAt: -1 });
};
// Método para verificar si la oferta está vigente
offerSchema.methods.isValid = function () {
    if (!this.isActive)
        return false;
    const now = new Date();
    if (this.startsAt && now < this.startsAt)
        return false;
    if (this.endsAt && now > this.endsAt)
        return false;
    if (this.maxUses && this.currentUses >= this.maxUses)
        return false;
    return true;
};
// Método para aplicar la oferta a un precio
offerSchema.methods.applyDiscount = function (originalPrice) {
    if (!this.isValid())
        return originalPrice;
    if (this.discountPercent) {
        return originalPrice * (1 - this.discountPercent / 100);
    }
    if (this.priceOff) {
        return Math.max(0, originalPrice - this.priceOff);
    }
    return originalPrice;
};
// Método para incrementar el uso de la oferta
offerSchema.methods.incrementUsage = function () {
    if (this.maxUses && this.currentUses >= this.maxUses) {
        throw new Error('Oferta ha alcanzado su límite máximo de usos');
    }
    this.currentUses += 1;
    return this.save();
};
exports.OfferModel = (0, mongoose_1.model)('Offer', offerSchema);
//# sourceMappingURL=Offer.js.map