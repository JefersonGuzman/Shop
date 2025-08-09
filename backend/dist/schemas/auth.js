"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(6, 'Password debe tener al menos 6 caracteres'),
    firstName: zod_1.z.string().min(1, 'Nombre requerido'),
    lastName: zod_1.z.string().min(1, 'Apellido requerido'),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(1, 'Password requerido'),
});
//# sourceMappingURL=auth.js.map