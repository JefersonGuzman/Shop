"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
class AuthService {
    static async register(data) {
        const exists = await User_1.UserModel.findOne({ email: data.email });
        if (exists)
            throw new Error('Email ya registrado');
        const hash = await bcrypt_1.default.hash(data.password, 10);
        const user = await User_1.UserModel.create({
            email: data.email,
            password: hash,
            firstName: data.firstName,
            lastName: data.lastName,
            role: 'customer',
        });
        return { id: user._id.toString() };
    }
    static async login(credentials) {
        const user = await User_1.UserModel.findOne({ email: credentials.email, isActive: true });
        if (!user)
            return null;
        const ok = await bcrypt_1.default.compare(credentials.password, user.password);
        if (!ok)
            return null;
        const accessToken = jsonwebtoken_1.default.sign({ userId: user._id.toString(), role: user.role }, process.env.JWT_SECRET || '', {
            expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user._id.toString() }, process.env.JWT_REFRESH_SECRET || '', {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        });
        return { accessToken, refreshToken };
    }
    static async refresh(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET || '');
            // Verificar que el usuario sigue activo
            const user = await User_1.UserModel.findById(decoded.userId).lean();
            if (!user || user.isActive === false)
                throw new Error('Usuario no activo');
            const accessToken = jsonwebtoken_1.default.sign({ userId: decoded.userId, role: user.role }, process.env.JWT_SECRET || '', { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
            const newRefreshToken = jsonwebtoken_1.default.sign({ userId: decoded.userId }, process.env.JWT_REFRESH_SECRET || '', { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
            return { accessToken, refreshToken: newRefreshToken };
        }
        catch (err) {
            throw new Error('Refresh token inválido');
        }
    }
    // Para MVP, logout es stateless (el cliente borra tokens). Mantener aquí por compatibilidad.
    static async logout() {
        return;
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map