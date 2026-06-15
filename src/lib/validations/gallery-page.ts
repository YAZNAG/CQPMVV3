import { z } from "zod";

const optionalImageUrl = z
  .union([
    z.string().url(),
    z.string().regex(/^\//, "Chemin local"),
    z.literal(""),
  ])
  .nullable()
  .optional();

export const galleryPageHeroSchema = z.object({
  page: z.enum(["photos", "videos"]),
  titleFr: z.string().min(1).max(255),
  titleAr: z.string().min(1).max(255),
  subtitleFr: z.string().min(1).max(500),
  subtitleAr: z.string().min(1).max(500),
  heroBackgroundUrl: optionalImageUrl,
});

export type GalleryPageHeroInput = z.infer<typeof galleryPageHeroSchema>;
