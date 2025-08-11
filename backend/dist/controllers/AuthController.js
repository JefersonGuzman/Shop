"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_1 = require("../schemas/auth");
const AuthService_1 = require("../services/AuthService");
class AuthController {
    async register(req, res) {
        try {
            const payload = auth_1.RegisterSchema.parse(req.body);
            const out = await AuthService_1.AuthService.register(payload);
            res.status(201).json({ success: true, id: out.id });
        }
        catch (error) {
            res.status(400).json({ error: error.message || 'Bad request' });
        }
    }
    async login(req, res) {
        try {
            const credentials = auth_1.LoginSchema.parse(req.body);
            const tokens = await AuthService_1.AuthService.login(credentials);
            if (!tokens) {
                res.status(401).json({ error: 'Credenciales inválidas' });
                return;
            }
            res.json({ success: true, ...tokens });
        }
        catch (error) {
            res.status(400).json({ error: error.message || 'Bad request' });
        }
    }
    async me(req, res) {
        if (!req.user) {
            res.status(401).json({ error: 'No autorizado' });
            return;
        }
        res.json({ success: true, user: req.user });
    }
    async refresh(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(400).json({ error: 'Refresh token requerido' });
                return;
            }
            const tokens = await AuthService_1.AuthService.refresh(refreshToken);
            res.json({ success: true, ...tokens });
        }
        catch (error) {
            res.status(401).json({ error: error.message || 'Refresh inválido' });
        }
    }
    async logout(req, res) {
        await AuthService_1.AuthService.logout();
        res.json({ success: true });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map