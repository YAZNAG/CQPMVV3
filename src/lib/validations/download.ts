import { z } from "zod";

const optionalFileUrl = z
  .union([
    z.string().url(),
    z.string().regex(/^\//, "Chemin local (ex: /uploads/documents/avis.pdf)"),
    z.literal(""),
  ])
  .nullable()
  .optional();

const slugSchema = z
  .string()
  .min(2)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug en minuscules (ex: avis-concours)");

export const downloadResourceSchema = z.object({
  slug: slugSchema,
  titleFr: z.string().min(1).max(255),
  titleAr: z.string().min(1).max(255),
  infoLabelFr: z.string().max(255).nullable().optional(),
  infoLabelAr: z.string().max(255).nullable().optional(),
  excerptFr: z.string().max(2000).nullable().optional(),
  excerptAr: z.string().max(2000).nullable().optional(),
  contentFr: z.string().min(1),
  contentAr: z.string().min(1),
  icon: z.enum(["PDF", "SUCCESS", "FOLDER", "RULES"]),
  actionType: z.enum(["DOWNLOAD", "VIEW"]),
  fileUrl: optionalFileUrl,
  order: z.coerce.number().int().min(0),
  isPublished: z.boolean(),
});

export const downloadResourceUpdateSchema = downloadResourceSchema.extend({
  id: z.string().cuid(),
});

export const downloadsSectionSchema = z.object({
  downloadsSectionTitleFr: z.string().min(1).max(255),
  downloadsSectionTitleAr: z.string().min(1).max(255),
  downloadsSectionSubtitleFr: z.string().min(1).max(500),
  downloadsSectionSubtitleAr: z.string().min(1).max(500),
  downloadsSectionPublished: z.boolean(),
});

export type DownloadResourceInput = z.infer<typeof downloadResourceSchema>;
export type DownloadResourceUpdateInput = z.infer<typeof downloadResourceUpdateSchema>;
export type DownloadsSectionInput = z.infer<typeof downloadsSectionSchema>;
