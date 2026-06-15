import { z } from "zod";

export const reviewApplicationSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "WAITING_LIST"]),
  statusNote: z.string().max(2000).optional(),
  sendEmail: z.boolean().optional().default(true),
});

export type ReviewApplicationInput = z.infer<typeof reviewApplicationSchema>;
