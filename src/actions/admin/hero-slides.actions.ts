"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { softDeleteRecord } from "@/lib/db/soft-delete";
import { heroSlideSchema, heroSlideUpdateSchema } from "@/lib/validations/hero-slide";
import { idSchema } from "@/lib/validations/formation";
import type { ActionResult } from "@/types";
import { z } from "zod";

function revalidateHeroSlides() {
  revalidatePath("/admin/hero");
  revalidatePath("/fr");
  revalidatePath("/ar");
}

export async function createHeroSlide(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  return runAdminAction({
    name: "createHeroSlide",
    resource: "hero",
    permission: "write",
    schema: heroSlideSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof heroSlideSchema>;
      const row = await prisma.heroSlide.create({
        data: {
          titleFr: d.titleFr,
          titleAr: d.titleAr,
          subtitleFr: d.subtitleFr,
          subtitleAr: d.subtitleAr,
          imageUrl: d.imageUrl,
          buttons: d.buttons,
          order: d.order,
          isPublished: d.isPublished,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "HeroSlide",
        entityId: row.id,
      });
      revalidateHeroSlides();
      return { success: true, data: { id: row.id } };
    },
  });
}

export async function updateHeroSlide(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateHeroSlide",
    resource: "hero",
    permission: "write",
    schema: heroSlideUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof heroSlideUpdateSchema>;
      const existing = await prisma.heroSlide.findFirst({
        where: { id: d.id, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Slide introuvable" };

      const { id, ...rest } = d;
      await prisma.heroSlide.update({
        where: { id },
        data: {
          titleFr: rest.titleFr,
          titleAr: rest.titleAr,
          subtitleFr: rest.subtitleFr,
          subtitleAr: rest.subtitleAr,
          imageUrl: rest.imageUrl,
          buttons: rest.buttons,
          order: rest.order,
          isPublished: rest.isPublished,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "HeroSlide",
        entityId: id,
      });
      revalidateHeroSlides();
      return { success: true };
    },
  });
}

export async function deleteHeroSlide(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteHeroSlide",
    resource: "hero",
    permission: "write",
    input: { id },
    schema: idSchema,
    handler: async ({ session }, data) => {
      const { id: slideId } = data as z.infer<typeof idSchema>;
      const existing = await prisma.heroSlide.findFirst({
        where: { id: slideId, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Slide introuvable" };

      await softDeleteRecord("heroSlide", slideId);
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "HeroSlide",
        entityId: slideId,
      });
      revalidateHeroSlides();
      return { success: true };
    },
  });
}
