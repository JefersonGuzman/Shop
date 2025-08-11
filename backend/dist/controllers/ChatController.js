"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const ChatSession_1 = require("../models/ChatSession");
const User_1 = require("../models/User"); // Import UserModel
const chat_1 = require("../schemas/chat");
const AIService_1 = require("../services/AIService");
const aiService = new AIService_1.AIService();
class ChatController {
    async processMessage(req, res) {
        try {
            const { message, sessionId } = chat_1.ChatMessageSchema.parse(req.body);
            const start = Date.now();
            let userContext = null;
            if (req.user && req.user.id) { // Assuming req.user is populated by auth middleware
                const user = await User_1.UserModel.findById(req.user.id).lean();
                if (user) {
                    userContext = {
                        userId: user._id,
                        isLoggedIn: true,
                        preferences: user.preferences || {}, // Assuming user has preferences
                        history: user.purchaseHistory || [], // Assuming user has purchaseHistory
                    };
                }
            }
            // Placeholder for currentPromotions and storeStatus
            const currentPromotions = {
                activeOffers: [],
                discounts: {},
            };
            const storeStatus = {
                isOpen: true,
                deliveryInfo: 'Envío gratis en compras >$100',
                supportHours: 'Lun-Sáb 9AM-8PM, Dom 10AM-6PM',
            };
            // Obtener o crear sesión
            let session = await ChatSession_1.ChatSessionModel.findOne({ sessionId });
            if (!session) {
                session = await ChatSession_1.ChatSessionModel.create({ sessionId, messages: [], isActive: true });
            }
            // Guardar mensaje del usuario
            session.messages.push({ role: 'user', content: message, timestamp: new Date() });
            // --- Lógica de Desambiguación Mejorada ---
            const lastAssistant = [...session.messages].reverse().find((m) => m.role === 'assistant');
            const askedDisambiguation = lastAssistant?.metadata?.actionType === 'disambiguation_prompt';
            const normalized = message.trim().toLowerCase();
            // Si el asistente pidió desambiguación y el usuario da una respuesta corta, forzar una pregunta estructurada.
            const isAffirmationOnly = ['si', 'sí', 'no', 'ok', 'vale', 'seguro', 'claro'].includes(normalized);
            if (askedDisambiguation && isAffirmationOnly) {
                const forcedReply = 'Para ayudarte mejor, elige una opción: 1) Soporte técnico/servicio para tu MacBook, 2) Soporte físico/accesorio (base/stand). Responde con 1 o 2.';
                // Guardamos la pregunta forzada del asistente con metadatos claros
                session.messages.push({
                    role: 'assistant',
                    content: forcedReply,
                    timestamp: new Date(),
                    metadata: { actionType: 'disambiguation_prompt' }
                });
                await session.save();
                res.json({ success: true, data: { response: forcedReply, suggestedProducts: [], followUpQuestions: [], sessionId } });
                return;
            }
            // Si venimos de una pregunta de desambiguación, enriquecer la consulta para la IA.
            let effectiveMessage = message;
            if (askedDisambiguation) {
                const mentionsTech = /(técnic|tecnic|servicio|1)/i.test(message);
                const mentionsAccessory = /(accesori|físic|fisic|stand|base|soporte físico|2)/i.test(message);
                if (mentionsTech) {
                    effectiveMessage = 'El usuario ha elegido la opción de "soporte técnico/servicio para su MacBook (diagnóstico/reparación)".';
                }
                else if (mentionsAccessory) {
                    effectiveMessage = 'El usuario ha elegido la opción de "soporte físico/accesorio (base/stand) para su MacBook". Procede a verificar el inventario.';
                }
            }
            // Generar respuesta de IA con contexto de historial para evitar saludos repetidos
            const isFirstTurn = (session.messages.filter(m => m.role === 'assistant').length === 0);
            const response = await aiService.processUserQuery(effectiveMessage, userContext, currentPromotions, storeStatus, {
                history: session.messages.map(m => ({ role: m.role, content: m.content })),
                isFirstTurn
            });
            // Revisar si la IA está pidiendo desambiguación y limpiar el tag
            let responseContent = response.content;
            let responseActionType = 'general';
            if (response.content.includes('[DISAMBIGUATION_PROMPT]')) {
                responseContent = response.content.replace('[DISAMBIGUATION_PROMPT]', '').trim();
                responseActionType = 'disambiguation_prompt';
            }
            // Evitar saludos repetidos en turnos posteriores
            const assistantCount = session.messages.filter(m => m.role === 'assistant').length;
            if (assistantCount > 0) {
                responseContent = responseContent.replace(/^(\s*)(hola|¡hola|buenas|buenos días|buenas tardes|bienvenido[a]?|bienvenid[oa]s)[!¡,\.\s]*/i, '$1');
                responseContent = responseContent.trimStart();
            }
            // Guardar respuesta del asistente
            session.messages.push({
                role: 'assistant',
                content: responseContent,
                timestamp: new Date(),
                metadata: {
                    productsReferenced: [],
                    actionType: responseActionType,
                    confidence: 0.7,
                    processingTime: Date.now() - start
                },
            });
            await session.save();
            res.json({ success: true, data: { response: responseContent, suggestedProducts: response.suggestedProducts, followUpQuestions: response.followUpQuestions, sessionId } });
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