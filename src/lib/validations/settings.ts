import { z } from "zod";

const optionalUrl = z.union([z.string().url(), z.literal("")]).optional();

const optionalImagePath = z
  .union([
    z.string().url(),
    z.string().regex(/^\//, "Chemin local (ex: /uploads/site/logo.png)"),
    z.literal(""),
  ])
  .optional();

export const siteSettingsSchema = z.object({
  siteNameFr: z.string().min(2),
  siteNameAr: z.string().min(2),
  taglineFr: z.string().min(2),
  taglineAr: z.string().min(2),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  phone: z.string().nullable().optional(),
  addressFr: z.string().nullable().optional(),
  addressAr: z.string().nullable().optional(),
  heroImageUrl: optionalUrl,
  logoUrl: optionalImagePath,
  aboutImageUrl: optionalImagePath,
  aboutPresentationFr: z.string().optional(),
  aboutPresentationAr: z.string().optional(),
  missionFr: z.string().optional(),
  missionAr: z.string().optional(),
});

/** Fields editable from Paramètres — hero titre/texte/image → /admin/hero */
export const siteSettingsFormSchema = siteSettingsSchema.omit({
  taglineFr: true,
  taglineAr: true,
  heroImageUrl: true,
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export type SiteSettingsFormInput = z.infer<typeof siteSettingsFormSchema>;
