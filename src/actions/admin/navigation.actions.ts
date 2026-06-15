"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { softDeleteRecord } from "@/lib/db/soft-delete";
import {
  navigationItemSchema,
  navigationItemUpdateSchema,
} from "@/lib/validations/navigation";
import { idSchema } from "@/lib/validations/formation";
import {
  normalizeNavigationHref,
} from "@/services/navigation.service";
import type { ActionResult } from "@/types";
import { z } from "zod";

function revalidateNavigation() {
  revalidatePath("/admin/navigation");
  revalidatePath("/fr");
  revalidatePath("/ar");
}

async function assertValidParent(
  itemId: string | undefined,
  parentId: string | null | undefined,
  itemType: "LINK" | "BUTTON"
) {
  if (itemType === "BUTTON" && parentId) {
    return "Un bouton CTA ne peut pas avoir de menu parent";
  }
  if (!parentId) return null;
  if (itemId && parentId === itemId) {
    return "Un élément ne peut pas être son propre parent";
  }

  const parent = await prisma.navigationItem.findFirst({
    where: { id: parentId, deletedAt: null },
  });
  if (!parent) return "Élément parent introuvable";
  if (parent.parentId) {
    return "Seulement 2 niveaux de menu sont supportés (parent → enfant)";
  }
  if (itemId) {
    const hasChildren = await prisma.navigationItem.count({
      where: { parentId: itemId, deletedAt: null },
    });
    if (hasChildren) {
      return "Un menu avec sous-éléments ne peut pas devenir enfant";
    }
  }
  return null;
}

export async function createNavigationItem(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  return runAdminAction({
    name: "createNavigationItem",
    resource: "navigation",
    permission: "write",
    schema: navigationItemSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof navigationItemSchema>;
      const parentError = await assertValidParent(
        undefined,
        d.parentId ?? null,
        d.itemType
      );
      if (parentError) return { success: false, error: parentError };

      const row = await prisma.navigationItem.create({
        data: {
          labelFr: d.labelFr,
          labelAr: d.labelAr,
          href: normalizeNavigationHref(d.href),
          location: d.location,
          itemType: d.itemType,
          order: d.order,
          isPublished: d.isPublished,
          exactMatch: d.exactMatch,
          openInNewTab: d.openInNewTab,
          parentId: d.itemType === "BUTTON" ? null : (d.parentId ?? null),
        },
      });

      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "NavigationItem",
        entityId: row.id,
      });
      revalidateNavigation();
      return { success: true, data: { id: row.id } };
    },
  });
}

export async function updateNavigationItem(
  input: unknown
): Promise<ActionResult> {
  return runAdminAction({
    name: "updateNavigationItem",
    resource: "navigation",
    permission: "write",
    schema: navigationItemUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof navigationItemUpdateSchema>;
      const existing = await prisma.navigationItem.findFirst({
        where: { id: d.id, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Élément introuvable" };

      const parentError = await assertValidParent(d.id, d.parentId ?? null, d.itemType);
      if (parentError) return { success: false, error: parentError };

      const { id, ...rest } = d;
      await prisma.navigationItem.update({
        where: { id },
        data: {
          labelFr: rest.labelFr,
          labelAr: rest.labelAr,
          href: normalizeNavigationHref(rest.href),
          location: rest.location,
          itemType: rest.itemType,
          order: rest.order,
          isPublished: rest.isPublished,
          exactMatch: rest.exactMatch,
          openInNewTab: rest.openInNewTab,
          parentId: rest.itemType === "BUTTON" ? null : (rest.parentId ?? null),
        },
      });

      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "NavigationItem",
        entityId: id,
      });
      revalidateNavigation();
      return { success: true };
    },
  });
}

export async function deleteNavigationItem(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteNavigationItem",
    resource: "navigation",
    permission: "write",
    input: { id },
    schema: idSchema,
    handler: async ({ session }, data) => {
      const { id: itemId } = data as z.infer<typeof idSchema>;
      const existing = await prisma.navigationItem.findFirst({
        where: { id: itemId, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Élément introuvable" };

      await prisma.navigationItem.updateMany({
        where: { parentId: itemId, deletedAt: null },
        data: { parentId: null },
      });

      await softDeleteRecord("navigationItem", itemId);
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "NavigationItem",
        entityId: itemId,
      });
      revalidateNavigation();
      return { success: true };
    },
  });
}

const togglePublishedSchema = z.object({
  id: z.string().cuid(),
  isPublished: z.boolean(),
});

export async function toggleNavigationItemPublished(
  input: unknown
): Promise<ActionResult> {
  return runAdminAction({
    name: "toggleNavigationItemPublished",
    resource: "navigation",
    permission: "write",
    schema: togglePublishedSchema,
    input,
    handler: async ({ session }, data) => {
      const { id, isPublished } = data as z.infer<typeof togglePublishedSchema>;
      const existing = await prisma.navigationItem.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Élément introuvable" };

      await prisma.navigationItem.update({
        where: { id },
        data: { isPublished },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "NavigationItem",
        entityId: id,
        metadata: { isPublished },
      });
      revalidateNavigation();
      return { success: true };
    },
  });
}
