import { z } from "zod";

export const siteStatIconSchema = z.enum([
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

export const siteStatSchema = z.object({
  labelFr: z.string().min(1).max(120),
  labelAr: z.string().min(1).max(120),
  value: z.coerce.number().int().min(0),
  icon: siteStatIconSchema.default("USERS"),
  showPlus: z.boolean().default(true),
  order: z.coerce.number().int().min(0),
  isPublished: z.boolean(),
});

export const siteStatUpdateSchema = siteStatSchema.extend({
  id: z.string().cuid(),
});

export type SiteStatInput = z.infer<typeof siteStatSchema>;
export type SiteStatUpdateInput = z.infer<typeof siteStatUpdateSchema>;
