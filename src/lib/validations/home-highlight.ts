import { z } from "zod";

export const homeHighlightIconSchema = z.enum([
  "ANCHOR",
  "SHIP",
  "USER",
  "BUILDING",
  "AWARD",
]);

export const homeHighlightSchema = z.object({
  titleFr: z.string().min(1).max(255),
  titleAr: z.string().min(1).max(255),
  subtitleFr: z.string().min(1).max(255),
  subtitleAr: z.string().min(1).max(255),
  backgroundColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Couleur hex requise (ex: #2563eb)"),
  imageUrl: z.string().max(2048).nullable().optional(),
  icon: homeHighlightIconSchema.default("ANCHOR"),
  href: z
    .string()
    .max(512)
    .regex(/^\//, "Le lien doit commencer par /")
    .nullable()
    .optional(),
  order: z.coerce.number().int().min(0),
  isPublished: z.boolean(),
});

export const homeHighlightUpdateSchema = homeHighlightSchema.extend({
  id: z.string().cuid(),
});

export type HomeHighlightInput = z.infer<typeof homeHighlightSchema>;
export type HomeHighlightUpdateInput = z.infer<typeof homeHighlightUpdateSchema>;
