"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { softDeleteRecord } from "@/lib/db/soft-delete";
import {
  testimonialSchema,
  testimonialUpdateSchema,
} from "@/lib/validations/testimonial";
import { idSchema } from "@/lib/validations/formation";
import type { ActionResult } from "@/types";
import { z } from "zod";

function revalidateTestimonials() {
  revalidatePath("/admin/testimonials");
  revalidatePath("/fr");
  revalidatePath("/ar");
}

export async function createTestimonial(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  return runAdminAction({
    name: "createTestimonial",
    resource: "testimonials",
    permission: "write",
    schema: testimonialSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof testimonialSchema>;
      const row = await prisma.testimonial.create({ data: d });
      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "Testimonial",
        entityId: row.id,
      });
      revalidateTestimonials();
      return { success: true, data: { id: row.id } };
    },
  });
}

export async function updateTestimonial(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateTestimonial",
    resource: "testimonials",
    permission: "write",
    schema: testimonialUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof testimonialUpdateSchema>;
      const existing = await prisma.testimonial.findFirst({
        where: { id: d.id, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Témoignage introuvable" };

      const { id, ...rest } = d;
      await prisma.testimonial.update({ where: { id }, data: rest });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "Testimonial",
        entityId: id,
      });
      revalidateTestimonials();
      return { success: true };
    },
  });
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteTestimonial",
    resource: "testimonials",
    permission: "write",
    input: { id },
    schema: idSchema,
    handler: async ({ session }, data) => {
      const { id: testimonialId } = data as z.infer<typeof idSchema>;
      const existing = await prisma.testimonial.findFirst({
        where: { id: testimonialId, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Témoignage introuvable" };

      await softDeleteRecord("testimonial", testimonialId);
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "Testimonial",
        entityId: testimonialId,
      });
      revalidateTestimonials();
      return { success: true };
    },
  });
}
