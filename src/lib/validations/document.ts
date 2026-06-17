import { z } from "zod";

const slugSchema = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide (lettres minuscules, chiffres, tirets)");

export const documentCategorySchema = z.object({
  nameFr: z.string().min(2).max(255),
  nameAr: z.string().min(2).max(255),
  slug: slugSchema,
  descriptionFr: z.string().max(2000).nullable().optional(),
  descriptionAr: z.string().max(2000).nullable().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const documentCategoryUpdateSchema = documentCategorySchema.extend({
  id: z.string().cuid(),
});

export const documentSchema = z.object({
  titleFr: z.string().min(1).max(255),
  titleAr: z.string().max(255).nullable().optional(),
  descriptionFr: z.string().max(2000).nullable().optional(),
  descriptionAr: z.string().max(2000).nullable().optional(),
  categoryId: z.string().cuid().nullable().optional(),
  fileUrl: z.string().min(1).max(2048),
  fileName: z.string().min(1).max(255),
  fileType: z.string().min(1).max(50),
  fileSize: z.coerce.number().int().min(0).default(0),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  publishedAt: z.coerce.date().nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const documentUpdateSchema = documentSchema.extend({
  id: z.string().cuid(),
});

export const documentIdSchema = z.object({ id: z.string().cuid() });
