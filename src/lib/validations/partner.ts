import { z } from "zod";

const logoUrlSchema = z.union([
  z.string().url(),
  z.string().regex(/^\//, "Chemin local (ex: /uploads/partners/logo.png)"),
]);

const optionalWebsiteUrl = z
  .union([z.string().url(), z.literal("")])
  .nullable()
  .optional();

export const partnerSchema = z.object({
  name: z.string().min(2).max(255),
  logoUrl: logoUrlSchema,
  websiteUrl: optionalWebsiteUrl,
  order: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

export const partnerUpdateSchema = partnerSchema.extend({
  id: z.string().cuid(),
});

export type PartnerInput = z.infer<typeof partnerSchema>;
export type PartnerUpdateInput = z.infer<typeof partnerUpdateSchema>;
