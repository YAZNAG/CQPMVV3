import { z } from "zod";

const slugSchema = z
  .string()
  .min(2)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide (a-z, 0-9, tirets)");

const optionalImageUrl = z
  .union([
    z.string().url(),
    z.string().regex(/^\//, "Chemin local (ex: /uploads/news/photo.jpg)"),
    z.literal(""),
  ])
  .nullable()
  .optional();

function htmlTextMin(min: number, message: string) {
  return z.string().refine(
    (html) =>
      html
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim().length >= min,
    { message }
  );
}

export const newsCategorySchema = z.object({
  nameFr: z.string().min(2).max(255),
  nameAr: z.string().min(2).max(255),
  slug: slugSchema.optional(),
  order: z.coerce.number().int().min(0).default(0),
});

export const newsArticleSchema = z.object({
  slug: z.preprocess(
    (val) => (val === "" || val == null ? undefined : val),
    slugSchema.optional()
  ),
  categoryId: z.preprocess(
    (val) => (val === "" || val == null ? null : val),
    z.string().cuid().nullable().optional()
  ),
  titleFr: z.string().min(3, "Titre (FR) : au moins 3 caractères").max(500),
  titleAr: z.string().min(3, "Titre (AR) : au moins 3 caractères").max(500),
  excerptFr: z.string().min(10, "Extrait (FR) : au moins 10 caractères").max(2000),
  excerptAr: z.string().min(10, "Extrait (AR) : au moins 10 caractères").max(2000),
  contentFr: htmlTextMin(10, "Corps (FR) : au moins 10 caractères"),
  contentAr: htmlTextMin(10, "Corps (AR) : au moins 10 caractères"),
  coverImageUrl: optionalImageUrl,
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  publishedAt: z.coerce.date().nullable().optional(),
});

export type NewsCategoryInput = z.infer<typeof newsCategorySchema>;
export type NewsArticleInput = z.infer<typeof newsArticleSchema>;
