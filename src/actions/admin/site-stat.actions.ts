"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { softDeleteRecord } from "@/lib/db/soft-delete";
import { siteStatSchema, siteStatUpdateSchema } from "@/lib/validations/site-stat";
import { idSchema } from "@/lib/validations/formation";
import type { ActionResult } from "@/types";
import { z } from "zod";

function revalidateStats() {
  revalidatePath("/admin/settings");
  revalidatePath("/fr");
  revalidatePath("/ar");
}

export async function createSiteStat(input: unknown): Promise<ActionResult<{ id: string }>> {
  return runAdminAction({
    name: "createSiteStat",
    resource: "settings",
    permission: "write",
    schema: siteStatSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof siteStatSchema>;
      const row = await prisma.siteStat.create({
        data: {
          labelFr: d.labelFr,
          labelAr: d.labelAr,
          value: d.value,
          icon: d.icon,
          showPlus: d.showPlus,
          order: d.order,
          isPublished: d.isPublished,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "SiteStat",
        entityId: row.id,
      });
      revalidateStats();
      return { success: true, data: { id: row.id } };
    },
  });
}

export async function updateSiteStat(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateSiteStat",
    resource: "settings",
    permission: "write",
    schema: siteStatUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof siteStatUpdateSchema>;
      const existing = await prisma.siteStat.findFirst({
        where: { id: d.id, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Chiffre introuvable" };

      const { id, ...rest } = d;
      await prisma.siteStat.update({
        where: { id },
        data: {
          labelFr: rest.labelFr,
          labelAr: rest.labelAr,
          value: rest.value,
          icon: rest.icon,
          showPlus: rest.showPlus,
          order: rest.order,
          isPublished: rest.isPublished,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "SiteStat",
        entityId: id,
      });
      revalidateStats();
      return { success: true };
    },
  });
}

export async function deleteSiteStat(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteSiteStat",
    resource: "settings",
    permission: "write",
    input: { id },
    schema: idSchema,
    handler: async ({ session }, data) => {
      const { id: statId } = data as z.infer<typeof idSchema>;
      const existing = await prisma.siteStat.findFirst({
        where: { id: statId, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Chiffre introuvable" };

      await softDeleteRecord("siteStat", statId);
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "SiteStat",
        entityId: statId,
      });
      revalidateStats();
      return { success: true };
    },
  });
}
