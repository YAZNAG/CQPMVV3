import { z } from "zod";

const siteStatIcon = z.enum([
  "USERS",
  "GRADUATION_CAP",
  "CALENDAR",
  "HANDSHAKE",
  "AWARD",
  "SHIP",
  "ANCHOR",
  "BUILDING",
  "STAR",
]);

const infraStyle = z.enum(["NAVY", "GREY", "OCEAN", "LIGHT"]);

export const chiffresHighlightSchema = z.object({
  labelFr: z.string().min(1).max(120),
  labelAr: z.string().min(1).max(120),
  value: z.coerce.number().int().min(0),
  suffix: z.string().max(8).nullable().optional(),
  icon: siteStatIcon,
  order: z.coerce.number().int().min(0),
  isPublished: z.boolean(),
});

export const chiffresHighlightUpdateSchema = chiffresHighlightSchema.extend({
  id: z.string().cuid(),
});

export const chiffresGrowthBarSchema = z.object({
  labelFr: z.string().min(1).max(80),
  labelAr: z.string().min(1).max(80),
  value: z.coerce.number().int().min(0),
  order: z.coerce.number().int().min(0),
});

export const chiffresGrowthBarUpdateSchema = chiffresGrowthBarSchema.extend({
  id: z.string().cuid(),
});

export const chiffresFormationItemSchema = z.object({
  labelFr: z.string().min(1).max(120),
  labelAr: z.string().min(1).max(120),
  valueText: z.string().min(1).max(32),
  icon: siteStatIcon,
  order: z.coerce.number().int().min(0),
  isPublished: z.boolean(),
});

export const chiffresFormationItemUpdateSchema = chiffresFormationItemSchema.extend({
  id: z.string().cuid(),
});

export const chiffresInfrastructureItemSchema = z.object({
  labelFr: z.string().min(1).max(120),
  labelAr: z.string().min(1).max(120),
  valueText: z.string().min(1).max(32),
  icon: siteStatIcon,
  style: infraStyle,
  order: z.coerce.number().int().min(0),
  isPublished: z.boolean(),
});

export const chiffresInfrastructureItemUpdateSchema =
  chiffresInfrastructureItemSchema.extend({
    id: z.string().cuid(),
  });

export const chiffresPageSchema = z.object({
  chiffresPageTitleFr: z.string().min(1).max(255),
  chiffresPageTitleAr: z.string().min(1).max(255),
  chiffresPageSubtitleFr: z.string().min(1).max(500),
  chiffresPageSubtitleAr: z.string().min(1).max(500),
  chiffresHeroBackgroundUrl: z
    .union([
      z.string().url(),
      z.string().regex(/^\//, "Chemin local"),
      z.literal(""),
    ])
    .nullable()
    .optional(),
  chiffresPublished: z.boolean(),
  chiffresEvolutionTitleFr: z.string().min(1).max(255),
  chiffresEvolutionTitleAr: z.string().min(1).max(255),
  chiffresEvolutionSubtitleFr: z.string().min(1).max(500),
  chiffresEvolutionSubtitleAr: z.string().min(1).max(500),
  chiffresGrowthChartTitleFr: z.string().min(1).max(255),
  chiffresGrowthChartTitleAr: z.string().min(1).max(255),
  chiffresSuccessChartTitleFr: z.string().min(1).max(255),
  chiffresSuccessChartTitleAr: z.string().min(1).max(255),
  chiffresSuccessRateValue: z.coerce.number().int().min(0).max(100),
  chiffresSuccessRateLabelFr: z.string().min(1).max(120),
  chiffresSuccessRateLabelAr: z.string().min(1).max(120),
  chiffresCapacityTitleFr: z.string().min(1).max(255),
  chiffresCapacityTitleAr: z.string().min(1).max(255),
  chiffresFormationColumnTitleFr: z.string().min(1).max(120),
  chiffresFormationColumnTitleAr: z.string().min(1).max(120),
  chiffresInfrastructureColumnTitleFr: z.string().min(1).max(120),
  chiffresInfrastructureColumnTitleAr: z.string().min(1).max(120),
  chiffresCtaTitleFr: z.string().min(1).max(255),
  chiffresCtaTitleAr: z.string().min(1).max(255),
  chiffresCtaTextFr: z.string().min(1).max(500),
  chiffresCtaTextAr: z.string().min(1).max(500),
  chiffresCtaPrimaryLabelFr: z.string().min(1).max(120),
  chiffresCtaPrimaryLabelAr: z.string().min(1).max(120),
  chiffresCtaPrimaryHref: z.string().min(1).max(512),
  chiffresCtaSecondaryLabelFr: z.string().min(1).max(120),
  chiffresCtaSecondaryLabelAr: z.string().min(1).max(120),
  chiffresCtaSecondaryHref: z.string().min(1).max(512),
});

export type ChiffresPageInput = z.infer<typeof chiffresPageSchema>;
