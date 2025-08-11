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

export const ProductCreateSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  category: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().min(0),
  sku: z.string().min(1),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  images: z
    .array(
      z.union([
        z.string(),
        z.object({ url: z.string(), publicId: z.string() }),
      ])
    )
    .optional()
    .transform((arr) =>
      Array.isArray(arr)
        ? arr.map((item) =>
            typeof item === 'string'
              ? { url: item, publicId: '' }
              : item
          )
        : arr
    ),
});

export const ProductUpdateSchema = ProductCreateSchema.partial();

export type ProductCreateDTO = z.infer<typeof ProductCreateSchema>;
export type ProductUpdateDTO = z.infer<typeof ProductUpdateSchema>;


