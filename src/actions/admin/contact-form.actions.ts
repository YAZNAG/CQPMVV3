"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { softDeleteRecord } from "@/lib/db/soft-delete";
import { idSchema } from "@/lib/validations/formation";
import {
  contactFormFieldSchema,
  contactFormFieldUpdateSchema,
  contactPageSettingsSchema,
} from "@/lib/validations/contact-form";
import {
  ensureUniqueContactFieldKey,
} from "@/services/contact-form.service";
import type { ActionResult } from "@/types";
import { z } from "zod";

function revalidateContact() {
  revalidatePath("/admin/contact");
  revalidatePath("/fr/contact");
  revalidatePath("/ar/contact");
}

function normalizeOptional(value?: string | null) {
  const t = value?.trim();
  return t ? t : null;
}

export async function createContactFormField(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  return runAdminAction({
    name: "createContactFormField",
    resource: "contact",
    permission: "write",
    schema: contactFormFieldSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof contactFormFieldSchema>;
      await ensureUniqueContactFieldKey(d.key);
      const row = await prisma.contactFormField.create({
        data: {
          key: d.key,
          type: d.type,
          labelFr: d.labelFr,
          labelAr: d.labelAr,
          placeholderFr: normalizeOptional(d.placeholderFr),
          placeholderAr: normalizeOptional(d.placeholderAr),
          helpTextFr: normalizeOptional(d.helpTextFr),
          helpTextAr: normalizeOptional(d.helpTextAr),
          options: d.options ?? undefined,
          defaultValue: normalizeOptional(d.defaultValue),
          isRequired: d.isRequired,
          width: d.width,
          order: d.order,
          isPublished: d.isPublished,
          buttonStyle: d.buttonStyle ?? null,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "ContactFormField",
        entityId: row.id,
      });
      revalidateContact();
      return { success: true, data: { id: row.id } };
    },
  });
}

export async function updateContactFormField(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateContactFormField",
    resource: "contact",
    permission: "write",
    schema: contactFormFieldUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof contactFormFieldUpdateSchema>;
      const existing = await prisma.contactFormField.findFirst({
        where: { id: d.id, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Champ introuvable" };
      await ensureUniqueContactFieldKey(d.key, d.id);
      const { id, ...rest } = d;
      await prisma.contactFormField.update({
        where: { id },
        data: {
          key: rest.key,
          type: rest.type,
          labelFr: rest.labelFr,
          labelAr: rest.labelAr,
          placeholderFr: normalizeOptional(rest.placeholderFr),
          placeholderAr: normalizeOptional(rest.placeholderAr),
          helpTextFr: normalizeOptional(rest.helpTextFr),
          helpTextAr: normalizeOptional(rest.helpTextAr),
          options: rest.options ?? undefined,
          defaultValue: normalizeOptional(rest.defaultValue),
          isRequired: rest.isRequired,
          width: rest.width,
          order: rest.order,
          isPublished: rest.isPublished,
          buttonStyle: rest.buttonStyle ?? null,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "ContactFormField",
        entityId: id,
      });
      revalidateContact();
      return { success: true };
    },
  });
}

export async function deleteContactFormField(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteContactFormField",
    resource: "contact",
    permission: "write",
    input: { id },
    schema: idSchema,
    handler: async ({ session }, data) => {
      const { id: recordId } = data as z.infer<typeof idSchema>;
      const existing = await prisma.contactFormField.findFirst({
        where: { id: recordId, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Champ introuvable" };
      await softDeleteRecord("contactFormField", recordId);
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "ContactFormField",
        entityId: recordId,
      });
      revalidateContact();
      return { success: true };
    },
  });
}

export async function updateContactPageSettings(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateContactPageSettings",
    resource: "contact",
    permission: "write",
    schema: contactPageSettingsSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof contactPageSettingsSchema>;
      await prisma.siteSettings.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          email: d.email ?? null,
          phone: d.phone ?? null,
          addressFr: d.addressFr ?? null,
          addressAr: d.addressAr ?? null,
          contactHoursFr: d.contactHoursFr ?? null,
          contactHoursAr: d.contactHoursAr ?? null,
          contactIntroFr: d.contactIntroFr ?? null,
          contactIntroAr: d.contactIntroAr ?? null,
          contactMapUrl: normalizeOptional(d.contactMapUrl),
        },
        update: {
          email: d.email ?? null,
          phone: d.phone ?? null,
          addressFr: d.addressFr ?? null,
          addressAr: d.addressAr ?? null,
          contactHoursFr: d.contactHoursFr ?? null,
          contactHoursAr: d.contactHoursAr ?? null,
          contactIntroFr: d.contactIntroFr ?? null,
          contactIntroAr: d.contactIntroAr ?? null,
          contactMapUrl: normalizeOptional(d.contactMapUrl),
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "SiteSettings",
        entityId: "default",
        metadata: { section: "contactPage" },
      });
      revalidateContact();
      return { success: true };
    },
  });
}
