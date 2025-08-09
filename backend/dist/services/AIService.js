"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const AIConfig_1 = require("../models/AIConfig");
const Product_1 = require("../models/Product");
const crypto_1 = require("../utils/crypto");
class AIService {
    async processUserQuery(userMessage) {
        const config = await AIConfig_1.AIConfigModel.findOne({ isActive: true }).sort({ updatedAt: -1 }).lean();
        const provider = config?.provider || 'groq';
        try {
            const response = await this.generateWithProvider(provider, userMessage, config);
            return response;
        }
        catch (e) {
            const fallback = provider === 'groq' ? 'openai' : 'groq';
            try {
                const response = await this.generateWithProvider(fallback, userMessage, undefined);
                return response;
            }
            catch {
                return {
                    content: 'Lo siento, estoy experimentando problemas técnicos. Por favor, intenta más tarde.',
                    provider: 'emergency',
                    model: 'fallback',
                    suggestedProducts: [],
                    followUpQuestions: [],
                };
            }
        }
    }
    async generateWithProvider(provider, message, cfg) {
        // Obtener inventario básico para contexto (máx 25 productos)
        const inventory = await Product_1.ProductModel.find({ isActive: true, stock: { $gt: 0 } })
            .select('name brand category price stock sku')
            .limit(25)
            .lean();
        const systemPrompt = [
            'Eres TechBot, el asistente virtual de Makers Tech.',
            'Reglas cruciales:',
            '- Usa EXCLUSIVAMENTE el inventario proporcionado para hablar de productos, stock y precios.',
            '- Si algo no está en el inventario, dilo claramente y ofrece alternativas del inventario.',
            '- Evita alucinar categorías o servicios que no existan en el inventario.',
            '- Desambiguación obligatoria: si el usuario usa términos ambiguos ("soporte", "base", "stand", "cargador", "adaptador", "cable"), primero pregunta: "¿Te refieres a soporte técnico/servicio o a un soporte físico/accesorio?" y procede según su respuesta.',
            '- Si el usuario busca accesorios y no hay accesorios en el inventario actual, indícalo y ofrece registrar una alerta o ver opciones alternativas de la misma marca.',
            '- Da respuestas breves, con listas claras y precios/stock cuando aplique.',
            `INVENTARIO ACTUAL (${inventory.length}): ${JSON.stringify(inventory)}`,
        ].join('\n');
        if (provider === 'groq' && cfg?.apiKey) {
            const apiKey = (0, crypto_1.decrypt)(cfg.apiKey);
            const model = cfg.modelName || 'llama-3.1-8b-instant';
            const body = {
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message },
                ],
                max_tokens: cfg.maxTokens ?? 500,
                temperature: cfg.temperature ?? 0.7,
                stream: false,
            };
            const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            if (!resp.ok)
                throw new Error(`Groq API error: ${resp.status}`);
            const data = await resp.json();
            return {
                content: data?.choices?.[0]?.message?.content || '',
                tokensUsed: data?.usage?.total_tokens,
                provider: 'groq',
                model,
                suggestedProducts: [],
                followUpQuestions: [],
            };
        }
        if (provider === 'openai' && cfg?.apiKey) {
            const apiKey = (0, crypto_1.decrypt)(cfg.apiKey);
            const model = cfg.modelName || 'gpt-3.5-turbo';
            const body = {
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message },
                ],
                max_tokens: cfg.maxTokens ?? 500,
                temperature: cfg.temperature ?? 0.7,
                stream: false,
            };
            const resp = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            if (!resp.ok)
                throw new Error(`OpenAI API error: ${resp.status}`);
            const data = await resp.json();
            return {
                content: data?.choices?.[0]?.message?.content || '',
                tokensUsed: data?.usage?.total_tokens,
                provider: 'openai',
                model,
                suggestedProducts: [],
                followUpQuestions: [],
            };
        }
        // Si no hay configuración válida, respuesta mínima para no caer en error
        const prefix = provider === 'groq' ? '[Groq]' : '[OpenAI]';
        return {
            content: `${prefix} Respuesta a: ${message}`,
            provider,
            model: cfg?.modelName || (provider === 'groq' ? 'llama-3.1-8b-instant' : 'gpt-3.5-turbo'),
            suggestedProducts: [],
            followUpQuestions: ['¿Te interesa alguna marca en particular?', '¿Cuál es tu presupuesto aprox.?'],
        };
    }
}
exports.AIService = AIService;
//# sourceMappingURL=AIService.js.map