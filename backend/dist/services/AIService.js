"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const AIConfig_1 = require("../models/AIConfig");
const Product_1 = require("../models/Product");
const crypto_1 = require("../utils/crypto");
class AIService {
    async processUserQuery(userMessage, userContext, currentPromotions, storeStatus, options) {
        const config = await AIConfig_1.AIConfigModel.findOne({ isActive: true }).sort({ updatedAt: -1 }).lean();
        const provider = config?.provider || 'groq';
        try {
            const response = await this.generateWithProvider(provider, userMessage, config, userContext, currentPromotions, storeStatus, options);
            return response;
        }
        catch (e) {
            const fallback = provider === 'groq' ? 'openai' : 'groq';
            try {
                const response = await this.generateWithProvider(fallback, userMessage, undefined, undefined, undefined, undefined, options);
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
    async generateWithProvider(provider, message, cfg, userContext, currentPromotions, storeStatus, options) {
        // Heurísticas: derivar términos de búsqueda dinámicamente desde tags/categorías de productos, sin sinónimos quemados
        const normalized = (message || '').toLowerCase();
        const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Extraer tokens significativos del mensaje usando stopwords desde configuración (sin datos quemados)
        const configuredStopwordsArray = Array.isArray(cfg?.stopwords)
            ? cfg.stopwords
            : [];
        const stopwords = new Set(configuredStopwordsArray.map((s) => s.toLowerCase().trim()));
        const tokens = (normalized.match(/[a-záéíóúüñ0-9]+/gi) || [])
            .map(t => t.trim())
            .filter(t => t.length >= 3 && !stopwords.has(t));
        // Consultar tags y categorías existentes en inventario activo para intersectar con tokens del usuario
        const [existingTagsRaw, existingCategoriesRaw] = await Promise.all([
            Product_1.ProductModel.distinct('tags', { isActive: true, stock: { $gt: 0 } }),
            Product_1.ProductModel.distinct('category', { isActive: true, stock: { $gt: 0 } })
        ]);
        const existingTags = existingTagsRaw
            .map(v => (typeof v === 'string' ? v : ''))
            .filter(Boolean)
            .map(v => v.toLowerCase().trim());
        const existingCategories = existingCategoriesRaw
            .map(v => (typeof v === 'string' ? v : ''))
            .filter(Boolean)
            .map(v => v.toLowerCase().trim());
        // Términos que existen en tags/categorías
        const matchedFromTags = Array.from(new Set(existingTags.filter(tag => tokens.some(t => tag.includes(t) || t.includes(tag)))));
        const matchedFromCategories = Array.from(new Set(existingCategories.filter(cat => tokens.some(t => cat.includes(t) || t.includes(cat)))));
        // Si no hay intersección, usa tokens como términos de búsqueda genéricos
        const searchTerms = (matchedFromTags.length + matchedFromCategories.length > 0)
            ? Array.from(new Set([...matchedFromTags, ...matchedFromCategories]))
            : Array.from(new Set(tokens));
        const categoryRegexParts = searchTerms.map(escapeRegex);
        const productIntentTerms = searchTerms.slice(0, 5);
        // Extraer presupuesto como número (ej: 2.500.000, 2500000, $2,5M)
        let budgetMax;
        const digitsMatch = normalized.match(/\$?\s*([\d\.\,]{4,})/);
        if (digitsMatch) {
            const raw = digitsMatch[1].replace(/\./g, '').replace(/\,/g, '');
            const parsed = Number(raw);
            if (!Number.isNaN(parsed) && parsed > 0)
                budgetMax = parsed;
        }
        // Construir filtro del inventario a partir de términos dinámicos
        const invFilter = { isActive: true, stock: { $gt: 0 } };
        const combinedRegex = categoryRegexParts.join('|');
        if (categoryRegexParts.length > 0) {
            invFilter.$or = [
                { name: { $regex: combinedRegex, $options: 'i' } },
                { brand: { $regex: combinedRegex, $options: 'i' } },
                { category: { $regex: combinedRegex, $options: 'i' } },
                { tags: { $elemMatch: { $regex: combinedRegex, $options: 'i' } } }
            ];
        }
        if (typeof budgetMax === 'number')
            invFilter.price = { $lte: budgetMax };
        // Obtener inventario filtrado (máx 25 productos)
        if (process.env.LOG_LEVEL === 'debug') {
            console.log('[AIService] InvFilter:', JSON.stringify(invFilter));
        }
        let inventory = await Product_1.ProductModel.find(invFilter)
            .select('name brand category price stock sku')
            .limit(25)
            .lean();
        // Si no hay coincidencias con presupuesto, intentar sin presupuesto, manteniendo términos
        if ((!inventory || inventory.length === 0) && categoryRegexParts.length > 0 && typeof budgetMax === 'number') {
            const fallbackFilter = {
                isActive: true,
                stock: { $gt: 0 },
                $or: [
                    { name: { $regex: combinedRegex, $options: 'i' } },
                    { brand: { $regex: combinedRegex, $options: 'i' } },
                    { category: { $regex: combinedRegex, $options: 'i' } },
                    { tags: { $elemMatch: { $regex: combinedRegex, $options: 'i' } } }
                ]
            };
            inventory = await Product_1.ProductModel.find(fallbackFilter)
                .select('name brand category price stock sku')
                .limit(25)
                .lean();
        }
        if (process.env.LOG_LEVEL === 'debug') {
            console.log('[AIService] Inventory matches:', inventory?.length || 0);
        }
        // Si no hay inventario, no llamamos al LLM. Respuesta determinística conservadora
        if (!inventory || inventory.length === 0) {
            // Respuesta determinística específica si había términos o presupuesto
            const reasonParts = [];
            if (categoryRegexParts.length > 0)
                reasonParts.push(`según los términos "${searchTerms.slice(0, 3).join('/')}${searchTerms.length > 3 ? '/…' : ''}"`);
            if (typeof budgetMax === 'number')
                reasonParts.push(`dentro del presupuesto de $${budgetMax}`);
            const reason = reasonParts.length > 0 ? ` ${reasonParts.join(' ')}` : '';
            return {
                content: `Por el momento no encuentro productos disponibles${reason}. ¿Deseas ajustar la categoría o el presupuesto, o prefieres hablar con un asesor?`,
                provider: 'rule',
                model: 'no-matches',
                suggestedProducts: [],
                followUpQuestions: [
                    '¿Quieres que busque en otra categoría?',
                    '¿Deseas ampliar el presupuesto máximo?'
                ],
            };
        }
        // Construir resumen del inventario y reglas anti-alucinación
        const total = inventory.length;
        const brandCounts = inventory.reduce((acc, p) => {
            const key = String(p.brand || 'Desconocida');
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        const brandSummary = Object.entries(brandCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([b, n]) => `- ${b}: ${n} unidad(es)`)
            .join('\n');
        const inventoryList = inventory
            .map((p) => `- ${p.name} (${p.brand}) | Categoría: ${p.category} | Precio: $${p.price} | Stock: ${p.stock} | SKU: ${p.sku}`)
            .join('\n');
        const isFirstTurn = options?.isFirstTurn !== false; // default true si no se envía
        // Bloque de clarificación configurable: hace exactamente N preguntas antes de recomendar si falta contexto
        const clarifyBeforeRecommend = cfg?.clarifyBeforeRecommend !== false;
        const clarifyMaxQuestions = typeof cfg?.clarifyMaxQuestions === 'number' ? cfg.clarifyMaxQuestions : 3;
        const clarifyBlock = clarifyBeforeRecommend
            ? `
Reglas de Clarificación (si falta contexto esencial):
- Si faltan datos clave para recomendar (al menos uno de: presupuesto máximo, uso previsto, marca preferida), primero haz EXACTAMENTE ${clarifyMaxQuestions} preguntas de desambiguación.
- Precede la respuesta con la etiqueta [DISAMBIGUATION_PROMPT] para que el sistema la trate como clarificación.
- Formula preguntas concisas y específicas, numeradas 1), 2), 3), y solicita que responda a todas en un solo mensaje.
- Asegúrate de que las preguntas estén claramente relacionadas con el producto/tema detectado a partir de estos términos: ${productIntentTerms.join(', ') || '(sin términos)'}.
- Basa las preguntas en características observables en el inventario listado (especificaciones, tamaño/capacidad, compatibilidad, accesorios, uso principal) y evita preguntas genéricas.
- No recomiendes productos hasta recibir las respuestas a estas preguntas.
`
            : '';
        let systemPrompt = `
# Makers Tech ChatBot - System Prompt (operativo)

Rol: Eres TechBot, asistente de Makers Tech. Ayudas a los clientes a encontrar productos basándote EXCLUSIVAMENTE en el inventario provisto.

Tono: Profesional y cercano. Claro y accionable.

Reglas críticas (obligatorias):
- Usa solo los datos del inventario incluido abajo. No inventes cantidades, modelos ni precios.
- Si el inventario está vacío o no hay coincidencias, dilo explícitamente.
- Si el inventario está vacío: NO sugieras tipos alternativos ni pidas presupuesto/uso. Solo ofrece notificación de disponibilidad o contacto con asesor.
- Si hay inventario pero no coincide con la solicitud, no inventes alternativas fuera del listado; puedes sugerir categorías/marcas contenidas en el inventario actual.
- Pide presupuesto, uso previsto y preferencias cuando falte contexto.
- Da precios y disponibilidad concretos solo si existen en el inventario.
- Resume brevemente y ofrece siguiente paso claro.
 - No repitas saludos. Solo saluda en el primer turno de la sesión. Si no es el primer turno, responde directo al punto sin "Hola" ni "Bienvenido".

${clarifyBlock}

Resumen del inventario actual:
- Total de productos disponibles: ${total}
${brandSummary || '- Sin marcas registradas'}

Listado de inventario (máx 25):
${inventoryList || '- (Sin productos en stock)'}

Instrucciones de respuesta:
1) Reconoce la consulta${isFirstTurn ? ' con un saludo breve' : ' sin saludar nuevamente'}.
2) Si hay stock relevante, sugiere 1-3 opciones concretas del listado con razón breve.
3) Si no hay stock, indícalo y propone alternativas (otras categorías/marcas, aviso de disponibilidad, hablar con agente).
4) Haz una pregunta de seguimiento útil (presupuesto, uso, marca preferida).

Ahora responde a la consulta del usuario: "${message}"
`;
        try {
            // Normalizar configuración desde AIConfig
            const normalized = {
                apiKey: (0, crypto_1.decrypt)(cfg?.apiKey ||
                    (provider === 'groq' ? process.env.GROQ_API_KEY : process.env.OPENAI_API_KEY) ||
                    ''),
                model: cfg?.modelName ||
                    (provider === 'groq' ? 'llama3-8b-8192' : 'gpt-3.5-turbo'),
                temperature: typeof cfg?.temperature === 'number' ? cfg.temperature : 0.7,
                maxTokens: typeof cfg?.maxTokens === 'number' ? cfg.maxTokens : 1000,
            };
            if (!normalized.apiKey) {
                throw new Error(`API key no configurada para proveedor ${provider}`);
            }
            if (provider === 'groq') {
                return await this.generateWithGroq(systemPrompt, message, normalized.apiKey, normalized.model, normalized.temperature, normalized.maxTokens, options?.history);
            }
            else if (provider === 'openai') {
                return await this.generateWithOpenAI(systemPrompt, message, normalized.apiKey, normalized.model, normalized.temperature, normalized.maxTokens, options?.history);
            }
            throw new Error(`Provider no soportado: ${provider}`);
        }
        catch (error) {
            console.error(`Error generando respuesta con ${provider}:`, error);
            throw error;
        }
    }
    async generateWithGroq(systemPrompt, userMessage, apiKey, model, temperature, maxTokens, history) {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...(history || []).slice(-8),
                    { role: 'user', content: userMessage }
                ],
                temperature,
                max_tokens: maxTokens,
                stream: false
            })
        });
        if (!response.ok) {
            throw new Error(`Error de Groq API: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const content = data.choices[0]?.message?.content || 'No se pudo generar respuesta';
        return {
            content,
            tokensUsed: data.usage?.total_tokens,
            provider: 'groq',
            model,
            suggestedProducts: [],
            followUpQuestions: []
        };
    }
    async generateWithOpenAI(systemPrompt, userMessage, apiKey, model, temperature, maxTokens, history) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...(history || []).slice(-8),
                    { role: 'user', content: userMessage }
                ],
                temperature,
                max_tokens: maxTokens,
                stream: false
            })
        });
        if (!response.ok) {
            throw new Error(`Error de OpenAI API: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const content = data.choices[0]?.message?.content || 'No se pudo generar respuesta';
        return {
            content,
            tokensUsed: data.usage?.total_tokens,
            provider: 'openai',
            model,
            suggestedProducts: [],
            followUpQuestions: []
        };
    }
}
exports.AIService = AIService;
//# sourceMappingURL=AIService.js.map