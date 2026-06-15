"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { softDeleteRecord } from "@/lib/db/soft-delete";
import { slugify } from "@/lib/utils";
import { idSchema } from "@/lib/validations/formation";
import { sitePageSchema, sitePageUpdateSchema } from "@/lib/validations/site-page";
import {
  ensureUniqueSitePageSlug,
  sitePageHref,
} from "@/services/site-page.service";
import type { ActionResult } from "@/types";
import { z } from "zod";

function revalidateSitePages(slug?: string) {
  revalidatePath("/admin/pages");
  revalidatePath("/admin/navigation");
  revalidatePath("/fr");
  revalidatePath("/ar");
  if (slug) {
    revalidatePath(`/fr/pages/${slug}`);
    revalidatePath(`/ar/pages/${slug}`);
  }
}

function resolveSlug(inputSlug: string | undefined, titleFr: string) {
  const base = inputSlug?.trim() || slugify(titleFr);
  return base || "page";
}

async function maybeCreateNavigationLink(
  data: {
    titleFr: string;
    titleAr: string;
    slug: string;
    addToNavigation?: boolean;
    navigationParentId?: string | null;
  },
  order: number
) {
  if (!data.addToNavigation) return;

  const href = sitePageHref(data.slug);
  const existing = await prisma.navigationItem.findFirst({
    where: { href, deletedAt: null },
  });
  if (existing) return;

  const navCount = await prisma.navigationItem.count({
    where: { deletedAt: null, itemType: "LINK" },
  });

  await prisma.navigationItem.create({
    data: {
      labelFr: data.titleFr,
      labelAr: data.titleAr,
      href,
      location: "HEADER",
      itemType: "LINK",
      order: navCount,
      isPublished: true,
      exactMatch: false,
      openInNewTab: false,
      parentId: data.navigationParentId ?? null,
    },
  });
}

export async function createSitePage(
  input: unknown
): Promise<ActionResult<{ id: string; slug: string }>> {
  return runAdminAction({
    name: "createSitePage",
    resource: "pages",
    permission: "write",
    schema: sitePageSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof sitePageSchema>;
      const slug = await ensureUniqueSitePageSlug(resolveSlug(d.slug, d.titleFr));

      const row = await prisma.sitePage.create({
        data: {
          slug,
          titleFr: d.titleFr,
          titleAr: d.titleAr,
          excerptFr: d.excerptFr?.trim() || null,
          excerptAr: d.excerptAr?.trim() || null,
          contentFr: d.contentFr,
          contentAr: d.contentAr,
          coverImageUrl: d.coverImageUrl?.trim() || null,
          isPublished: d.isPublished,
          order: d.order,
        },
      });

      if (d.isPublished) {
        await maybeCreateNavigationLink({ ...d, slug }, d.order);
      }

      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "SitePage",
        entityId: row.id,
      });
      revalidateSitePages(slug);
      return { success: true, data: { id: row.id, slug } };
    },
  });
}

export async function updateSitePage(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateSitePage",
    resource: "pages",
    permission: "write",
    schema: sitePageUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof sitePageUpdateSchema>;
      const existing = await prisma.sitePage.findFirst({
        where: { id: d.id, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Page introuvable" };

      const slug = await ensureUniqueSitePageSlug(
        resolveSlug(d.slug, d.titleFr),
        d.id
      );

      await prisma.sitePage.update({
        where: { id: d.id },
        data: {
          slug,
          titleFr: d.titleFr,
          titleAr: d.titleAr,
          excerptFr: d.excerptFr?.trim() || null,
          excerptAr: d.excerptAr?.trim() || null,
          contentFr: d.contentFr,
          contentAr: d.contentAr,
          coverImageUrl: d.coverImageUrl?.trim() || null,
          isPublished: d.isPublished,
          order: d.order,
        },
      });

      if (d.isPublished && d.addToNavigation) {
        await maybeCreateNavigationLink({ ...d, slug }, d.order);
      }

      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "SitePage",
        entityId: d.id,
      });
      revalidateSitePages(slug);
      return { success: true };
    },
  });
}

export async function deleteSitePage(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteSitePage",
    resource: "pages",
    permission: "write",
    input: { id },
    schema: idSchema,
    handler: async ({ session }, data) => {
      const { id: pageId } = data as z.infer<typeof idSchema>;
      const existing = await prisma.sitePage.findFirst({
        where: { id: pageId, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Page introuvable" };

      await softDeleteRecord("sitePage", pageId, { slug: existing.slug });
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "SitePage",
        entityId: pageId,
      });
      revalidateSitePages(existing.slug);
      return { success: true };
    },
  });
}
