"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductQuerySchema = void 0;
const zod_1 = require("zod");
exports.ProductQuerySchema = zod_1.z
    .object({
    brand: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    minPrice: zod_1.z.coerce.number().min(0).optional(),
    maxPrice: zod_1.z.coerce.number().positive().optional(),
    inStock: zod_1.z.coerce.boolean().optional(),
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['name', 'price', 'rating', 'createdAt']).default('name'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
    search: zod_1.z.string().optional(),
})
    .refine((d) => !d.minPrice || !d.maxPrice || d.minPrice <= d.maxPrice, {
    message: 'Precio mínimo no puede ser mayor al máximo',
    path: ['minPrice'],
});
//# sourceMappingURL=product.js.map