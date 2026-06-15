import { z } from "zod";

export const homeFormationsSectionSchema = z.object({
  homeFormationsTitleFr: z.string().min(1).max(255),
  homeFormationsTitleAr: z.string().min(1).max(255),
  homeFormationsSubtitleFr: z.string().min(1).max(500),
  homeFormationsSubtitleAr: z.string().min(1).max(500),
  homeFormationsCtaLabelFr: z.string().min(1).max(120),
  homeFormationsCtaLabelAr: z.string().min(1).max(120),
  homeFormationsCtaHref: z
    .string()
    .min(1)
    .max(512)
    .regex(/^\//, "Le lien doit commencer par /"),
});

export type HomeFormationsSectionInput = z.infer<typeof homeFormationsSectionSchema>;
