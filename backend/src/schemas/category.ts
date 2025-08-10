import { z } from 'zod';

export const CategoryCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  isActive: z.boolean().optional(),
});

export const CategoryUpdateSchema = CategoryCreateSchema.partial();

export const CategoryQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CategoryCreateDTO = z.infer<typeof CategoryCreateSchema>;
export type CategoryUpdateDTO = z.infer<typeof CategoryUpdateSchema>;
export type CategoryQueryDTO = z.infer<typeof CategoryQuerySchema>;




