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
    storeStatus?: any,
    options?: {
      history?: { role: 'user' | 'assistant'; content: string }[];
      isFirstTurn?: boolean;
    }
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
        storeStatus,
        options
      );
      return response;
    } catch (e) {
      const fallback: 'groq' | 'openai' = provider === 'groq' ? 'openai' : 'groq';
      try {
        const response = await this.generateWithProvider(fallback, userMessage, undefined, undefined, undefined, undefined, options);
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
    storeStatus?: any,
    options?: {
      history?: { role: 'user' | 'assistant'; content: string }[];
      isFirstTurn?: boolean;
    }
  ): Promise<LLMResponse> {
    // Heurísticas: derivar términos de búsqueda dinámicamente desde tags/categorías de productos, sin sinónimos quemados
    const normalized = (message || '').toLowerCase();
    
    const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Extraer tokens significativos del mensaje (español)
    const stopwords = new Set<string>([
      'hola','buenas','quiero','busco','necesito','me','para','por','de','del','la','el','los','las','un','una','unos','unas','que','con','sin','en','y','o','u','mi','su','sus','mis','tengo','hay','cual','cuál','cuales','cuáles','cualquier','como','cómo','mas','más','menos','segun','según','sobre','esto','ese','esa','este','estas','estos','esas','esos','uso','usar','sirve','sirven','nuevo','nueva','nuevos','nuevas','barato','barata','baratos','baratas','baratito','costoso','caro','cara','caros','caras','precio','presupuesto','maximo','máximo','hasta','aprox','aproximadamente','alrededor','entre','debo','podria','podría','ayuda','ayudame','ayúdame','ver','mostrar','muéstrame','muestrame'
    ]);
    const tokens = (normalized.match(/[a-záéíóúüñ0-9]+/gi) || [])
      .map(t => t.trim())
      .filter(t => t.length >= 3 && !stopwords.has(t));

    // Consultar tags y categorías existentes en inventario activo para intersectar con tokens del usuario
    const [existingTagsRaw, existingCategoriesRaw] = await Promise.all([
      ProductModel.distinct('tags', { isActive: true, stock: { $gt: 0 } }),
      ProductModel.distinct('category', { isActive: true, stock: { $gt: 0 } })
    ]);

    const existingTags = (existingTagsRaw as unknown[])
      .map(v => (typeof v === 'string' ? v : ''))
      .filter(Boolean)
      .map(v => v.toLowerCase().trim());
    const existingCategories = (existingCategoriesRaw as unknown[])
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
    
    const categoryRegexParts: string[] = searchTerms.map(escapeRegex);

    // Extraer presupuesto como número (ej: 2.500.000, 2500000, $2,5M)
    let budgetMax: number | undefined;
    const digitsMatch = normalized.match(/\$?\s*([\d\.\,]{4,})/);
    if (digitsMatch) {
      const raw = digitsMatch[1].replace(/\./g, '').replace(/\,/g, '');
      const parsed = Number(raw);
      if (!Number.isNaN(parsed) && parsed > 0) budgetMax = parsed;
    }

    // Construir filtro del inventario a partir de términos dinámicos
    const invFilter: Record<string, unknown> = { isActive: true, stock: { $gt: 0 } };
    const combinedRegex = categoryRegexParts.join('|');
    if (categoryRegexParts.length > 0) {
      (invFilter as any).$or = [
        { name: { $regex: combinedRegex, $options: 'i' } },
        { brand: { $regex: combinedRegex, $options: 'i' } },
        { category: { $regex: combinedRegex, $options: 'i' } },
        { tags: { $elemMatch: { $regex: combinedRegex, $options: 'i' } } }
      ];
    }
    if (typeof budgetMax === 'number') invFilter.price = { $lte: budgetMax };

    // Obtener inventario filtrado (máx 25 productos)
    if (process.env.LOG_LEVEL === 'debug') {
      console.log('[AIService] InvFilter:', JSON.stringify(invFilter));
    }

    let inventory = await ProductModel.find(invFilter)
      .select('name brand category price stock sku')
      .limit(25)
      .lean();

    // Si no hay coincidencias con presupuesto, intentar sin presupuesto, manteniendo términos
    if ((!inventory || inventory.length === 0) && categoryRegexParts.length > 0 && typeof budgetMax === 'number') {
      const fallbackFilter: Record<string, unknown> = {
        isActive: true,
        stock: { $gt: 0 },
        $or: [
          { name: { $regex: combinedRegex, $options: 'i' } },
          { brand: { $regex: combinedRegex, $options: 'i' } },
          { category: { $regex: combinedRegex, $options: 'i' } },
          { tags: { $elemMatch: { $regex: combinedRegex, $options: 'i' } } }
        ]
      } as any;
      inventory = await ProductModel.find(fallbackFilter)
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
      const reasonParts: string[] = [];
      if (categoryRegexParts.length > 0) reasonParts.push(`según los términos "${searchTerms.slice(0, 3).join('/')}${searchTerms.length > 3 ? '/…' : ''}"`);
      if (typeof budgetMax === 'number') reasonParts.push(`dentro del presupuesto de $${budgetMax}`);
      const reason = reasonParts.length > 0 ? ` ${reasonParts.join(' ')}` : '';
      return {
        content:
          `Por el momento no encuentro productos disponibles${reason}. ¿Deseas ajustar la categoría o el presupuesto, o prefieres hablar con un asesor?`,
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

    const isFirstTurn = options?.isFirstTurn !== false; // default true si no se envía

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
        return await this.generateWithGroq(systemPrompt, message, normalized.apiKey, normalized.model, normalized.temperature, normalized.maxTokens, options?.history);
      } else if (provider === 'openai') {
        return await this.generateWithOpenAI(systemPrompt, message, normalized.apiKey, normalized.model, normalized.temperature, normalized.maxTokens, options?.history);
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
    maxTokens: number,
    history?: { role: 'user' | 'assistant'; content: string }[]
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

    const data = await response.json() as any;
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
    maxTokens: number,
    history?: { role: 'user' | 'assistant'; content: string }[]
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

    const data = await response.json() as any;
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


