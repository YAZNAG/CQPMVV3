"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { idSchema } from "@/lib/validations/formation";
import type { ActionResult } from "@/types";
import { z } from "zod";

export async function markContactMessageRead(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "markContactMessageRead",
    resource: "contact",
    permission: "write",
    input: { id },
    schema: idSchema,
    handler: async ({ session }, data) => {
      const { id: messageId } = data as z.infer<typeof idSchema>;
      await prisma.contactMessage.update({
        where: { id: messageId, deletedAt: null },
        data: { isRead: true, readAt: new Date() },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "ContactMessage",
        entityId: messageId,
        metadata: { isRead: true },
      });
      revalidatePath("/admin/contact");
      revalidatePath("/admin");
      return { success: true };
    },
  });
}

export async function markAllContactMessagesRead(): Promise<ActionResult> {
  return runAdminAction({
    name: "markAllContactMessagesRead",
    resource: "contact",
    permission: "write",
    handler: async ({ session }) => {
      await prisma.contactMessage.updateMany({
        where: { isRead: false, deletedAt: null },
        data: { isRead: true, readAt: new Date() },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "ContactMessage",
        metadata: { markAllRead: true },
      });
      revalidatePath("/admin/contact");
      revalidatePath("/admin");
      return { success: true };
    },
  });
}

export async function deleteContactMessage(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteContactMessage",
    resource: "contact",
    permission: "write",
    input: { id },
    schema: idSchema,
    handler: async ({ session }, data) => {
      const { id: messageId } = data as z.infer<typeof idSchema>;
      await prisma.contactMessage.update({
        where: { id: messageId },
        data: { deletedAt: new Date() },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "ContactMessage",
        entityId: messageId,
      });
      revalidatePath("/admin/contact");
      return { success: true };
    },
  });
}
