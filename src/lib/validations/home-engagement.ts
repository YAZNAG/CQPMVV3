import { z } from "zod";

const optionalImageUrl = z
  .union([
    z.string().url(),
    z.string().regex(/^\//, "Chemin local"),
    z.literal(""),
  ])
  .nullable()
  .optional();

const optionalMediaUrl = z
  .union([
    z.string().url(),
    z.string().regex(/^\//, "Chemin local"),
    z.literal(""),
  ])
  .nullable()
  .optional();

const optionalHref = z
  .union([
    z.string().max(512).regex(/^\//, "Le lien doit commencer par /"),
    z.literal(""),
  ])
  .optional()
  .nullable();

export const homeEngagementItemSchema = z.object({
  keywordFr: z.string().min(1).max(120),
  keywordAr: z.string().min(1).max(120),
  descriptionFr: z.string().min(3).max(2000),
  descriptionAr: z.string().min(3).max(2000),
  order: z.coerce.number().int().min(0),
  isPublished: z.boolean(),
});

export const homeEngagementItemUpdateSchema = homeEngagementItemSchema.extend({
  id: z.string().cuid(),
});

export const homeEventSchema = z.object({
  titleFr: z.string().min(1).max(255),
  titleAr: z.string().min(1).max(255),
  descriptionFr: z.string().max(2000).nullable().optional(),
  descriptionAr: z.string().max(2000).nullable().optional(),
  eventDate: z.coerce.date().nullable().optional(),
  imageUrl: optionalImageUrl,
  href: optionalHref,
  order: z.coerce.number().int().min(0),
  isPublished: z.boolean(),
});

export const homeEventUpdateSchema = homeEventSchema.extend({
  id: z.string().cuid(),
});

export const homeEngagementSectionSchema = z.object({
  homeEventsTitleFr: z.string().min(1).max(255),
  homeEventsTitleAr: z.string().min(1).max(255),
  homeEventsEmptyFr: z.string().min(1).max(500),
  homeEventsEmptyAr: z.string().min(1).max(500),
  homeEngagementTitleFr: z.string().min(1).max(255),
  homeEngagementTitleAr: z.string().min(1).max(255),
  homeEngagementBackgroundUrl: optionalImageUrl,
  homeEngagementMediaUrl: optionalMediaUrl,
  homeEngagementMediaThumbnailUrl: optionalImageUrl,
  homeContactBannerTitleFr: z.string().min(1).max(255),
  homeContactBannerTitleAr: z.string().min(1).max(255),
  homeContactBannerSubtitleFr: z.string().min(1).max(255),
  homeContactBannerSubtitleAr: z.string().min(1).max(255),
  homeContactBannerPhone: z.string().min(3).max(40),
  homeContactBannerHref: z
    .string()
    .min(1)
    .max(512)
    .regex(/^\//, "Le lien doit commencer par /"),
  homeContactBannerBackgroundUrl: optionalImageUrl,
});

export type HomeEngagementItemInput = z.infer<typeof homeEngagementItemSchema>;
export type HomeEventInput = z.infer<typeof homeEventSchema>;
export type HomeEngagementSectionInput = z.infer<typeof homeEngagementSectionSchema>;
