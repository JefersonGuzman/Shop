"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const chat_1 = require("../schemas/chat");
const AIService_1 = require("../services/AIService");
const ChatSession_1 = require("../models/ChatSession");
const aiService = new AIService_1.AIService();
class ChatController {
    async processMessage(req, res) {
        try {
            const { message, sessionId } = chat_1.ChatMessageSchema.parse(req.body);
            const start = Date.now();
            // Obtener o crear sesión
            let session = await ChatSession_1.ChatSessionModel.findOne({ sessionId });
            if (!session) {
                session = await ChatSession_1.ChatSessionModel.create({ sessionId, messages: [], isActive: true });
            }
            // Guardar mensaje del usuario
            session.messages.push({ role: 'user', content: message, timestamp: new Date() });
            // Generar respuesta de IA
            const response = await aiService.processUserQuery(message);
            // Guardar respuesta
            session.messages.push({
                role: 'assistant',
                content: response.content,
                timestamp: new Date(),
                metadata: { productsReferenced: [], actionType: 'general', confidence: 0.7, processingTime: Date.now() - start },
            });
            await session.save();
            res.json({ success: true, data: { response: response.content, suggestedProducts: response.suggestedProducts, followUpQuestions: response.followUpQuestions, sessionId } });
        }
        catch (error) {
            res.status(400).json({ error: error.message || 'Bad request' });
        }
    }
    async getHistory(req, res) {
        const sessionId = String(req.query.sessionId || '');
        if (!sessionId) {
            res.status(400).json({ error: 'sessionId requerido' });
            return;
        }
        const session = await ChatSession_1.ChatSessionModel.findOne({ sessionId });
        res.json({ success: true, data: session?.messages ?? [] });
    }
}
exports.ChatController = ChatController;
//# sourceMappingURL=ChatController.js.map