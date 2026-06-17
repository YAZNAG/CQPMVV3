"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { prisma } from "@/lib/db";
import { softDeleteRecord } from "@/lib/db/soft-delete";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import type { ActionResult } from "@/types";
import {
  documentCategorySchema,
  documentCategoryUpdateSchema,
  documentSchema,
  documentUpdateSchema,
  documentIdSchema,
} from "@/lib/validations/document";

function norm(v: string | null | undefined): string | null {
  if (v == null) return null;
  const s = v.trim();
  return s.length > 0 ? s : null;
}

function revalidateDocuments() {
  revalidatePath("/admin/documents");
  for (const locale of ["fr", "ar"] as const) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/telechargements`);
  }
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function createDocumentCategory(input: unknown): Promise<ActionResult<{ id: string }>> {
  return runAdminAction({
    name: "createDocumentCategory",
    resource: "pages",
    permission: "write",
    schema: documentCategorySchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof documentCategorySchema>;
      const existing = await prisma.documentCategory.findFirst({
        where: { slug: d.slug, deletedAt: null },
      });
      if (existing) return { success: false, error: "Ce slug existe déjà" };
      const row = await prisma.documentCategory.create({
        data: {
          nameFr: d.nameFr,
          nameAr: d.nameAr,
          slug: d.slug,
          descriptionFr: norm(d.descriptionFr),
          descriptionAr: norm(d.descriptionAr),
          isActive: d.isActive,
          sortOrder: d.sortOrder,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "DocumentCategory",
        entityId: row.id,
      });
      revalidatePath("/admin/documents/categories");
      return { success: true, data: { id: row.id } };
    },
  });
}

export async function updateDocumentCategory(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateDocumentCategory",
    resource: "pages",
    permission: "write",
    schema: documentCategoryUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof documentCategoryUpdateSchema>;
      const existing = await prisma.documentCategory.findFirst({
        where: { id: d.id, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Catégorie introuvable" };
      const slugConflict = await prisma.documentCategory.findFirst({
        where: { slug: d.slug, deletedAt: null, NOT: { id: d.id } },
      });
      if (slugConflict) return { success: false, error: "Ce slug existe déjà" };
      await prisma.documentCategory.update({
        where: { id: d.id },
        data: {
          nameFr: d.nameFr,
          nameAr: d.nameAr,
          slug: d.slug,
          descriptionFr: norm(d.descriptionFr),
          descriptionAr: norm(d.descriptionAr),
          isActive: d.isActive,
          sortOrder: d.sortOrder,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "DocumentCategory",
        entityId: d.id,
      });
      revalidatePath("/admin/documents/categories");
      revalidateDocuments();
      return { success: true };
    },
  });
}

export async function deleteDocumentCategory(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteDocumentCategory",
    resource: "pages",
    permission: "write",
    input: { id },
    schema: documentIdSchema,
    handler: async ({ session }, data) => {
      const { id: catId } = data as z.infer<typeof documentIdSchema>;
      const existing = await prisma.documentCategory.findFirst({
        where: { id: catId, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Catégorie introuvable" };
      const docCount = await prisma.document.count({
        where: { categoryId: catId, deletedAt: null },
      });
      if (docCount > 0)
        return { success: false, error: `Cette catégorie contient ${docCount} document(s). Supprimez-les d'abord.` };
      await softDeleteRecord("documentCategory", catId);
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "DocumentCategory",
        entityId: catId,
      });
      revalidatePath("/admin/documents/categories");
      revalidateDocuments();
      return { success: true };
    },
  });
}

// ─── Documents ───────────────────────────────────────────────────────────────

export async function createDocument(input: unknown): Promise<ActionResult<{ id: string }>> {
  return runAdminAction({
    name: "createDocument",
    resource: "pages",
    permission: "write",
    schema: documentSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof documentSchema>;
      const row = await prisma.document.create({
        data: {
          titleFr: d.titleFr,
          titleAr: norm(d.titleAr),
          descriptionFr: norm(d.descriptionFr),
          descriptionAr: norm(d.descriptionAr),
          categoryId: d.categoryId ?? null,
          fileUrl: d.fileUrl,
          fileName: d.fileName,
          fileType: d.fileType,
          fileSize: d.fileSize,
          status: d.status,
          publishedAt:
            d.status === "PUBLISHED"
              ? (d.publishedAt ?? new Date())
              : (d.publishedAt ?? null),
          sortOrder: d.sortOrder,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "Document",
        entityId: row.id,
      });
      revalidateDocuments();
      return { success: true, data: { id: row.id } };
    },
  });
}

export async function updateDocument(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateDocument",
    resource: "pages",
    permission: "write",
    schema: documentUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof documentUpdateSchema>;
      const existing = await prisma.document.findFirst({
        where: { id: d.id, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Document introuvable" };
      await prisma.document.update({
        where: { id: d.id },
        data: {
          titleFr: d.titleFr,
          titleAr: norm(d.titleAr),
          descriptionFr: norm(d.descriptionFr),
          descriptionAr: norm(d.descriptionAr),
          categoryId: d.categoryId ?? null,
          fileUrl: d.fileUrl,
          fileName: d.fileName,
          fileType: d.fileType,
          fileSize: d.fileSize,
          status: d.status,
          publishedAt:
            d.status === "PUBLISHED" && !existing.publishedAt
              ? new Date()
              : (d.publishedAt ?? existing.publishedAt),
          sortOrder: d.sortOrder,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "Document",
        entityId: d.id,
      });
      revalidateDocuments();
      return { success: true };
    },
  });
}

export async function deleteDocument(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteDocument",
    resource: "pages",
    permission: "write",
    input: { id },
    schema: documentIdSchema,
    handler: async ({ session }, data) => {
      const { id: docId } = data as z.infer<typeof documentIdSchema>;
      const existing = await prisma.document.findFirst({
        where: { id: docId, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Document introuvable" };
      await softDeleteRecord("document", docId);
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "Document",
        entityId: docId,
      });
      revalidateDocuments();
      return { success: true };
    },
  });
}

export async function toggleDocumentStatus(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "toggleDocumentStatus",
    resource: "pages",
    permission: "write",
    input: { id },
    schema: documentIdSchema,
    handler: async ({ session }, data) => {
      const { id: docId } = data as z.infer<typeof documentIdSchema>;
      const existing = await prisma.document.findFirst({
        where: { id: docId, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Document introuvable" };
      const newStatus = existing.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
      await prisma.document.update({
        where: { id: docId },
        data: {
          status: newStatus,
          publishedAt:
            newStatus === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "STATUS_CHANGE",
        entity: "Document",
        entityId: docId,
        metadata: { status: newStatus },
      });
      revalidateDocuments();
      return { success: true };
    },
  });
}
