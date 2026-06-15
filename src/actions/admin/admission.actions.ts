"use server";

import { revalidatePath } from "next/cache";
import type { ApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { reviewApplicationSchema } from "@/lib/validations/admission";
import { idSchema } from "@/lib/validations/formation";
import { notifyApplicationStatusChanged } from "@/lib/email/send";
import type { ActionResult } from "@/types";
import type { ReviewApplicationInput } from "@/lib/validations/admission";
import { z } from "zod";

export async function reviewApplication(
  input: unknown
): Promise<ActionResult<{ status: ApplicationStatus }>> {
  return runAdminAction({
    name: "reviewApplication",
    resource: "admissions",
    permission: "write",
    schema: reviewApplicationSchema,
    input,
    handler: async ({ session }, data) => {
      const { id, status, statusNote, sendEmail } = data as ReviewApplicationInput;

      const existing = await prisma.application.findFirst({
        where: { id, deletedAt: null },
        include: { formation: true },
      });
      if (!existing) {
        return { success: false, error: "Candidature introuvable" };
      }

      const statusChanged = existing.status !== status;
      const updated = await prisma.application.update({
        where: { id },
        data: {
          status,
          statusNote: statusNote?.trim() || null,
          reviewedAt: new Date(),
          reviewedById: session.user.id,
        },
        include: { formation: true },
      });

      await createAuditLog({
        userId: session.user.id,
        action: "STATUS_CHANGE",
        entity: "Application",
        entityId: id,
        metadata: { from: existing.status, to: status, statusNote: statusNote ?? null },
      });

      if (sendEmail && statusChanged) {
        await notifyApplicationStatusChanged({
          email: updated.email,
          firstName: updated.firstName,
          referenceNumber: updated.referenceNumber,
          formationTitle: updated.formation.titleFr,
          status: updated.status,
          statusNote: updated.statusNote,
        }).catch(() => undefined);
      }

      revalidatePath("/admin/admissions");
      revalidatePath(`/admin/admissions/${id}`);
      return { success: true, data: { status: updated.status } };
    },
  });
}

/** @deprecated Use reviewApplication */
export async function updateApplicationStatus(formData: FormData) {
  await reviewApplication({
    id: formData.get("id") as string,
    status: formData.get("status") as ApplicationStatus,
    sendEmail: true,
  });
}

export async function softDeleteApplication(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "softDeleteApplication",
    resource: "admissions",
    permission: "write",
    input: { id },
    schema: idSchema,
    handler: async ({ session }, data) => {
      const { id: applicationId } = data as z.infer<typeof idSchema>;
      const existing = await prisma.application.findFirst({
        where: { id: applicationId, deletedAt: null },
      });
      if (!existing) {
        return { success: false, error: "Candidature introuvable" };
      }

      await prisma.application.update({
        where: { id: applicationId },
        data: { deletedAt: new Date() },
      });

      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "Application",
        entityId: applicationId,
      });

      revalidatePath("/admin/admissions");
      return { success: true };
    },
  });
}
