"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
class AIService {
    constructor() {
        this.activeProvider = 'groq';
        this.fallbackProvider = 'openai';
    }
    async processUserQuery(userMessage) {
        try {
            const response = await this.generateWithProvider(this.activeProvider, userMessage);
            return response;
        }
        catch (e) {
            try {
                const response = await this.generateWithProvider(this.fallbackProvider, userMessage);
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
    // Simulación básica de providers para MVP
    async generateWithProvider(provider, message) {
        const prefix = provider === 'groq' ? '[Groq]' : '[OpenAI]';
        // Aquí se integrará la llamada real a la API
        return {
            content: `${prefix} Respuesta a: ${message}`,
            provider,
            model: provider === 'groq' ? 'mixtral-8x7b-32768' : 'gpt-3.5-turbo',
            suggestedProducts: [],
            followUpQuestions: ['¿Te interesa alguna marca en particular?', '¿Cuál es tu presupuesto aprox.?'],
        };
    }
}
exports.AIService = AIService;
//# sourceMappingURL=AIService.js.map