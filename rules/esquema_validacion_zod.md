// schemas/auth.ts
import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Password debe tener al menos 6 caracteres'),
  firstName: z.string().min(1, 'Nombre requerido').max(50, 'Nombre muy largo'),
  lastName: z.string().min(1, 'Apellido requerido').max(50, 'Apellido muy largo'),
  acceptTerms: z.boolean().refine(val => val === true, 'Debes aceptar los términos')
});

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password requerido')
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token requerido')
});

// schemas/product.ts
export const ProductCreateSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(200, 'Nombre muy largo'),
  brand: z.enum(['HP', 'Dell', 'Apple', 'Lenovo', 'Asus', 'Samsung'], {
    errorMap: () => ({ message: 'Marca no válida' })
  }),
  category: z.enum(['laptop', 'desktop', 'tablet', 'smartphone', 'accessory'], {
    errorMap: () => ({ message: 'Categoría no válida' })
  }),
  price: z.number().positive('Precio debe ser positivo'),
  stock: z.number().min(0, 'Stock no puede ser negativo'),
  specifications: z.record(z.any()).refine(
    (specs) => Object.keys(specs).length > 0,
    'Especificaciones requeridas'
  ),
  images: z.array(z.string().url('URL de imagen inválida')).min(1, 'Al menos una imagen requerida'),
  description: z.string().min(10, 'Descripción muy corta').max(1000, 'Descripción muy larga'),
  tags: z.array(z.string()).optional().default([])
});

export const ProductUpdateSchema = ProductCreateSchema.partial();

export const ProductQuerySchema = z.object({
  // Filtros
  brand: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().positive().optional(),
  inStock: z.coerce.boolean().optional(),
  
  // Paginación
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  
  // Ordenamiento
  sortBy: z.enum(['name', 'price', 'rating', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  
  // Búsqueda
  search: z.string().optional()
}).refine(
  (data) => !data.minPrice || !data.maxPrice || data.minPrice <= data.maxPrice,
  {
    message: 'Precio mínimo no puede ser mayor al máximo',
    path: ['minPrice']
  }
);

// schemas/chat.ts
export const ChatMessageSchema = z.object({
  message: z.string().min(1, 'Mensaje no puede estar vacío').max(1000, 'Mensaje muy largo'),
  sessionId: z.string().min(1, 'Session ID requerido'),
  userId: z.string().optional() // Para usuarios logueados
});

export const ChatFeedbackSchema = z.object({
  messageId: z.string().min(1, 'Message ID requerido'),
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
  sessionId: z.string().min(1, 'Session ID requerido')
});

export const CreateSessionSchema = z.object({
  userId: z.string().optional()
});

// schemas/admin.ts
export const AIConfigSchema = z.object({
  provider: z.enum(['groq', 'openai'], {
    errorMap: () => ({ message: 'Provider debe ser groq o openai' })
  }),
  apiKey: z.string().min(1, 'API Key requerido'),
  modelName: z.string().min(1, 'Nombre del modelo requerido'),
  maxTokens: z.number().min(1).max(32000, 'Máximo 32,000 tokens'),
  temperature: z.number().min(0).max(2, 'Temperature debe estar entre 0 y 2')
});

export const UserRoleUpdateSchema = z.object({
  role: z.enum(['admin', 'customer'], {
    errorMap: () => ({ message: 'Rol debe ser admin o customer' })
  })
});

export const AnalyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  granularity: z.enum(['day', 'week', 'month']).default('day'),
  metrics: z.array(z.enum(['sales', 'stock', 'users', 'chat'])).optional()
});

// schemas/recommendation.ts
export const UserPreferencesSchema = z.object({
  preferredBrands: z.array(z.enum(['HP', 'Dell', 'Apple', 'Lenovo', 'Asus', 'Samsung'])),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().positive()
  }).refine(
    (range) => range.min <= range.max,
    'Precio mínimo no puede ser mayor al máximo'
  ),
  categories: z.array(z.enum(['laptop', 'desktop', 'tablet', 'smartphone', 'accessory'])),
  usePurpose: z.array(z.enum(['work', 'gaming', 'study', 'entertainment', 'professional'])).optional(),
  technicalLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional()
});

export const InteractionSchema = z.object({
  productId: z.string().min(1, 'Product ID requerido'),
  interactionType: z.enum(['view', 'click', 'inquiry', 'comparison', 'wishlist']),
  sessionId: z.string().min(1, 'Session ID requerido'),
  userId: z.string().optional(),
  duration: z.number().min(0).optional(), // tiempo en segundos
  metadata: z.record(z.any()).optional()
});

// schemas/common.ts - Esquemas compartidos
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
});

export const SortSchema = z.object({
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const MongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de MongoDB inválido');

// Tipos TypeScript generados automáticamente
export type RegisterDTO = z.infer<typeof RegisterSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;
export type ProductCreateDTO = z.infer<typeof ProductCreateSchema>;
export type ProductUpdateDTO = z.infer<typeof ProductUpdateSchema>;
export type ProductQueryDTO = z.infer<typeof ProductQuerySchema>;
export type ChatMessageDTO = z.infer<typeof ChatMessageSchema>;
export type AIConfigDTO = z.infer<typeof AIConfigSchema>;
export type UserPreferencesDTO = z.infer<typeof UserPreferencesSchema>;
export type InteractionDTO = z.infer<typeof InteractionSchema>;