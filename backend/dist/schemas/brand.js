"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandQuerySchema = exports.BrandUpdateSchema = exports.BrandCreateSchema = void 0;
const zod_1 = require("zod");
exports.BrandCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1).optional(),
    logo: zod_1.z.string().optional(),
    isActive: zod_1.z.coerce.boolean().optional(),
}).strict();
exports.BrandUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    slug: zod_1.z.string().min(1).optional(),
    logo: zod_1.z.string().optional(),
    isActive: zod_1.z.coerce.boolean().optional(),
}).strict();
exports.BrandQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().min(1).optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(200).optional(),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
});
//# sourceMappingURL=brand.js.map