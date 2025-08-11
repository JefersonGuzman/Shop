"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUpdateUserSchema = exports.AdminCreateEmployeeSchema = exports.AIConfigSchema = void 0;
const zod_1 = require("zod");
exports.AIConfigSchema = zod_1.z.object({
    provider: zod_1.z.enum(['groq', 'openai']),
    apiKey: zod_1.z.string().min(1, 'API Key requerida'),
    modelName: zod_1.z.string().min(1, 'Nombre de modelo requerido'),
    maxTokens: zod_1.z.number().min(1).max(32000).default(500),
    temperature: zod_1.z.number().min(0).max(2).default(0.7),
});
// ----- Admin: Users -----
exports.AdminCreateEmployeeSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, 'Nombre requerido'),
    lastName: zod_1.z.string().min(1, 'Apellido requerido'),
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(6, 'Password mínimo 6 caracteres'),
});
exports.AdminUpdateUserSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).optional(),
    lastName: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email().optional(),
    role: zod_1.z.enum(['admin', 'employee', 'customer']).optional(),
    isActive: zod_1.z.boolean().optional(),
    password: zod_1.z.string().min(6).optional(),
});
//# sourceMappingURL=admin.js.map