import { z } from 'zod';

export const AIConfigSchema = z.object({
  provider: z.enum(['groq', 'openai']),
  apiKey: z.string().min(1, 'API Key requerida'),
  modelName: z.string().min(1, 'Nombre de modelo requerido'),
  maxTokens: z.number().min(1).max(32000).default(500),
  temperature: z.number().min(0).max(2).default(0.7),
});

export type AIConfigDTO = z.infer<typeof AIConfigSchema>;


