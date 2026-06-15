import { z } from "zod";

export const reclamationSubmitSchema = z.object({
  name: z.string().min(2).max(120),
  cin: z.string().min(4).max(32),
  phone: z.string().min(8).max(32),
  email: z.string().email().max(255),
  type: z.enum(["ADMINISTRATIVE", "PEDAGOGICAL", "INFRASTRUCTURE", "OTHER"]),
  subject: z.string().min(3).max(255),
  description: z.string().min(20).max(5000),
  attachmentUrl: z.string().url().max(2048).optional().nullable(),
});

export const reclamationTrackSchema = z.object({
  reference: z.string().min(6).max(32),
  email: z.string().email().max(255),
});

export type ReclamationSubmitInput = z.infer<typeof reclamationSubmitSchema>;
export type ReclamationTrackInput = z.infer<typeof reclamationTrackSchema>;
