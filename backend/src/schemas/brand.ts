import { z } from 'zod';

export const BrandCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  logo: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
}).strict();

export const BrandUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  logo: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
}).strict();

export const BrandQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type BrandCreateDTO = z.infer<typeof BrandCreateSchema>;
export type BrandUpdateDTO = z.infer<typeof BrandUpdateSchema>;
export type BrandQueryDTO = z.infer<typeof BrandQuerySchema>;




