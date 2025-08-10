import { z } from 'zod';

export const AIConfigSchema = z.object({
  provider: z.enum(['groq', 'openai']),
  apiKey: z.string().min(1, 'API Key requerida'),
  modelName: z.string().min(1, 'Nombre de modelo requerido'),
  maxTokens: z.number().min(1).max(32000).default(500),
  temperature: z.number().min(0).max(2).default(0.7),
});

export type AIConfigDTO = z.infer<typeof AIConfigSchema>;

// ----- Admin: Users -----
export const AdminCreateEmployeeSchema = z.object({
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Password mínimo 6 caracteres'),
});

export const AdminUpdateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'employee', 'customer']).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

export type AdminCreateEmployeeDTO = z.infer<typeof AdminCreateEmployeeSchema>;
export type AdminUpdateUserDTO = z.infer<typeof AdminUpdateUserSchema>;



