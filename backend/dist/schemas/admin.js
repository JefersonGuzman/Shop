"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIConfigSchema = void 0;
const zod_1 = require("zod");
exports.AIConfigSchema = zod_1.z.object({
    provider: zod_1.z.enum(['groq', 'openai']),
    apiKey: zod_1.z.string().min(1, 'API Key requerida'),
    modelName: zod_1.z.string().min(1, 'Nombre de modelo requerido'),
    maxTokens: zod_1.z.number().min(1).max(32000).default(500),
    temperature: zod_1.z.number().min(0).max(2).default(0.7),
});
//# sourceMappingURL=admin.js.map