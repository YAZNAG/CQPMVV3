"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { updateUserAccessSchema, type UpdateUserAccessInput } from "@/lib/validations/user";
import type { ActionResult } from "@/types";

export async function updateUserAccess(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateUserAccess",
    resource: "users",
    permission: "write",
    schema: updateUserAccessSchema,
    input,
    handler: async ({ session }, data) => {
      const parsed = data as UpdateUserAccessInput;

      if (parsed.userId === session.user.id && !parsed.isActive) {
        return { success: false, error: "Vous ne pouvez pas désactiver votre propre compte." };
      }

      const target = await prisma.user.findFirst({
        where: { id: parsed.userId, deletedAt: null },
      });
      if (!target) return { success: false, error: "Utilisateur introuvable" };

      if (
        target.role === "SUPER_ADMIN" &&
        parsed.role !== "SUPER_ADMIN" &&
        parsed.userId !== session.user.id
      ) {
        const superCount = await prisma.user.count({
          where: { role: "SUPER_ADMIN", isActive: true, deletedAt: null },
        });
        if (superCount <= 1) {
          return {
            success: false,
            error: "Impossible de rétrograder le dernier super administrateur.",
          };
        }
      }

      await prisma.user.update({
        where: { id: parsed.userId },
        data: { role: parsed.role, isActive: parsed.isActive },
      });

      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "User",
        entityId: parsed.userId,
        metadata: { role: parsed.role, isActive: parsed.isActive },
      });

      revalidatePath("/admin/users");
      return { success: true };
    },
  });
}
