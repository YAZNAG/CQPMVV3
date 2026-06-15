import { z } from "zod";

const optionalImagePath = z
  .union([
    z.string().url(),
    z.string().regex(/^\//, "Chemin local (ex: /uploads/director/photo.jpg)"),
    z.literal(""),
  ])
  .optional();

export const directorMessageSchema = z.object({
  directorPhotoUrl: optionalImagePath,
  directorQuoteFr: z.string().optional(),
  directorQuoteAr: z.string().optional(),
  directorBodyFr: z.string().optional(),
  directorBodyAr: z.string().optional(),
  directorNameFr: z.string().optional(),
  directorNameAr: z.string().optional(),
  directorTitleFr: z.string().optional(),
  directorTitleAr: z.string().optional(),
  directorMessagePublished: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v !== "false"),
});

export type DirectorMessageInput = z.infer<typeof directorMessageSchema>;
