// services/ai/openaiService.ts
import type { LLMProvider, LLMResponse, LLMConfig } from '@/types/ai';

export class OpenAIProvider implements LLMProvider {
  private config: LLMConfig;
  private baseURL = 'https://api.openai.com/v1';

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async generateResponse(prompt: string, context?: any): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.modelName || 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: prompt
            }
          ],
          max_tokens: this.config.maxTokens || 500,
          temperature: this.config.temperature || 0.7,
          stream: false
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API Error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0].message.content,
        tokensUsed: data.usage.total_tokens,
        model: this.config.modelName || 'gpt-3.5-turbo',
        provider: 'openai',
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        }
      };
    } catch (error) {
      console.error('OpenAI Provider Error:', error);
      throw new Error(`OpenAI failed: ${error.message}`);
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string; latency?: number }> {
    const startTime = Date.now();
    try {
      const testPrompt = 'Responde solo con "OK" si puedes leer este mensaje.';
      const response = await this.generateResponse(testPrompt);
      const latency = Date.now() - startTime;
      
      return {
        success: response.content.includes('OK'),
        message: 'Conexión exitosa con OpenAI',
        latency
      };
    } catch (error) {
      return {
        success: false,
        message: `Error de conexión: ${error.message}`
      };
    }
  }

  async getUsageStats(): Promise<any> {
    // Implementar llamada a API de usage de OpenAI si es necesario
    return {
      currentMonth: 0,
      limit: 'Unlimited',
      resetDate: null
    };
  }

  updateConfig(config: LLMConfig): void {
    this.config = { ...this.config, ...config };
  }
}

// services/ai/groqService.ts
export class GroqProvider implements LLMProvider {
  private config: LLMConfig;
  private baseURL = 'https://api.groq.com/openai/v1';

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async generateResponse(prompt: string, context?: any): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.modelName || 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: prompt
            }
          ],
          max_tokens: this.config.maxTokens || 500,
          temperature: this.config.temperature || 0.7,
          stream: false
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Groq API Error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0].message.content,
        tokensUsed: data.usage.total_tokens,
        model: this.config.modelName || 'mixtral-8x7b-32768',
        provider: 'groq',
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        }
      };
    } catch (error) {
      console.error('Groq Provider Error:', error);
      throw new Error(`Groq failed: ${error.message}`);
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string; latency?: number }> {
    const startTime = Date.now();
    try {
      const testPrompt = 'Responde solo con "OK" si puedes leer este mensaje.';
      const response = await this.generateResponse(testPrompt);
      const latency = Date.now() - startTime;
      
      return {
        success: response.content.includes('OK'),
        message: 'Conexión exitosa con Groq',
        latency
      };
    } catch (error) {
      return {
        success: false,
        message: `Error de conexión: ${error.message}`
      };
    }
  }

  async getUsageStats(): Promise<any> {
    // Groq tiene límites de requests per minute
    return {
      currentMonth: 0,
      limit: '30 requests/minute',
      resetDate: null
    };
  }

  updateConfig(config: LLMConfig): void {
    this.config = { ...this.config, ...config };
  }
}

// services/ai/aiService.ts - Servicio principal con fallback
export class AIService {
  private providers: Map<string, LLMProvider> = new Map();
  private activeProvider: string = 'groq';
  private fallbackProvider: string = 'openai';

  constructor() {
    // Inicializar providers vacíos
    this.providers.set('groq', new GroqProvider({ apiKey: '', modelName: '', maxTokens: 500, temperature: 0.7 }));
    this.providers.set('openai', new OpenAIProvider({ apiKey: '', modelName: '', maxTokens: 500, temperature: 0.7 }));
  }

