import { z } from "zod";

export const updateReclamationSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(["PENDING", "IN_REVIEW", "RESOLVED", "CLOSED"]),
  responseNote: z.string().max(5000).nullable().optional(),
});
