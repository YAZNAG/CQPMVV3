"use server";

import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { revalidateLocales } from "@/lib/api/revalidate";
import { siteSettingsFormSchema, type SiteSettingsInput } from "@/lib/validations/settings";
import type { ActionResult } from "@/types";
import type { z } from "zod";

export async function updateSiteSettings(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateSiteSettings",
    resource: "settings",
    permission: "write",
    schema: siteSettingsFormSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof siteSettingsFormSchema>;
      const existing = await prisma.siteSettings.findUnique({ where: { id: "default" } });
      await prisma.siteSettings.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          ...normalizeSettings(d),
          taglineFr: "Former les professionnels de la mer de demain",
          taglineAr: "تكوين مهنيي البحر في الغد",
        },
        update: {
          ...normalizeSettings(d),
          taglineFr: existing?.taglineFr,
          taglineAr: existing?.taglineAr,
          heroImageUrl: existing?.heroImageUrl,
        },
      });

      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "SiteSettings",
        entityId: "default",
      });

      revalidateLocales(["/admin", "/admin/settings", "/fr", "/ar"]);
      return { success: true };
    },
  });
}

function normalizeSettings(data: SiteSettingsInput | z.infer<typeof siteSettingsFormSchema>) {
  return {
    siteNameFr: data.siteNameFr,
    siteNameAr: data.siteNameAr,
    email: data.email || null,
    phone: data.phone ?? null,
    addressFr: data.addressFr ?? null,
    addressAr: data.addressAr ?? null,
    logoUrl: data.logoUrl || null,
    aboutImageUrl: data.aboutImageUrl || null,
    aboutPresentationFr: data.aboutPresentationFr?.trim() || null,
    aboutPresentationAr: data.aboutPresentationAr?.trim() || null,
    missionFr: data.missionFr?.trim() || null,
    missionAr: data.missionAr?.trim() || null,
  };
}
