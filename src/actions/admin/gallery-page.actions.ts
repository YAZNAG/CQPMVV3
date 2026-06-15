"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { galleryPageHeroSchema } from "@/lib/validations/gallery-page";
import type { ActionResult } from "@/types";

function revalidateGalleryPages() {
  revalidatePath("/admin/gallery");
  for (const locale of ["fr", "ar"] as const) {
    revalidatePath(`/${locale}/gallery`);
    revalidatePath(`/${locale}/gallery/photos`);
    revalidatePath(`/${locale}/gallery/videos`);
  }
}

export async function updateGalleryPageHero(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateGalleryPageHero",
    resource: "gallery",
    permission: "write",
    schema: galleryPageHeroSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof galleryPageHeroSchema>;
      const heroUrl = d.heroBackgroundUrl || null;

      if (d.page === "photos") {
        await prisma.siteSettings.update({
          where: { id: "default" },
          data: {
            galleryPhotosTitleFr: d.titleFr,
            galleryPhotosTitleAr: d.titleAr,
            galleryPhotosSubtitleFr: d.subtitleFr,
            galleryPhotosSubtitleAr: d.subtitleAr,
            galleryPhotosHeroBackgroundUrl: heroUrl,
          },
        });
      } else {
        await prisma.siteSettings.update({
          where: { id: "default" },
          data: {
            galleryVideosTitleFr: d.titleFr,
            galleryVideosTitleAr: d.titleAr,
            galleryVideosSubtitleFr: d.subtitleFr,
            galleryVideosSubtitleAr: d.subtitleAr,
            galleryVideosHeroBackgroundUrl: heroUrl,
          },
        });
      }

      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "SiteSettings",
        entityId: "default",
        metadata: { section: "gallery", page: d.page },
      });

      revalidateGalleryPages();
      return { success: true };
    },
  });
}
