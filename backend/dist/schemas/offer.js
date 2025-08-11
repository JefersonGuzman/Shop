"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferUpdateSchema = exports.OfferCreateSchema = void 0;
const zod_1 = require("zod");
const OfferBaseSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
    discountPercent: zod_1.z.number().min(0).max(100).optional(),
    priceOff: zod_1.z.number().min(0).optional(),
    productIds: zod_1.z.array(zod_1.z.string().min(1)).default([]),
    startsAt: zod_1.z.string().datetime().optional(),
    endsAt: zod_1.z.string().datetime().optional(),
    isActive: zod_1.z.boolean().optional(),
    // Campos para banner
    eyebrow: zod_1.z.string().optional(),
    headline: zod_1.z.string().optional(),
    subheadline: zod_1.z.string().optional(),
    ctaLabel: zod_1.z.string().optional(),
    ctaTo: zod_1.z.string().optional(),
    layout: zod_1.z.enum(['image-right', 'image-left']).optional(),
    bgColor: zod_1.z.string().optional(),
    textColor: zod_1.z.string().optional(),
});
exports.OfferCreateSchema = OfferBaseSchema.refine((data) => (data.discountPercent !== undefined || data.priceOff !== undefined) && !(data.discountPercent !== undefined && data.priceOff !== undefined), {
    message: 'Debe especificar solo uno: discountPercent o priceOff',
});
// For updates, we need to handle the case where fields might be undefined
exports.OfferUpdateSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    discountPercent: zod_1.z.number().min(0).max(100).optional(),
    priceOff: zod_1.z.number().min(0).optional(),
    productIds: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    startsAt: zod_1.z.string().optional(),
    endsAt: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
    eyebrow: zod_1.z.string().optional(),
    headline: zod_1.z.string().optional(),
    subheadline: zod_1.z.string().optional(),
    ctaLabel: zod_1.z.string().optional(),
    ctaTo: zod_1.z.string().optional(),
    layout: zod_1.z.enum(['image-right', 'image-left']).optional(),
    bgColor: zod_1.z.string().optional(),
    textColor: zod_1.z.string().optional(),
}).refine((data) => {
    // If both fields are provided, that's invalid
    if (data.discountPercent !== undefined && data.priceOff !== undefined) {
        return false;
    }
    // If neither field is provided, that's fine for updates
    // If only one field is provided, that's fine
    return true;
}, {
    message: 'No puede especificar tanto discountPercent como priceOff',
});
//# sourceMappingURL=offer.js.map