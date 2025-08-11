"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middleware/auth");
const cloudinary_1 = require("cloudinary");
const router = (0, express_1.Router)();
const controller = new AuthController_1.AuthController();
router.post('/register', controller.register.bind(controller));
router.post('/login', controller.login.bind(controller));
router.get('/me', auth_1.authenticateToken, controller.me.bind(controller));
router.post('/refresh', controller.refresh.bind(controller));
router.post('/logout', controller.logout.bind(controller));
// Endpoint simple para firmar direct uploads desde el frontend (opcional)
router.get('/cloudinary-signature', (req, res) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const requestedFolder = req.query.folder || 'makers-tech/brands';
    // Seguridad básica: limitar a nuestra raíz de proyecto
    const safeFolder = requestedFolder.startsWith('makers-tech/') ? requestedFolder : 'makers-tech/brands';
    const paramsToSign = { timestamp, folder: safeFolder };
    const signature = cloudinary_1.v2.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET || '');
    res.json({
        timestamp,
        signature,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder: safeFolder,
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map