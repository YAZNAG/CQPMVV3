"use server";

import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { revalidateLocales } from "@/lib/api/revalidate";
import {
  SITE_SECTION_CONFIG,
  SITE_SECTION_KEYS,
  type SiteSectionKey,
} from "@/lib/site-section-publish";
import type { ActionResult } from "@/types";
import { z } from "zod";

const toggleSchema = z.object({
  sectionKey: z.enum(SITE_SECTION_KEYS),
  published: z.boolean(),
});

export async function toggleSiteSectionPublished(
  sectionKey: SiteSectionKey,
  published: boolean
): Promise<ActionResult> {
  const config = SITE_SECTION_CONFIG[sectionKey];

  return runAdminAction({
    name: "toggleSiteSectionPublished",
    resource: config.resource,
    permission: "write",
    schema: toggleSchema,
    input: { sectionKey, published },
    handler: async ({ session }, data) => {
      const { sectionKey: key, published: isPublished } = data as z.infer<
        typeof toggleSchema
      >;
      const { field, revalidatePaths } = SITE_SECTION_CONFIG[key];

      await prisma.siteSettings.upsert({
        where: { id: "default" },
        create: { id: "default", [field]: isPublished },
        update: { [field]: isPublished },
      });

      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "SiteSettings",
        entityId: "default",
        metadata: { section: key, published: isPublished },
      });

      revalidateLocales(revalidatePaths);
      return { success: true };
    },
  });
}
