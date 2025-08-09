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
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map