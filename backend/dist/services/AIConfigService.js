"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIConfigService = void 0;
const AIConfig_1 = require("../models/AIConfig");
const crypto_1 = require("../utils/crypto");
class AIConfigService {
    static async upsertConfig(params) {
        const encryptedKey = (0, crypto_1.encrypt)(params.apiKey);
        await AIConfig_1.AIConfigModel.updateMany({ provider: params.provider, isActive: true }, { isActive: false });
        await AIConfig_1.AIConfigModel.create({
            provider: params.provider,
            apiKey: encryptedKey,
            modelName: params.modelName,
            maxTokens: params.maxTokens ?? 500,
            temperature: params.temperature ?? 0.7,
            isActive: true,
            status: 'active',
            stopwords: params.stopwords ?? [],
            clarifyBeforeRecommend: params.clarifyBeforeRecommend ?? true,
            clarifyMaxQuestions: params.clarifyMaxQuestions ?? 3,
        });
    }
    static async getActiveConfig(provider) {
        const query = provider ? { provider, isActive: true } : { isActive: true };
        const doc = await AIConfig_1.AIConfigModel.findOne(query).sort({ updatedAt: -1 }).lean();
        if (!doc)
            return null;
        return {
            provider: doc.provider,
            modelName: doc.modelName,
            maxTokens: doc.maxTokens,
            temperature: doc.temperature,
            // No retornamos apiKey por seguridad
            hasKey: Boolean(doc.apiKey),
        };
    }
}
exports.AIConfigService = AIConfigService;
//# sourceMappingURL=AIConfigService.js.map