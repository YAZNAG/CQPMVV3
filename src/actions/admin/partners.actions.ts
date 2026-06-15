"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { softDeleteRecord } from "@/lib/db/soft-delete";
import { partnerSchema, partnerUpdateSchema } from "@/lib/validations/partner";
import { idSchema } from "@/lib/validations/formation";
import type { ActionResult } from "@/types";
import { z } from "zod";

function revalidatePartners() {
  revalidatePath("/admin/partners");
  revalidatePath("/fr");
  revalidatePath("/ar");
}

export async function createPartner(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  return runAdminAction({
    name: "createPartner",
    resource: "formations",
    permission: "write",
    schema: partnerSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof partnerSchema>;
      const row = await prisma.partner.create({
        data: {
          name: d.name,
          logoUrl: d.logoUrl,
          websiteUrl: d.websiteUrl?.trim() ? d.websiteUrl.trim() : null,
          order: d.order,
          isPublished: d.isPublished,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "Partner",
        entityId: row.id,
      });
      revalidatePartners();
      return { success: true, data: { id: row.id } };
    },
  });
}

export async function updatePartner(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updatePartner",
    resource: "formations",
    permission: "write",
    schema: partnerUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof partnerUpdateSchema>;
      const existing = await prisma.partner.findFirst({
        where: { id: d.id, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Partenaire introuvable" };

      const { id, ...rest } = d;
      await prisma.partner.update({
        where: { id },
        data: {
          name: rest.name,
          logoUrl: rest.logoUrl,
          websiteUrl: rest.websiteUrl?.trim() ? rest.websiteUrl.trim() : null,
          order: rest.order,
          isPublished: rest.isPublished,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "Partner",
        entityId: id,
      });
      revalidatePartners();
      return { success: true };
    },
  });
}

export async function deletePartner(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deletePartner",
    resource: "formations",
    permission: "write",
    input: { id },
    schema: idSchema,
    handler: async ({ session }, data) => {
      const { id: partnerId } = data as z.infer<typeof idSchema>;
      const existing = await prisma.partner.findFirst({
        where: { id: partnerId, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Partenaire introuvable" };

      await softDeleteRecord("partner", partnerId);
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "Partner",
        entityId: partnerId,
      });
      revalidatePartners();
      return { success: true };
    },
  });
}
