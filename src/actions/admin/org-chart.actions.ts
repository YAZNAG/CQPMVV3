"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { prisma } from "@/lib/db";
import { softDeleteRecord } from "@/lib/db/soft-delete";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import type { ActionResult } from "@/types";
import { idSchema } from "@/lib/validations/formation";
import {
  orgChartNodeSchema,
  orgChartNodeUpdateSchema,
  orgChartPageSchema,
} from "@/lib/validations/org-chart";
import { ABOUT_PAGE_SLUGS } from "@/lib/about-pages";

function revalidateOrgChart() {
  revalidatePath("/admin/organigramme");
  for (const locale of ["fr", "ar"] as const) {
    revalidatePath(`/${locale}/pages/${ABOUT_PAGE_SLUGS.organigramme}`);
  }
}

export async function updateOrgChartPage(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateOrgChartPage",
    resource: "pages",
    permission: "write",
    schema: orgChartPageSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof orgChartPageSchema>;
      await prisma.siteSettings.update({
        where: { id: "default" },
        data: {
          ...d,
          orgChartBackgroundUrl: d.orgChartBackgroundUrl || null,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "SiteSettings",
        entityId: "default",
        metadata: { section: "orgChart" },
      });
      revalidateOrgChart();
      return { success: true };
    },
  });
}

export async function createOrgChartNode(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  return runAdminAction({
    name: "createOrgChartNode",
    resource: "pages",
    permission: "write",
    schema: orgChartNodeSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof orgChartNodeSchema>;
      const row = await prisma.orgChartNode.create({
        data: {
          titleFr: d.titleFr,
          titleAr: d.titleAr,
          parentId: d.parentId ?? null,
          style: d.style,
          accent: d.accent,
          icon: d.icon,
          order: d.order,
          isPublished: d.isPublished,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "OrgChartNode",
        entityId: row.id,
      });
      revalidateOrgChart();
      return { success: true, data: { id: row.id } };
    },
  });
}

export async function updateOrgChartNode(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateOrgChartNode",
    resource: "pages",
    permission: "write",
    schema: orgChartNodeUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof orgChartNodeUpdateSchema>;
      if (d.parentId === d.id) {
        return { success: false, error: "Un poste ne peut pas être son propre parent" };
      }
      await prisma.orgChartNode.update({
        where: { id: d.id },
        data: {
          titleFr: d.titleFr,
          titleAr: d.titleAr,
          parentId: d.parentId ?? null,
          style: d.style,
          accent: d.accent,
          icon: d.icon,
          order: d.order,
          isPublished: d.isPublished,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "OrgChartNode",
        entityId: d.id,
      });
      revalidateOrgChart();
      return { success: true };
    },
  });
}

export async function deleteOrgChartNode(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteOrgChartNode",
    resource: "pages",
    permission: "write",
    schema: idSchema,
    input: id,
    handler: async ({ session }, nodeId) => {
      await softDeleteRecord("orgChartNode", nodeId as string);
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "OrgChartNode",
        entityId: nodeId as string,
      });
      revalidateOrgChart();
      return { success: true };
    },
  });
}
