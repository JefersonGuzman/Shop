"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSessionModel = void 0;
const mongoose_1 = require("mongoose");
const chatSessionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: false },
    sessionId: { type: String, required: true, unique: true },
    messages: [
        {
            role: { type: String, enum: ['user', 'assistant'], required: true },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
            metadata: {
                productsReferenced: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Product' }],
                actionType: {
                    type: String,
                    enum: ['search', 'recommendation', 'comparison', 'info', 'general'],
                },
                confidence: { type: Number, min: 0, max: 1 },
                processingTime: Number,
            },
        },
    ],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
chatSessionSchema.index({ userId: 1, createdAt: -1 });
chatSessionSchema.index({ sessionId: 1 });
chatSessionSchema.index({ isActive: 1 });
exports.ChatSessionModel = (0, mongoose_1.model)('ChatSession', chatSessionSchema);
//# sourceMappingURL=ChatSession.js.map