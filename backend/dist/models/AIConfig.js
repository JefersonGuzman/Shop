"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIConfigModel = void 0;
const mongoose_1 = require("mongoose");
const aiConfigSchema = new mongoose_1.Schema({
    provider: { type: String, enum: ['groq', 'openai'], required: true },
    apiKey: { type: String, required: true },
    modelName: { type: String, required: true },
    maxTokens: { type: Number, default: 500 },
    temperature: { type: Number, default: 0.7 },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['active', 'inactive', 'error'], default: 'inactive' },
    stopwords: { type: [String], default: [] },
    clarifyBeforeRecommend: { type: Boolean, default: true },
    clarifyMaxQuestions: { type: Number, default: 3 },
}, { timestamps: true });
aiConfigSchema.index({ provider: 1, isActive: 1 });
exports.AIConfigModel = (0, mongoose_1.model)('AIConfig', aiConfigSchema);
//# sourceMappingURL=AIConfig.js.map