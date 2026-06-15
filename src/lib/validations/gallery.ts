import { z } from "zod";

const slugSchema = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide");

const optionalImageUrl = z
  .union([
    z.string().url(),
    z.string().regex(/^\//, "Chemin local (ex: /uploads/gallery/photo.jpg)"),
    z.literal(""),
  ])
  .nullable()
  .optional();

const imageUrlSchema = z.union([
  z.string().url(),
  z.string().regex(/^\//, "Chemin local (ex: /uploads/gallery/photo.jpg)"),
]);

const videoUrlSchema = z.union([
  z.string().url().max(2048),
  z.string().regex(/^\//, "Chemin local (ex: /uploads/gallery/video.mp4)"),
]);

export const galleryAlbumSchema = z.object({
  titleFr: z.string().min(2).max(255),
  titleAr: z.string().min(2).max(255),
  descriptionFr: z.string().max(5000).optional(),
  descriptionAr: z.string().max(5000).optional(),
  slug: slugSchema.optional(),
  coverImageUrl: optionalImageUrl,
  order: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

export const galleryVideoSchema = z.object({
  albumId: z.string().cuid(),
  videoUrl: videoUrlSchema,
  titleFr: z.string().max(255).optional(),
  titleAr: z.string().max(255).optional(),
  order: z.coerce.number().int().min(0).optional(),
});

export const galleryPhotoSchema = z.object({
  albumId: z.string().cuid(),
  imageUrl: imageUrlSchema,
  fileName: z.string().max(255).optional(),
  mimeType: z.string().max(127).optional(),
  size: z.coerce.number().int().min(0).optional(),
  titleFr: z.string().max(255).optional(),
  titleAr: z.string().max(255).optional(),
  order: z.coerce.number().int().min(0).optional(),
});

export const galleryItemUpdateSchema = z.object({
  id: z.string().cuid(),
  titleFr: z.string().max(255).nullable().optional(),
  titleAr: z.string().max(255).nullable().optional(),
  order: z.coerce.number().int().min(0).optional(),
  videoUrl: videoUrlSchema.optional(),
  imageUrl: imageUrlSchema.optional(),
  fileName: z.string().max(255).optional(),
  mimeType: z.string().max(127).optional(),
  size: z.coerce.number().int().min(0).optional(),
});

export type GalleryAlbumInput = z.infer<typeof galleryAlbumSchema>;
export type GalleryVideoInput = z.infer<typeof galleryVideoSchema>;
export type GalleryPhotoInput = z.infer<typeof galleryPhotoSchema>;
