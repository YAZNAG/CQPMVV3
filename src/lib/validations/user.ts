import { z } from "zod";

export const updateUserAccessSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"]),
  isActive: z.boolean(),
});

export type UpdateUserAccessInput = z.infer<typeof updateUserAccessSchema>;
