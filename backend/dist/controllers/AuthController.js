"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthService_1 = require("../services/AuthService");
const auth_1 = require("../schemas/auth");
class AuthController {
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
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map