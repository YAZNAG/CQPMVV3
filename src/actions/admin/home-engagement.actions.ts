"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { softDeleteRecord } from "@/lib/db/soft-delete";
import {
  homeEngagementItemSchema,
  homeEngagementItemUpdateSchema,
  homeEngagementSectionSchema,
  homeEventSchema,
  homeEventUpdateSchema,
} from "@/lib/validations/home-engagement";
import { idSchema } from "@/lib/validations/formation";
import type { ActionResult } from "@/types";
import { z } from "zod";

function revalidateHomeEngagement() {
  revalidatePath("/admin/home-engagement");
  revalidatePath("/admin/events");
  revalidatePath("/fr");
  revalidatePath("/ar");
  revalidatePath("/fr/events");
  revalidatePath("/ar/events");
}

function normalizeOptionalText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function updateHomeEngagementSection(
  input: unknown
): Promise<ActionResult> {
  return runAdminAction({
    name: "updateHomeEngagementSection",
    resource: "hero",
    permission: "write",
    schema: homeEngagementSectionSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof homeEngagementSectionSchema>;
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
        metadata: { section: "homeEngagement" },
      });
      revalidateHomeEngagement();
      return { success: true };
    },
  });
}

export async function createHomeEngagementItem(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  return runAdminAction({
    name: "createHomeEngagementItem",
    resource: "hero",
    permission: "write",
    schema: homeEngagementItemSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof homeEngagementItemSchema>;
      const row = await prisma.homeEngagementItem.create({ data: d });
      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "HomeEngagementItem",
        entityId: row.id,
      });
      revalidateHomeEngagement();
      return { success: true, data: { id: row.id } };
    },
  });
}

export async function updateHomeEngagementItem(
  input: unknown
): Promise<ActionResult> {
  return runAdminAction({
    name: "updateHomeEngagementItem",
    resource: "hero",
    permission: "write",
    schema: homeEngagementItemUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof homeEngagementItemUpdateSchema>;
      const existing = await prisma.homeEngagementItem.findFirst({
        where: { id: d.id, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Point introuvable" };

      const { id, ...rest } = d;
      await prisma.homeEngagementItem.update({ where: { id }, data: rest });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "HomeEngagementItem",
        entityId: id,
      });
      revalidateHomeEngagement();
      return { success: true };
    },
  });
}

export async function deleteHomeEngagementItem(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteHomeEngagementItem",
    resource: "hero",
    permission: "write",
    input: { id },
    schema: idSchema,
    handler: async ({ session }, data) => {
      const { id: recordId } = data as z.infer<typeof idSchema>;
      const existing = await prisma.homeEngagementItem.findFirst({
        where: { id: recordId, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Point introuvable" };

      await softDeleteRecord("homeEngagementItem", recordId);
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "HomeEngagementItem",
        entityId: recordId,
      });
      revalidateHomeEngagement();
      return { success: true };
    },
  });
}

export async function createHomeEvent(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  return runAdminAction({
    name: "createHomeEvent",
    resource: "hero",
    permission: "write",
    schema: homeEventSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof homeEventSchema>;
      const row = await prisma.homeEvent.create({
        data: {
          titleFr: d.titleFr,
          titleAr: d.titleAr,
          descriptionFr: normalizeOptionalText(d.descriptionFr),
          descriptionAr: normalizeOptionalText(d.descriptionAr),
          eventDate: d.eventDate ?? null,
          imageUrl: normalizeOptionalText(d.imageUrl),
          href: normalizeOptionalText(d.href),
          order: d.order,
          isPublished: d.isPublished,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "HomeEvent",
        entityId: row.id,
      });
      revalidateHomeEngagement();
      return { success: true, data: { id: row.id } };
    },
  });
}

export async function updateHomeEvent(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateHomeEvent",
    resource: "hero",
    permission: "write",
    schema: homeEventUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof homeEventUpdateSchema>;
      const existing = await prisma.homeEvent.findFirst({
        where: { id: d.id, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Événement introuvable" };

      const { id, ...rest } = d;
      await prisma.homeEvent.update({
        where: { id },
        data: {
          titleFr: rest.titleFr,
          titleAr: rest.titleAr,
          descriptionFr: normalizeOptionalText(rest.descriptionFr),
          descriptionAr: normalizeOptionalText(rest.descriptionAr),
          eventDate: rest.eventDate ?? null,
          imageUrl: normalizeOptionalText(rest.imageUrl),
          href: normalizeOptionalText(rest.href),
          order: rest.order,
          isPublished: rest.isPublished,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "HomeEvent",
        entityId: id,
      });
      revalidateHomeEngagement();
      return { success: true };
    },
  });
}

export async function deleteHomeEvent(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteHomeEvent",
    resource: "hero",
    permission: "write",
    input: { id },
    schema: idSchema,
    handler: async ({ session }, data) => {
      const { id: recordId } = data as z.infer<typeof idSchema>;
      const existing = await prisma.homeEvent.findFirst({
        where: { id: recordId, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Événement introuvable" };

      await softDeleteRecord("homeEvent", recordId);
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "HomeEvent",
        entityId: recordId,
      });
      revalidateHomeEngagement();
      return { success: true };
    },
  });
}
