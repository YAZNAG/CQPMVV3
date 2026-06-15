"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { softDeleteRecord } from "@/lib/db/soft-delete";
import { ABOUT_PAGE_SLUGS } from "@/lib/about-pages";
import {
  chiffresFormationItemSchema,
  chiffresFormationItemUpdateSchema,
  chiffresGrowthBarSchema,
  chiffresGrowthBarUpdateSchema,
  chiffresHighlightSchema,
  chiffresHighlightUpdateSchema,
  chiffresInfrastructureItemSchema,
  chiffresInfrastructureItemUpdateSchema,
  chiffresPageSchema,
} from "@/lib/validations/chiffres";
import { idSchema } from "@/lib/validations/formation";
import type { ActionResult } from "@/types";

function revalidateChiffres() {
  revalidatePath("/admin/chiffres");
  for (const locale of ["fr", "ar"] as const) {
    revalidatePath(`/${locale}/pages/${ABOUT_PAGE_SLUGS.chiffres}`);
  }
}

export async function updateChiffresPage(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateChiffresPage",
    resource: "pages",
    permission: "write",
    schema: chiffresPageSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof chiffresPageSchema>;
      await prisma.siteSettings.update({
        where: { id: "default" },
        data: {
          ...d,
          chiffresHeroBackgroundUrl: d.chiffresHeroBackgroundUrl || null,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "SiteSettings",
        entityId: "default",
        metadata: { section: "chiffres" },
      });
      revalidateChiffres();
      return { success: true };
    },
  });
}

export async function createChiffresHighlight(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  return runAdminAction({
    name: "createChiffresHighlight",
    resource: "pages",
    permission: "write",
    schema: chiffresHighlightSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof chiffresHighlightSchema>;
      const row = await prisma.chiffresHighlight.create({ data: d });
      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "ChiffresHighlight",
        entityId: row.id,
      });
      revalidateChiffres();
      return { success: true, data: { id: row.id } };
    },
  });
}

export async function updateChiffresHighlight(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateChiffresHighlight",
    resource: "pages",
    permission: "write",
    schema: chiffresHighlightUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof chiffresHighlightUpdateSchema>;
      const { id, ...rest } = d;
      await prisma.chiffresHighlight.update({ where: { id }, data: rest });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "ChiffresHighlight",
        entityId: d.id,
      });
      revalidateChiffres();
      return { success: true };
    },
  });
}

export async function deleteChiffresHighlight(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteChiffresHighlight",
    resource: "pages",
    permission: "write",
    schema: idSchema,
    input: id,
    handler: async ({ session }, highlightId) => {
      await softDeleteRecord("chiffresHighlight", highlightId as string);
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "ChiffresHighlight",
        entityId: highlightId as string,
      });
      revalidateChiffres();
      return { success: true };
    },
  });
}

export async function createChiffresGrowthBar(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  return runAdminAction({
    name: "createChiffresGrowthBar",
    resource: "pages",
    permission: "write",
    schema: chiffresGrowthBarSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof chiffresGrowthBarSchema>;
      const row = await prisma.chiffresGrowthBar.create({ data: d });
      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "ChiffresGrowthBar",
        entityId: row.id,
      });
      revalidateChiffres();
      return { success: true, data: { id: row.id } };
    },
  });
}

export async function updateChiffresGrowthBar(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateChiffresGrowthBar",
    resource: "pages",
    permission: "write",
    schema: chiffresGrowthBarUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof chiffresGrowthBarUpdateSchema>;
      const { id, ...rest } = d;
      await prisma.chiffresGrowthBar.update({ where: { id }, data: rest });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "ChiffresGrowthBar",
        entityId: d.id,
      });
      revalidateChiffres();
      return { success: true };
    },
  });
}

export async function deleteChiffresGrowthBar(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteChiffresGrowthBar",
    resource: "pages",
    permission: "write",
    schema: idSchema,
    input: id,
    handler: async ({ session }, barId) => {
      await softDeleteRecord("chiffresGrowthBar", barId as string);
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "ChiffresGrowthBar",
        entityId: barId as string,
      });
      revalidateChiffres();
      return { success: true };
    },
  });
}

export async function createChiffresFormationItem(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  return runAdminAction({
    name: "createChiffresFormationItem",
    resource: "pages",
    permission: "write",
    schema: chiffresFormationItemSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof chiffresFormationItemSchema>;
      const row = await prisma.chiffresFormationItem.create({ data: d });
      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "ChiffresFormationItem",
        entityId: row.id,
      });
      revalidateChiffres();
      return { success: true, data: { id: row.id } };
    },
  });
}

export async function updateChiffresFormationItem(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateChiffresFormationItem",
    resource: "pages",
    permission: "write",
    schema: chiffresFormationItemUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof chiffresFormationItemUpdateSchema>;
      const { id, ...rest } = d;
      await prisma.chiffresFormationItem.update({ where: { id }, data: rest });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "ChiffresFormationItem",
        entityId: d.id,
      });
      revalidateChiffres();
      return { success: true };
    },
  });
}

export async function deleteChiffresFormationItem(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteChiffresFormationItem",
    resource: "pages",
    permission: "write",
    schema: idSchema,
    input: id,
    handler: async ({ session }, itemId) => {
      await softDeleteRecord("chiffresFormationItem", itemId as string);
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "ChiffresFormationItem",
        entityId: itemId as string,
      });
      revalidateChiffres();
      return { success: true };
    },
  });
}

export async function createChiffresInfrastructureItem(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  return runAdminAction({
    name: "createChiffresInfrastructureItem",
    resource: "pages",
    permission: "write",
    schema: chiffresInfrastructureItemSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof chiffresInfrastructureItemSchema>;
      const row = await prisma.chiffresInfrastructureItem.create({ data: d });
      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "ChiffresInfrastructureItem",
        entityId: row.id,
      });
      revalidateChiffres();
      return { success: true, data: { id: row.id } };
    },
  });
}

export async function updateChiffresInfrastructureItem(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateChiffresInfrastructureItem",
    resource: "pages",
    permission: "write",
    schema: chiffresInfrastructureItemUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof chiffresInfrastructureItemUpdateSchema>;
      const { id, ...rest } = d;
      await prisma.chiffresInfrastructureItem.update({ where: { id }, data: rest });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "ChiffresInfrastructureItem",
        entityId: d.id,
      });
      revalidateChiffres();
      return { success: true };
    },
  });
}

export async function deleteChiffresInfrastructureItem(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteChiffresInfrastructureItem",
    resource: "pages",
    permission: "write",
    schema: idSchema,
    input: id,
    handler: async ({ session }, itemId) => {
      await softDeleteRecord("chiffresInfrastructureItem", itemId as string);
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "ChiffresInfrastructureItem",
        entityId: itemId as string,
      });
      revalidateChiffres();
      return { success: true };
    },
  });
}
