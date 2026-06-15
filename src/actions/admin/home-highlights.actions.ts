"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { softDeleteRecord } from "@/lib/db/soft-delete";
import {
  homeHighlightSchema,
  homeHighlightUpdateSchema,
} from "@/lib/validations/home-highlight";
import { idSchema } from "@/lib/validations/formation";
import type { ActionResult } from "@/types";
import { z } from "zod";

function revalidateHighlights() {
  revalidatePath("/admin/highlights");
  revalidatePath("/fr");
  revalidatePath("/ar");
}

export async function createHomeHighlight(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  return runAdminAction({
    name: "createHomeHighlight",
    resource: "hero",
    permission: "write",
    schema: homeHighlightSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof homeHighlightSchema>;
      const row = await prisma.homeHighlight.create({
        data: {
          titleFr: d.titleFr,
          titleAr: d.titleAr,
          subtitleFr: d.subtitleFr,
          subtitleAr: d.subtitleAr,
          backgroundColor: d.backgroundColor,
          imageUrl: d.imageUrl ?? null,
          icon: d.icon,
          href: d.href ?? null,
          order: d.order,
          isPublished: d.isPublished,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "HomeHighlight",
        entityId: row.id,
      });
      revalidateHighlights();
      return { success: true, data: { id: row.id } };
    },
  });
}

export async function updateHomeHighlight(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateHomeHighlight",
    resource: "hero",
    permission: "write",
    schema: homeHighlightUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof homeHighlightUpdateSchema>;
      const existing = await prisma.homeHighlight.findFirst({
        where: { id: d.id, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Carte introuvable" };

      const { id, ...rest } = d;
      await prisma.homeHighlight.update({
        where: { id },
        data: {
          titleFr: rest.titleFr,
          titleAr: rest.titleAr,
          subtitleFr: rest.subtitleFr,
          subtitleAr: rest.subtitleAr,
          backgroundColor: rest.backgroundColor,
          imageUrl: rest.imageUrl ?? null,
          icon: rest.icon,
          href: rest.href ?? null,
          order: rest.order,
          isPublished: rest.isPublished,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "HomeHighlight",
        entityId: id,
      });
      revalidateHighlights();
      return { success: true };
    },
  });
}

export async function deleteHomeHighlight(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteHomeHighlight",
    resource: "hero",
    permission: "write",
    input: { id },
    schema: idSchema,
    handler: async ({ session }, data) => {
      const { id: highlightId } = data as z.infer<typeof idSchema>;
      const existing = await prisma.homeHighlight.findFirst({
        where: { id: highlightId, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Carte introuvable" };

      await softDeleteRecord("homeHighlight", highlightId);
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "HomeHighlight",
        entityId: highlightId,
      });
      revalidateHighlights();
      return { success: true };
    },
  });
}