  async processUserQuery(
    userMessage: string,
    userId?: string,
    sessionId: string = 'default'
  ): Promise<LLMResponse & { suggestedProducts?: string[]; followUpQuestions?: string[] }> {
    try {
      // Obtener contexto del inventario y usuario
      const inventory = await this.getInventoryContext();
      const userContext = userId ? await this.getUserContext(userId) : null;
      const chatHistory = await this.getChatHistory(sessionId);

      // Construir prompt completo
      const fullPrompt = this.buildPrompt({
        userMessage,
        inventory,
        userContext,
        chatHistory
      });

      // Intentar con provider activo
      const provider = this.providers.get(this.activeProvider);
      if (!provider) {
        throw new Error(`Provider ${this.activeProvider} not configured`);
      }

      const response = await provider.generateResponse(fullPrompt);

      // Procesar respuesta para extraer productos referenciados
      const processed = await this.processResponse(response, inventory);

      // Guardar en historial
      await this.saveChatMessage(sessionId, userMessage, processed, userId);

      return processed;
    } catch (error) {
      console.error(`Error with ${this.activeProvider}, trying fallback...`);
      
      // Intentar con fallback provider
      try {
        const fallbackProvider = this.providers.get(this.fallbackProvider);
        if (fallbackProvider) {
          const response = await fallbackProvider.generateResponse(this.buildSimplePrompt(userMessage));
          return response;
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }

      // Respuesta de emergencia si todo falla
      return {
        content: 'Lo siento, estoy experimentando problemas técnicos. Por favor, intenta reformular tu pregunta.',
        tokensUsed: 0,
        model: 'fallback',
        provider: 'emergency',
        confidence: 0
      };
    }
  }

  private buildPrompt(context: {
    userMessage: string;
    inventory: any;
    userContext: any;
    chatHistory: any[];
  }): string {
    const systemPrompt = `Eres TechBot, el asistente virtual de Makers Tech...`; // Tu system prompt aquí
    
    return `${systemPrompt}

INVENTARIO ACTUAL (${context.inventory.products?.length || 0} productos):
${JSON.stringify(context.inventory, null, 2)}

${context.userContext ? `PREFERENCIAS DEL USUARIO:
${JSON.stringify(context.userContext.preferences, null, 2)}` : ''}

HISTORIAL RECIENTE:
${context.chatHistory.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

CONSULTA: ${context.userMessage}

Responde como TechBot manteniendo tu personalidad profesional pero amigable:`;
  }

  async configureProvider(
    provider: 'groq' | 'openai',
    config: LLMConfig
  ): Promise<{ success: boolean; message: string }> {
    try {
      const providerInstance = provider === 'groq' 
        ? new GroqProvider(config)
        : new OpenAIProvider(config);

      // Probar conexión
      const testResult = await providerInstance.testConnection();
      
      if (testResult.success) {
        this.providers.set(provider, providerInstance);
        return {
          success: true,
          message: `${provider} configurado exitosamente`
        };
      } else {
        return {
          success: false,
          message: testResult.message
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error configurando ${provider}: ${error.message}`
      };
    }
  }

  async switchActiveProvider(provider: 'groq' | 'openai'): Promise<boolean> {
    if (this.providers.has(provider)) {
      this.activeProvider = provider;
      this.fallbackProvider = provider === 'groq' ? 'openai' : 'groq';
      return true;
    }
    return false;
  }

  // Métodos auxiliares que necesitas implementar
  private async getInventoryContext(): Promise<any> {
    // Conectar con ProductService para obtener inventario
    return { products: [], lastUpdated: new Date() };
  }

  private async getUserContext(userId: string): Promise<any> {
    // Obtener preferencias del usuario desde DB
    return null;
  }

  private async getChatHistory(sessionId: string): Promise<any[]> {
    // Obtener historial de chat desde DB
    return [];
  }

  private async saveChatMessage(sessionId: string, userMessage: string, response: any, userId?: string): Promise<void> {
    // Guardar mensaje en base de datos
  }

  private async processResponse(response: LLMResponse, inventory: any): Promise<any> {
    // Extraer productos referenciados y generar follow-up questions
    return {
      ...response,
      suggestedProducts: [],
      followUpQuestions: []
    };
  }

  private buildSimplePrompt(message: string): string {
    return `Como asistente de Makers Tech, responde brevemente a: ${message}`;
  }
}