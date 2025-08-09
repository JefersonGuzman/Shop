"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_1 = require("../schemas/admin");
const AIConfigService_1 = require("../services/AIConfigService");
class AdminController {
    async upsertAIConfig(req, res) {
        try {
            const payload = admin_1.AIConfigSchema.parse(req.body);
            await AIConfigService_1.AIConfigService.upsertConfig(payload);
            res.json({ success: true });
        }
        catch (error) {
            res.status(400).json({ error: error.message || 'Bad request' });
        }
    }
    async getAIConfig(req, res) {
        try {
            const provider = req.query.provider || undefined;
            const cfg = await AIConfigService_1.AIConfigService.getActiveConfig(provider);
            res.json({ success: true, data: cfg });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Server error' });
        }
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=AdminController.js.map