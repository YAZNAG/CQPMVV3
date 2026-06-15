"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { softDeleteRecord } from "@/lib/db/soft-delete";
import {
  siteSocialLinkSchema,
  siteSocialLinkIdSchema,
  siteSocialLinkUpdateSchema,
} from "@/lib/validations/site-social-link";
import type { ActionResult } from "@/types";
import { z } from "zod";

function revalidateSocialLinks() {
  revalidatePath("/admin/settings");
  revalidatePath("/fr");
  revalidatePath("/ar");
}

export async function createSiteSocialLink(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  return runAdminAction({
    name: "createSiteSocialLink",
    resource: "settings",
    permission: "write",
    schema: siteSocialLinkSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof siteSocialLinkSchema>;
      const row = await prisma.siteSocialLink.create({
        data: {
          platform: d.platform,
          labelFr: d.labelFr?.trim() || null,
          labelAr: d.labelAr?.trim() || null,
          url: d.url,
          order: d.order,
          isPublished: d.isPublished,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "SiteSocialLink",
        entityId: row.id,
      });
      revalidateSocialLinks();
      return { success: true, data: { id: row.id } };
    },
  });
}

export async function updateSiteSocialLink(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateSiteSocialLink",
    resource: "settings",
    permission: "write",
    schema: siteSocialLinkUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof siteSocialLinkUpdateSchema>;
      const existing = await prisma.siteSocialLink.findFirst({
        where: { id: d.id, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Lien introuvable" };

      const { id, ...rest } = d;
      await prisma.siteSocialLink.update({
        where: { id },
        data: {
          platform: rest.platform,
          labelFr: rest.labelFr?.trim() || null,
          labelAr: rest.labelAr?.trim() || null,
          url: rest.url,
          order: rest.order,
          isPublished: rest.isPublished,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "SiteSocialLink",
        entityId: id,
      });
      revalidateSocialLinks();
      return { success: true };
    },
  });
}

export async function deleteSiteSocialLink(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteSiteSocialLink",
    resource: "settings",
    permission: "write",
    input: { id },
    schema: siteSocialLinkIdSchema,
    handler: async ({ session }, data) => {
      const { id: linkId } = data as z.infer<typeof siteSocialLinkIdSchema>;
      const existing = await prisma.siteSocialLink.findFirst({
        where: { id: linkId, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Lien introuvable" };

      await softDeleteRecord("siteSocialLink", linkId);
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "SiteSocialLink",
        entityId: linkId,
      });
      revalidateSocialLinks();
      return { success: true };
    },
  });
}
