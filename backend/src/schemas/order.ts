import { z } from 'zod';

export const OrderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
});

export const ShippingAddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
});

export const OrderCreateSchema = z.object({
  items: z.array(OrderItemSchema).min(1),
  shippingAddress: ShippingAddressSchema,
  paymentMethod: z.string().min(1),
  notes: z.string().optional(),
});

export type OrderCreateDTO = z.infer<typeof OrderCreateSchema>;


