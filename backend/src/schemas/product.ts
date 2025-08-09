import { z } from 'zod';

export const ProductQuerySchema = z
  .object({
    brand: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().positive().optional(),
    inStock: z.coerce.boolean().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    sortBy: z.enum(['name', 'price', 'rating', 'createdAt']).default('name'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
    search: z.string().optional(),
  })
  .refine((d) => !d.minPrice || !d.maxPrice || d.minPrice <= d.maxPrice, {
    message: 'Precio mínimo no puede ser mayor al máximo',
    path: ['minPrice'],
  });

export type ProductQueryDTO = z.infer<typeof ProductQuerySchema>;


