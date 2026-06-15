import { z } from "zod";

export const testimonialSchema = z.object({
  nameFr: z.string().min(2).max(120),
  nameAr: z.string().min(2).max(120),
  roleFr: z.string().max(120).nullable().optional(),
  roleAr: z.string().max(120).nullable().optional(),
  contentFr: z.string().min(10),
  contentAr: z.string().min(10),
  imageUrl: z.string().url().nullable().optional(),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  order: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

export const testimonialUpdateSchema = testimonialSchema.extend({
  id: z.string().cuid(),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
export type TestimonialUpdateInput = z.infer<typeof testimonialUpdateSchema>;
