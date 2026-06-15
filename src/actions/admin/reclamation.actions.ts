"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { updateReclamationSchema } from "@/lib/validations/reclamation-admin";
import { idSchema } from "@/lib/validations/formation";
import type { ActionResult } from "@/types";

function revalidateReclamations() {
  revalidatePath("/admin/reclamations");
  revalidatePath("/fr/contact/reclamation");
  revalidatePath("/ar/contact/reclamation");
}

export async function updateReclamation(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateReclamation",
    resource: "contact",
    permission: "write",
    schema: updateReclamationSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof updateReclamationSchema>;
      const existing = await prisma.reclamation.findFirst({
        where: { id: d.id, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Réclamation introuvable" };

      await prisma.reclamation.update({
        where: { id: d.id },
        data: {
          status: d.status,
          responseNote:
            d.responseNote !== undefined ? d.responseNote : existing.responseNote,
        },
      });

      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "Reclamation",
        entityId: d.id,
        metadata: { status: d.status },
      });

      revalidateReclamations();
      return { success: true };
    },
  });
}

export async function deleteReclamation(id: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteReclamation",
    resource: "contact",
    permission: "write",
    schema: idSchema,
    input: id,
    handler: async ({ session }, reclamationId) => {
      const existing = await prisma.reclamation.findFirst({
        where: { id: reclamationId as string, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Réclamation introuvable" };

      await prisma.reclamation.update({
        where: { id: existing.id },
        data: { deletedAt: new Date() },
      });

      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "Reclamation",
        entityId: existing.id,
      });

      revalidateReclamations();
      return { success: true };
    },
  });
}
