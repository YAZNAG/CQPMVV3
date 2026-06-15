import { z } from "zod";

export const socialPlatformSchema = z.enum([
  "FACEBOOK",
  "LINKEDIN",
  "TWITTER",
  "YOUTUBE",
  "INSTAGRAM",
  "TIKTOK",
  "OTHER",
]);

export const siteSocialLinkSchema = z.object({
  platform: socialPlatformSchema.default("OTHER"),
  labelFr: z.string().max(80).nullable().optional(),
  labelAr: z.string().max(80).nullable().optional(),
  url: z.string().url("URL invalide"),
  order: z.coerce.number().int().min(0),
  isPublished: z.boolean(),
});

export const siteSocialLinkIdSchema = z.object({
  id: z.string().min(1),
});

export const siteSocialLinkUpdateSchema = siteSocialLinkSchema.extend({
  id: z.string().min(1),
});

export type SiteSocialLinkInput = z.infer<typeof siteSocialLinkSchema>;
export type SiteSocialLinkUpdateInput = z.infer<typeof siteSocialLinkUpdateSchema>;
