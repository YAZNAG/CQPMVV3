import { z } from "zod";

export const heroSlideButtonSchema = z.object({
  labelFr: z.string().min(1, "Label FR requis").max(80),
  labelAr: z.string().min(1, "Label AR requis").max(80),
  href: z
    .string()
    .min(1)
    .max(512)
    .regex(/^\//, "Le chemin doit commencer par /"),
  variant: z.enum(["primary", "outline"]).default("primary"),
  order: z.coerce.number().int().min(0),
});

export const heroSlideSchema = z.object({
  titleFr: z.string().min(1, "Titre FR requis").max(255),
  titleAr: z.string().min(1, "Titre AR requis").max(255),
  subtitleFr: z.string().min(1, "Texte FR requis"),
  subtitleAr: z.string().min(1, "Texte AR requis"),
  imageUrl: z.string().min(1, "Image requise").max(2048),
  buttons: z.array(heroSlideButtonSchema).max(4).default([]),
  order: z.coerce.number().int().min(0),
  isPublished: z.boolean(),
});

export const heroSlideUpdateSchema = heroSlideSchema.extend({
  id: z.string().cuid(),
});

export type HeroSlideButtonInput = z.infer<typeof heroSlideButtonSchema>;
export type HeroSlideInput = z.infer<typeof heroSlideSchema>;
export type HeroSlideUpdateInput = z.infer<typeof heroSlideUpdateSchema>;
