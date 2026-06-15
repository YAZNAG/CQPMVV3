"use server";

import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { revalidateLocales } from "@/lib/api/revalidate";
import { directorMessageSchema } from "@/lib/validations/director-message";
import type { ActionResult } from "@/types";
import type { z } from "zod";

export async function updateDirectorMessage(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateDirectorMessage",
    resource: "hero",
    permission: "write",
    schema: directorMessageSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof directorMessageSchema>;

      await prisma.siteSettings.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          directorPhotoUrl: d.directorPhotoUrl || null,
          directorQuoteFr: d.directorQuoteFr?.trim() || null,
          directorQuoteAr: d.directorQuoteAr?.trim() || null,
          directorBodyFr: d.directorBodyFr?.trim() || null,
          directorBodyAr: d.directorBodyAr?.trim() || null,
          directorNameFr: d.directorNameFr?.trim() || null,
          directorNameAr: d.directorNameAr?.trim() || null,
          directorTitleFr: d.directorTitleFr?.trim() || null,
          directorTitleAr: d.directorTitleAr?.trim() || null,
          directorMessagePublished: d.directorMessagePublished ?? true,
        },
        update: {
          directorPhotoUrl: d.directorPhotoUrl || null,
          directorQuoteFr: d.directorQuoteFr?.trim() || null,
          directorQuoteAr: d.directorQuoteAr?.trim() || null,
          directorBodyFr: d.directorBodyFr?.trim() || null,
          directorBodyAr: d.directorBodyAr?.trim() || null,
          directorNameFr: d.directorNameFr?.trim() || null,
          directorNameAr: d.directorNameAr?.trim() || null,
          directorTitleFr: d.directorTitleFr?.trim() || null,
          directorTitleAr: d.directorTitleAr?.trim() || null,
          directorMessagePublished: d.directorMessagePublished ?? true,
        },
      });

      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "SiteSettings",
        entityId: "default",
        metadata: { section: "directorMessage" },
      });

      revalidateLocales(["/admin/director", "/admin/pages", "/fr/pages/presentation", "/fr/pages/mot-du-directeur", "/fr", "/ar"]);
      return { success: true };
    },
  });
}
