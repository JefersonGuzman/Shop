"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessageSchema = void 0;
const zod_1 = require("zod");
exports.ChatMessageSchema = zod_1.z.object({
    message: zod_1.z.string().min(1, 'Mensaje no puede estar vacío'),
    sessionId: zod_1.z.string().min(1),
    userId: zod_1.z.string().optional(),
});
//# sourceMappingURL=chat.js.map