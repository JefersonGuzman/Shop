import { z } from 'zod';

export const CategoryCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/).optional(),
  isActive: z.boolean().optional(),
}).strict();

export const CategoryUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/).optional(),
  isActive: z.boolean().optional(),
}).strict();

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




