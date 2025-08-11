"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryQuerySchema = exports.CategoryUpdateSchema = exports.CategoryCreateSchema = void 0;
const zod_1 = require("zod");
exports.CategoryCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    color: zod_1.z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/).optional(),
    isActive: zod_1.z.boolean().optional(),
}).strict();
exports.CategoryUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    slug: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    color: zod_1.z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/).optional(),
    isActive: zod_1.z.boolean().optional(),
}).strict();
exports.CategoryQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().min(1).optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(200).optional(),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
});
//# sourceMappingURL=category.js.map