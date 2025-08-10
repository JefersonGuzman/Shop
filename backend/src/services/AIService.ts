import { AIConfigModel } from '../models/AIConfig';
import { ProductModel } from '../models/Product';
import { decrypt } from '../utils/crypto';

type LLMResponse = {
  content: string;
  tokensUsed?: number;
  provider: string;
  model: string;
  suggestedProducts?: string[];
  followUpQuestions?: string[];
};

export class AIService {
  async processUserQuery(
    userMessage: string,
    userContext?: any,
    currentPromotions?: any,
    storeStatus?: any
  ): Promise<LLMResponse> {
    const config = await AIConfigModel.findOne({ isActive: true }).sort({ updatedAt: -1 }).lean();
    const provider: 'groq' | 'openai' = (config?.provider as any) || 'groq';
    
    try {
      const response = await this.generateWithProvider(
        provider,
        userMessage,
        config,
        userContext,
        currentPromotions,
        storeStatus
      );
      return response;
    } catch (e) {
      const fallback: 'groq' | 'openai' = provider === 'groq' ? 'openai' : 'groq';
      try {
        const response = await this.generateWithProvider(fallback, userMessage, undefined);
        return response;
      } catch {
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

  private async generateWithProvider(
    provider: 'groq' | 'openai',
    message: string,
    cfg?: any,
    userContext?: any,
    currentPromotions?: any,
    storeStatus?: any
  ): Promise<LLMResponse> {
    // Obtener inventario básico para contexto (máx 25 productos)
    const inventory = await ProductModel.find({ isActive: true, stock: { $gt: 0 } })
      .select('name brand category price stock sku')
      .limit(25)
      .lean();

    // Si no hay inventario, no llamamos al LLM. Respuesta determinística conservadora
    if (!inventory || inventory.length === 0) {
      return {
        content:
          'Por el momento no tenemos productos disponibles en stock. Puedo notificarte cuando repongamos el inventario o ponerte en contacto con un asesor para tomar tus datos. ¿Quieres que te avise cuando haya disponibilidad?',
        provider: 'rule',
        model: 'no-inventory',
        suggestedProducts: [],
        followUpQuestions: [
          '¿Deseas que te notifique cuando haya stock?',
        ],
      };
    }

    // Construir resumen del inventario y reglas anti-alucinación
    const total = inventory.length;
    const brandCounts = inventory.reduce<Record<string, number>>((acc, p: any) => {
      const key = String(p.brand || 'Desconocida');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const brandSummary = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([b, n]) => `- ${b}: ${n} unidad(es)`) 
      .join('\n');

    const inventoryList = inventory
      .map(
        (p: any) => `- ${p.name} (${p.brand}) | Categoría: ${p.category} | Precio: $${p.price} | Stock: ${p.stock} | SKU: ${p.sku}`
      )
      .join('\n');

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

Resumen del inventario actual:
- Total de productos disponibles: ${total}
${brandSummary || '- Sin marcas registradas'}

Listado de inventario (máx 25):
${inventoryList || '- (Sin productos en stock)'}

Instrucciones de respuesta:
1) Reconoce la consulta.
2) Si hay stock relevante, sugiere 1-3 opciones concretas del listado con razón breve.
3) Si no hay stock, indícalo y propone alternativas (otras categorías/marcas, aviso de disponibilidad, hablar con agente).
4) Haz una pregunta de seguimiento útil (presupuesto, uso, marca preferida).

Ahora responde a la consulta del usuario: "${message}"
`;

    try {
      // Normalizar configuración desde AIConfig
      const normalized = {
        apiKey: decrypt(
          (cfg?.apiKey as string | undefined) ||
            (provider === 'groq' ? process.env.GROQ_API_KEY : process.env.OPENAI_API_KEY) ||
            ''
        ),
        model:
          (cfg?.modelName as string | undefined) ||
          (provider === 'groq' ? 'llama3-8b-8192' : 'gpt-3.5-turbo'),
        temperature: typeof cfg?.temperature === 'number' ? cfg.temperature : 0.7,
        maxTokens: typeof cfg?.maxTokens === 'number' ? cfg.maxTokens : 1000,
      } as const;

      if (!normalized.apiKey) {
        throw new Error(`API key no configurada para proveedor ${provider}`);
      }

      if (provider === 'groq') {
        return await this.generateWithGroq(systemPrompt, message, normalized.apiKey, normalized.model, normalized.temperature, normalized.maxTokens);
      } else if (provider === 'openai') {
        return await this.generateWithOpenAI(systemPrompt, message, normalized.apiKey, normalized.model, normalized.temperature, normalized.maxTokens);
      }

      throw new Error(`Provider no soportado: ${provider}`);
    } catch (error) {
      console.error(`Error generando respuesta con ${provider}:`, error);
      throw error;
    }
  }

  private async generateWithGroq(
    systemPrompt: string,
    userMessage: string,
    apiKey: string,
    model: string,
    temperature: number,
    maxTokens: number
  ): Promise<LLMResponse> {
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

  private async generateWithOpenAI(
    systemPrompt: string,
    userMessage: string,
    apiKey: string,
    model: string,
    temperature: number,
    maxTokens: number
  ): Promise<LLMResponse> {
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


