import { z } from 'zod';

const OfferBaseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  priceOff: z.number().min(0).optional(),
  productIds: z.array(z.string().min(1)).default([]),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  // Campos para banner
  eyebrow: z.string().optional(),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaTo: z.string().optional(),
  layout: z.enum(['image-right', 'image-left']).optional(),
  bgColor: z.string().optional(),
  textColor: z.string().optional(),
});

export const OfferCreateSchema = OfferBaseSchema.refine(
  (data) => (data.discountPercent !== undefined || data.priceOff !== undefined) && !(data.discountPercent !== undefined && data.priceOff !== undefined),
  {
    message: 'Debe especificar solo uno: discountPercent o priceOff',
  }
);

// For updates, we need to handle the case where fields might be undefined
export const OfferUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  priceOff: z.number().min(0).optional(),
  productIds: z.array(z.string().min(1)).optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  isActive: z.boolean().optional(),
  eyebrow: z.string().optional(),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaTo: z.string().optional(),
  layout: z.enum(['image-right', 'image-left']).optional(),
  bgColor: z.string().optional(),
  textColor: z.string().optional(),
}).refine(
  (data) => {
    // If both fields are provided, that's invalid
    if (data.discountPercent !== undefined && data.priceOff !== undefined) {
      return false;
    }
    // If neither field is provided, that's fine for updates
    // If only one field is provided, that's fine
    return true;
  },
  {
    message: 'No puede especificar tanto discountPercent como priceOff',
  }
);



