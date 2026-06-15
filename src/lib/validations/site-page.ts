import { z } from "zod";

export const RESERVED_PAGE_SLUGS = new Set([
  "admin",
  "api",
  "formations",
  "news",
  "gallery",
  "events",
  "contact",
  "admission",
  "pages",
  "fr",
  "ar",
  "status",
  "og",
  "robots",
  "sitemap",
]);

const slugSchema = z
  .string()
  .min(2, "Slug trop court")
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide (ex: reglement-interieur)")
  .refine((slug) => !RESERVED_PAGE_SLUGS.has(slug), "Ce slug est réservé par le site");

const sitePageBaseSchema = z.object({
  slug: slugSchema,
  titleFr: z.string().min(1, "Titre FR requis").max(255),
  titleAr: z.string().min(1, "Titre AR requis").max(255),
  excerptFr: z.string().max(2000).optional().nullable(),
  excerptAr: z.string().max(2000).optional().nullable(),
  contentFr: z.string().min(1, "Contenu FR requis"),
  contentAr: z.string().min(1, "Contenu AR requis"),
  coverImageUrl: z.string().max(2048).optional().nullable(),
  isPublished: z.boolean(),
  order: z.coerce.number().int().min(0),
  addToNavigation: z.boolean().optional(),
  navigationParentId: z.string().cuid().nullable().optional(),
});

export const sitePageSchema = sitePageBaseSchema;

export const sitePageUpdateSchema = sitePageBaseSchema.extend({
  id: z.string().cuid(),
});

export type SitePageInput = z.infer<typeof sitePageSchema>;
export type SitePageUpdateInput = z.infer<typeof sitePageUpdateSchema>;
