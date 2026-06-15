"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { homeFormationsSectionSchema } from "@/lib/validations/home-formation-showcase";
import { getNextFormationHomeOrder } from "@/services/home-formation-showcase.service";
import type { ActionResult } from "@/types";
import { z } from "zod";

function revalidateHomeFormations() {
  revalidatePath("/admin/home-formations");
  revalidatePath("/fr");
  revalidatePath("/ar");
}

export async function updateHomeFormationsSection(
  input: unknown
): Promise<ActionResult> {
  return runAdminAction({
    name: "updateHomeFormationsSection",
    resource: "formations",
    permission: "write",
    schema: homeFormationsSectionSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof homeFormationsSectionSchema>;
      await prisma.siteSettings.upsert({
        where: { id: "default" },
        create: { id: "default", ...d },
        update: d,
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "SiteSettings",
        entityId: "default",
        metadata: { section: "homeFormations" },
      });
      revalidateHomeFormations();
      return { success: true };
    },
  });
}

const toggleShowOnHomeSchema = z.object({
  id: z.string().cuid(),
  showOnHome: z.boolean(),
});

export async function toggleFormationShowOnHome(
  input: unknown
): Promise<ActionResult> {
  return runAdminAction({
    name: "toggleFormationShowOnHome",
    resource: "formations",
    permission: "write",
    schema: toggleShowOnHomeSchema,
    input,
    handler: async ({ session }, data) => {
      const { id, showOnHome } = data as z.infer<typeof toggleShowOnHomeSchema>;
      const existing = await prisma.formation.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Formation introuvable" };

      const homeOrder = showOnHome
        ? existing.showOnHome
          ? existing.homeOrder
          : await getNextFormationHomeOrder()
        : 0;

      await prisma.formation.update({
        where: { id },
        data: { showOnHome, homeOrder },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "Formation",
        entityId: id,
        metadata: { showOnHome },
      });
      revalidateHomeFormations();
      return { success: true };
    },
  });
}
