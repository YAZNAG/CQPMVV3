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
  downloadResourceSchema,
  downloadResourceUpdateSchema,
  downloadsSectionSchema,
} from "@/lib/validations/download";

function normalizeOptionalText(value: string | null | undefined) {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function revalidateDownloads(slug?: string) {
  revalidatePath("/admin/downloads");
  for (const locale of ["fr", "ar"] as const) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/pages/presentation`);
    revalidatePath(`/${locale}/telechargements`);
    if (slug) revalidatePath(`/${locale}/telechargements/${slug}`);
  }
}

export async function updateDownloadsSection(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateDownloadsSection",
    resource: "pages",
    permission: "write",
    schema: downloadsSectionSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof downloadsSectionSchema>;
      await prisma.siteSettings.update({
        where: { id: "default" },
        data: d,
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "SiteSettings",
        entityId: "default",
        metadata: { section: "downloads" },
      });
      revalidateDownloads();
      return { success: true };
    },
  });
}

export async function createDownloadResource(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  return runAdminAction({
    name: "createDownloadResource",
    resource: "pages",
    permission: "write",
    schema: downloadResourceSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof downloadResourceSchema>;
      const existing = await prisma.downloadResource.findFirst({
        where: { slug: d.slug, deletedAt: null },
      });
      if (existing) return { success: false, error: "Ce slug existe déjà" };

      const row = await prisma.downloadResource.create({
        data: {
          slug: d.slug,
          titleFr: d.titleFr,
          titleAr: d.titleAr,
          infoLabelFr: normalizeOptionalText(d.infoLabelFr),
          infoLabelAr: normalizeOptionalText(d.infoLabelAr),
          excerptFr: normalizeOptionalText(d.excerptFr),
          excerptAr: normalizeOptionalText(d.excerptAr),
          contentFr: d.contentFr,
          contentAr: d.contentAr,
          icon: d.icon,
          actionType: d.actionType,
          fileUrl: normalizeOptionalText(d.fileUrl),
          order: d.order,
          isPublished: d.isPublished,
        },
      });

      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "DownloadResource",
        entityId: row.id,
      });
      revalidateDownloads(row.slug);
      return { success: true, data: { id: row.id } };
    },
  });
}

export async function updateDownloadResource(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateDownloadResource",
    resource: "pages",
    permission: "write",
    schema: downloadResourceUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof downloadResourceUpdateSchema>;
      const existing = await prisma.downloadResource.findFirst({
        where: { id: d.id, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Document introuvable" };

      const slugConflict = await prisma.downloadResource.findFirst({
        where: { slug: d.slug, deletedAt: null, NOT: { id: d.id } },
      });
      if (slugConflict) return { success: false, error: "Ce slug existe déjà" };

      const { id, ...rest } = d;
      await prisma.downloadResource.update({
        where: { id },
        data: {
          slug: rest.slug,
          titleFr: rest.titleFr,
          titleAr: rest.titleAr,
          infoLabelFr: normalizeOptionalText(rest.infoLabelFr),
          infoLabelAr: normalizeOptionalText(rest.infoLabelAr),
          excerptFr: normalizeOptionalText(rest.excerptFr),
          excerptAr: normalizeOptionalText(rest.excerptAr),
          contentFr: rest.contentFr,
          contentAr: rest.contentAr,
          icon: rest.icon,
          actionType: rest.actionType,
          fileUrl: normalizeOptionalText(rest.fileUrl),
          order: rest.order,
          isPublished: rest.isPublished,
        },
      });

      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "DownloadResource",
        entityId: id,
      });
      revalidateDownloads(existing.slug);
      if (existing.slug !== rest.slug) revalidateDownloads(rest.slug);
      return { success: true };
    },
  });
}

export async function deleteDownloadResource(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteDownloadResource",
    resource: "pages",
    permission: "write",
    input: { id },
    schema: idSchema,
    handler: async ({ session }, data) => {
      const { id: recordId } = data as z.infer<typeof idSchema>;
      const existing = await prisma.downloadResource.findFirst({
        where: { id: recordId, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Document introuvable" };

      await softDeleteRecord("downloadResource", recordId);
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "DownloadResource",
        entityId: recordId,
      });
      revalidateDownloads(existing.slug);
      return { success: true };
    },
  });
}
